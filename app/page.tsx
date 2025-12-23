"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { AdSlot } from "@/components/ad-slot"
import { BookOpen, Upload, Play, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function HomePage() {
  const { t } = useLanguage()

  console.log("[v0] HomePage rendering with translations:", t)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">{t.home.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t.home.subtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/learn">
                <Play className="mr-2 h-5 w-5" />
                {t.home.startLearning}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              <Link href="/vocab">
                <Upload className="mr-2 h-5 w-5" />
                {t.home.importWordList}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{t.home.feature1Title}</CardTitle>
              <CardDescription>{t.home.feature1Desc}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Play className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{t.home.feature2Title}</CardTitle>
              <CardDescription>{t.home.feature2Desc}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{t.home.feature3Title}</CardTitle>
              <CardDescription>{t.home.feature3Desc}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Upload className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{t.home.feature4Title}</CardTitle>
              <CardDescription>{t.home.feature4Desc}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-12">
          <AdSlot />
        </div>
      </main>
    </div>
  )
}
