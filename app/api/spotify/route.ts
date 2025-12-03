export const dynamic = "force-dynamic"

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64")
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`

const getAccessToken = async (retries = 3): Promise<any> => {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refresh_token!,
        }),
        cache: "no-store",
      })

      if (response.ok) {
        return response.json()
      }

      // Log the error for debugging
      const errorBody = await response.text()
      console.error(`[v0] Spotify token fetch failed (attempt ${i + 1}/${retries}):`, {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      })

      // If not the last retry, wait with exponential backoff
      if (i < retries - 1) {
        const delay = 1000 * Math.pow(2, i) // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`[v0] Spotify token fetch error (attempt ${i + 1}/${retries}):`, error)
      lastError = error as Error

      // If not the last retry, wait with exponential backoff
      if (i < retries - 1) {
        const delay = 1000 * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Failed to get access token after retries")
}

export async function GET() {
  try {
    const { access_token } = await getAccessToken()

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store",
    })

    if (response.status === 204 || response.status > 400) {
      return Response.json({ isPlaying: false })
    }

    const song = await response.json()

    if (song.item === null) {
      return Response.json({ isPlaying: false })
    }

    const isPlaying = song.is_playing
    const title = song.item.name
    const artist = song.item.artists.map((_artist: any) => _artist.name).join(", ")
    const album = song.item.album.name
    const albumImageUrl = song.item.album.images[0].url
    const songUrl = song.item.external_urls.spotify
    const progressMs = song.progress_ms
    const durationMs = song.item.duration_ms

    return Response.json({
      album,
      albumImageUrl,
      artist,
      isPlaying,
      songUrl,
      title,
      progressMs,
      durationMs,
    })
  } catch (error) {
    console.error("[v0] Spotify API error:", error)
    return Response.json({
      isPlaying: false,
      error: "Spotify service temporarily unavailable",
    })
  }
}
