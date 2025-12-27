"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Script from "next/script"
import { useMobile } from "@/hooks/use-mobile"

type SpotifyData = {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
  progressMs?: number
  durationMs?: number
}

export default function Home() {
  const [discordId, setDiscordId] = useState("")
  const [result, setResult] = useState("")
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [spotifyData, setSpotifyData] = useState<SpotifyData>({ isPlaying: false })
  const [localProgress, setLocalProgress] = useState(0)
  const [currentSongUrl, setCurrentSongUrl] = useState<string | undefined>(undefined)
  const [pageViews, setPageViews] = useState<number | null>(null)
  const [typedText, setTypedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isDvdHovered, setIsDvdHovered] = useState(false)
  const hasIncrementedViews = useRef(false)
  const isMobile = useMobile()

  const messages = [
    { text: "I AM TAY", style: "normal" },
    { text: "TAY LOVES MUSIC", style: "pink-loves", splitAt: "TAY LOVES" },
    { text: "TAY IS COOL", style: "green-check" },
    { text: "TAY IS BAD", style: "red-x" },
    { text: "TAY IS NOT A FURRY", style: "red-not", splitAt: "TAY IS NOT" },
    { text: "TAY IS LIFE", style: "glow" },
    { text: "TAY IS NOT DIDDY", style: "red-not", splitAt: "TAY IS NOT" },
    { text: "TAY LOVES BLM", style: "pink-loves", splitAt: "TAY LOVES" },
  ]

  useEffect(() => {
    const tabTitle = "Tay wacky and goofy website"
    let currentIndex = 0
    let isDeleting = false

    const typeDeleteInterval = setInterval(
      () => {
        if (!isDeleting) {
          // Typing phase
          if (currentIndex <= tabTitle.length) {
            document.title = tabTitle.slice(0, currentIndex) + "|"
            currentIndex++
          } else {
            // Pause briefly then start deleting
            setTimeout(() => {
              isDeleting = true
            }, 2000)
          }
        } else {
          // Deleting phase
          if (currentIndex > 0) {
            currentIndex--
            document.title = tabTitle.slice(0, currentIndex) + "|"
          } else {
            // Start typing again
            isDeleting = false
          }
        }
      },
      isDeleting ? 50 : 150,
    )

    return () => {
      clearInterval(typeDeleteInterval)
      document.title = tabTitle
    }
  }, [])

  useEffect(() => {
    const currentMessage = messages[messageIndex].text
    const typingSpeed = 100
    const deletingSpeed = 50
    const pauseTime = 2000

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (typedText.length < currentMessage.length) {
            setTypedText(currentMessage.slice(0, typedText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), pauseTime)
          }
        } else {
          if (typedText.length > 0) {
            setTypedText(typedText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setMessageIndex((prev) => (prev + 1) % messages.length)
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    )

    return () => clearTimeout(timer)
  }, [typedText, isDeleting, messageIndex])

  useEffect(() => {
    const fetchSpotify = async () => {
      try {
        const response = await fetch("/api/spotify")
        const data = await response.json()
        setSpotifyData(data)
        if (data.songUrl !== currentSongUrl) {
          setCurrentSongUrl(data.songUrl)
          setLocalProgress(data.progressMs || 0)
        }
      } catch (error) {
        console.error("Error fetching Spotify data:", error)
      }
    }

    fetchSpotify()
    const spotifyInterval = setInterval(fetchSpotify, 10000)

    const progressInterval = setInterval(() => {
      setLocalProgress((prev) => {
        if (!spotifyData.isPlaying || !spotifyData.durationMs) return prev
        const newProgress = prev + 1000
        return newProgress <= spotifyData.durationMs ? newProgress : prev
      })
    }, 1000)

    const incrementPageViews = async () => {
      if (hasIncrementedViews.current) {
        return
      }
      hasIncrementedViews.current = true

      try {
        const response = await fetch("/api/views")
        const data = await response.json()
        setPageViews(data.views)
      } catch (error) {
        console.error("Error fetching page views:", error)
      }
    }

    incrementPageViews()

    return () => {
      clearInterval(spotifyInterval)
      clearInterval(progressInterval)
    }
  }, [spotifyData.isPlaying, spotifyData.durationMs, currentSongUrl])

  const checkId = () => {
    const currentIds = ["1346646019693215744", "1385734267627245569"]
    const oldIds = ["1334528441445257318", "1326545308657782828", "1310761016144957461", "1314010017459863582"]

    if (currentIds.includes(discordId.trim())) {
      setResult("THIS IS ME")
    } else if (oldIds.includes(discordId.trim())) {
      setResult("THIS IS OLD LOL")
    } else {
      setResult("THIS IS NOT ME :(")
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const renderStyledText = () => {
    const message = messages[messageIndex]
    const text = typedText
    const style = message.style
    const splitAt = message.splitAt
    const full = message.text

    // Check if this message starts with "TAY"
    const startsWithTay = full.startsWith("TAY")

    // Handle messages that don't start with TAY or are too short
    if (!startsWithTay || text.length < 3) {
      if (style === "green-check") return <span className="text-green-400">{text}</span>
      if (style === "red-x") return <span className="text-red-400">{text}</span>
      if (style === "glow")
        return (
          <span
            className="text-white"
            style={{
              textShadow:
                "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)",
            }}
          >
            {text}
          </span>
        )
      return <span className="text-white">{text}</span>
    }

    // Split into TAY and everything else (only for messages starting with TAY)
    const tay = text.substring(0, 3)
    const rest = text.substring(3)

    if (style === "glow") {
      return (
        <span
          className="text-white"
          style={{
            textShadow:
              "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)",
          }}
        >
          {text}
        </span>
      )
    }

    if (style === "green-check") {
      return (
        <span className="text-green-400">
          <span className="text-white">{tay}</span>
          {rest}
          {text === full && " ✓"}
        </span>
      )
    }

    if (style === "red-x") {
      return (
        <span className="text-red-400">
          <span className="text-white">{tay}</span>
          {rest}
          {text === full && " ✗"}
        </span>
      )
    }

    if ((style === "red-not" || style === "pink-loves") && splitAt) {
      const splitLength = splitAt.length
      const afterTay = text.substring(3, splitLength)
      const remaining = text.substring(splitLength)

      return (
        <>
          <span className="text-white">{tay}</span>
          <span className={style === "red-not" ? "text-red-400" : "text-pink-400"}>{afterTay}</span>
          <span className="text-white">{remaining}</span>
        </>
      )
    }

    // Default case for normal style
    return (
      <>
        <span className="text-white">{tay}</span>
        <span className="text-white">{rest}</span>
      </>
    )
  }

  return (
    <>
      <Script
        src="https://assets.guns.lol/guns_storm.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && (window as any).snowStorm) {
            const snowStorm = (window as any).snowStorm
            snowStorm.snowColor = "#93c5fd"
            snowStorm.flakesMaxActive = 80
            snowStorm.useTwinkleEffect = true
            snowStorm.autoStart = true
            snowStorm.freezeOnBlur = false
            snowStorm.excludeMobile = false
          }
        }}
      />

      <div
        className="fixed z-50 top-5 right-5 pointer-events-auto cursor-pointer transition-all duration-300"
        style={{
          animationName: "spin",
          animationDuration: "8s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: isDvdHovered ? "paused" : "running",
          opacity: isDvdHovered ? 0.9 : 0.4,
          filter: isDvdHovered
            ? "drop-shadow(0 0 5px rgba(255,255,255,0.4)) drop-shadow(0 0 10px rgba(147,197,253,0.3))"
            : "none",
        }}
        onMouseEnter={() => setIsDvdHovered(true)}
        onMouseLeave={() => setIsDvdHovered(false)}
        onClick={() => window.open("https://en.wikipedia.org/wiki/Stitch_(Lilo_%26_Stitch)", "_blank")}
      >
        <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gradient-to-br from-blue-600/80 to-purple-600/80 backdrop-blur-sm border-2 border-white/20 shadow-lg">
          <Image src="/images/image.png" alt="DVD Logo" width={80} height={80} className="object-cover opacity-90" />
        </div>
      </div>

      <main className="min-h-[100dvh] flex items-center justify-center p-8 relative bg-gradient-to-br from-black via-slate-900 to-blue-950 font-sans overflow-hidden">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-10 text-white min-h-[3rem] flex items-center whitespace-pre">
            {renderStyledText()}
            <span className="animate-pulse ml-1">|</span>
          </h1>

          <div className="w-full max-w-md bg-slate-900/20 backdrop-blur-sm p-8 rounded-lg border border-white/10">
            <label className="block text-sm font-medium mb-2 text-white">Enter Discord ID:</label>
            <input
              type="text"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="Paste Discord ID here..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              onClick={checkId}
              className="w-full px-6 py-3 bg-blue-600/10 text-white font-medium rounded-md border border-blue-500/50 hover:bg-blue-600/20 transition-colors"
            >
              Check ID
            </button>
            <p className="text-xs text-gray-300 mt-4 text-center">
              YO I lowkey be getting banned ALOT, I will ALWAYS have my updated discord here twin
            </p>
            {result && (
              <p
                className={`mt-6 text-center text-lg font-bold ${
                  result === "THIS IS ME" ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {result}
              </p>
            )}
          </div>
        </div>

        {isMobile ? (
          <div className="fixed top-5 left-5 z-20">
            {spotifyData.isPlaying && spotifyData.albumImageUrl ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={spotifyData.albumImageUrl || "/placeholder.svg"}
                  alt={spotifyData.album || "Album cover"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="fixed right-0 top-1/2 -translate-y-1/2 w-80 bg-slate-900/20 backdrop-blur-sm p-6 rounded-l-lg border-l border-t border-b border-white/10">
            {spotifyData.isPlaying && spotifyData.title ? (
              <div className="space-y-4">
                {spotifyData.albumImageUrl && (
                  <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={spotifyData.albumImageUrl || "/placeholder.svg"}
                      alt={spotifyData.album || "Album cover"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2 text-center px-2">
                  <a
                    href={spotifyData.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 font-bold text-lg block truncate transition-colors"
                  >
                    {spotifyData.title}
                  </a>
                  <p className="text-gray-300 text-base truncate">{spotifyData.artist}</p>
                  <p className="text-gray-500 text-sm truncate">{spotifyData.album}</p>
                </div>

                {spotifyData.durationMs && (
                  <div className="space-y-1 px-2">
                    <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 transition-all duration-[1000ms] ease-linear"
                        style={{ width: `${(localProgress / spotifyData.durationMs) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatTime(localProgress)}</span>
                      <span>{formatTime(spotifyData.durationMs)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">Now Playing</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-center px-4">
                <p className="text-sm">Not currently listening to anything</p>
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-4 right-4 bg-slate-900/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="text-white font-semibold text-base">
              {pageViews !== null ? pageViews.toLocaleString() : "..."}
            </span>
          </div>
        </div>
      </main>
    </>
  )
}
