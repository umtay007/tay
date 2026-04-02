"use client"

import { useState, useRef, useEffect } from "react"

type SocialAccount = {
  label: string
  url: string
}

type Social = {
  name: string
  url?: string
  accounts?: SocialAccount[]
  icon: JSX.Element
  hoverColor: string
}

const socials: Social[] = [
  {
    name: "Discord",
    url: "https://discordapp.com/users/859642591224922162",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    hoverColor: "hover:text-[#5865F2]",
  },
  {
    name: "Twitter",
    url: "https://x.com/taybefake",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    hoverColor: "hover:text-white",
  },
  {
    name: "Instagram",
    accounts: [
      { label: "Main", url: "https://www.instagram.com/grrrrrrtay/" },
      { label: "Beat Saber", url: "https://www.instagram.com/grrrtay.bs/" },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    hoverColor: "hover:text-[#E4405F]",
  },
  {
    name: "TikTok",
    accounts: [
      { label: "Main", url: "https://www.tiktok.com/@tayfakey" },
      { label: "Music", url: "https://www.tiktok.com/@tay.fake" },
      { label: "Beat Saber", url: "https://www.tiktok.com/@tay.fakey" },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    hoverColor: "hover:text-white",
  },
  {
    name: "YouTube",
    accounts: [
      { label: "Main", url: "https://www.youtube.com/@Tayisfake" },
      { label: "VR", url: "https://www.youtube.com/@Tayisfakey" },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    hoverColor: "hover:text-[#FF0000]",
  },
  {
    name: "Telegram",
    url: "https://t.me/yourusername",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    hoverColor: "hover:text-[#0088cc]",
  },
  {
    name: "NameMC",
    url: "https://namemc.com/profile/IShowSpeed.2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10 0h8v8h-8v-8zm0-10h8v8h-8V3z" />
      </svg>
    ),
    hoverColor: "hover:text-[#4CAF50]",
  },
]

export function SocialToolbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [openPopup, setOpenPopup] = useState<number | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpenPopup(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleClick = (index: number, social: Social) => {
    if (social.accounts) {
      setOpenPopup(openPopup === index ? null : index)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl">
      {socials.map((social, index) => (
        <div key={social.name} className="relative" ref={openPopup === index ? popupRef : null}>
          {social.accounts ? (
            <button
              onClick={() => handleClick(index, social)}
              className={`relative flex items-center justify-center p-3 rounded-xl text-gray-400 transition-all duration-200 hover:bg-white/10 ${social.hoverColor}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transform: hoveredIndex === index ? "scale(1.2) translateY(-4px)" : "scale(1)",
              }}
            >
              {social.icon}
              {hoveredIndex === index && openPopup !== index && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap">
                  {social.name}
                </span>
              )}
            </button>
          ) : (
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative flex items-center justify-center p-3 rounded-xl text-gray-400 transition-all duration-200 hover:bg-white/10 ${social.hoverColor}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transform: hoveredIndex === index ? "scale(1.2) translateY(-4px)" : "scale(1)",
              }}
            >
              {social.icon}
              {hoveredIndex === index && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap">
                  {social.name}
                </span>
              )}
            </a>
          )}

          {/* Popup for multiple accounts */}
          {openPopup === index && social.accounts && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-800/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden min-w-[140px]">
              <div className="px-3 py-2 border-b border-white/10 text-center">
                <span className="text-xs font-semibold text-gray-300">{social.name}</span>
              </div>
              {social.accounts.map((account) => (
                <a
                  key={account.label}
                  href={account.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors ${social.hoverColor}`}
                  onClick={() => setOpenPopup(null)}
                >
                  {account.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
