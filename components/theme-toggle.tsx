"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check localStorage
    const storedDarkMode = localStorage.getItem("darkMode")
    const initialDarkMode = storedDarkMode === null ? true : storedDarkMode === "true"

    setIsDark(initialDarkMode)
    document.documentElement.classList.toggle("dark", initialDarkMode)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("darkMode", String(newTheme))
    document.documentElement.classList.toggle("dark", newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="fixed top-4 right-4 z-50">
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
