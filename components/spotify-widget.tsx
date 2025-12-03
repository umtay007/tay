"use client"

import Image from "next/image"
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

interface SpotifyWidgetProps {
  spotifyData: SpotifyData
  localProgress: number
  formatTime: (ms: number) => string
}

export default function SpotifyWidget({ spotifyData, localProgress, formatTime }: SpotifyWidgetProps) {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <div className="fixed top-5 right-5 z-20">
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
    )
  }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 w-80 bg-slate-900/20 backdrop-blur-sm p-6 rounded-l-lg border-l border-t border-b border-white/10 z-20">
      <h2 className="text-lg font-bold mb-6 text-white text-center">
        WHAT I&apos;M <span className="text-blue-300 italic">LISTENING TO</span>
      </h2>
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
  )
}
