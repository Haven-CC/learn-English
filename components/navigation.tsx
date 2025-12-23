"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, GraduationCap, Library, BarChart3, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigation = [
    { name: t.nav.home, href: "/", icon: BookOpen },
    { name: t.nav.myVocabulary, href: "/vocab", icon: Library },
    { name: t.nav.learn, href: "/learn", icon: GraduationCap },
    { name: t.nav.review, href: "/review", icon: GraduationCap },
    { name: t.nav.phonics, href: "/phonics", icon: Languages },
    { name: t.nav.stats, href: "/stats", icon: BarChart3 },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">{t.nav.appName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                )
              })}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}
