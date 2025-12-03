"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ReferralSystem } from "@/components/referral-system"
import { useRouter, usePathname } from "next/navigation"

export function MenuButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"tos" | "referral" | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    if (path === "/vouches" && pathname === "/vouches") {
      return // Already on vouches page
    }
    router.push(path)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "tos":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Terms of Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. All transactions are final.</li>
              <li>2. Users must verify their identity before trading.</li>
              <li>3. We reserve the right to refuse service.</li>
              <li>4. Processing times may vary based on network conditions.</li>
              <li>5. Users are responsible for providing correct wallet addresses.</li>
            </ul>
          </div>
        )
      case "referral":
        return <ReferralSystem />
      default:
        return (
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/vouches")}>
              Vouches
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/members")}>
              Members
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/pay-me")}>
              Pay Me
            </Button>
            <Separator className="my-2" />
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection("tos")}>
              Terms of Service
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection("referral")}>
              Referral System
            </Button>
            {pathname !== "/" && (
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/")}>
                Back to Exchange
              </Button>
            )}
          </div>
        )
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            {activeSection ? (
              <Button variant="ghost" onClick={() => setActiveSection(null)} className="mb-2">
                ← Back to Menu
              </Button>
            ) : (
              "Menu"
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  )
}
