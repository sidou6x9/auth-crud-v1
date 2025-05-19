"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useMobile } from "@/hooks/use-mobile"
import { SignOutButton } from "./auth/sign-out-button"
import { AuthStatus } from "./auth/auth-status"

export function MainNav() {
  const isMobile = useMobile()
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <motion.span
              className="hidden font-bold sm:inline-block"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              Dynamic Website
            </motion.span>
          </Link>
        
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
           <AuthStatus />
        </div>
      </div>
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-background p-6 md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative z-20 grid gap-6 rounded-md bg-background p-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold">Dynamic Website</span>
              </Link>
             
              <Button variant="ghost" className="absolute right-4 top-4" onClick={() => setShowMobileMenu(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
