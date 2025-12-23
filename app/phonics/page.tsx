"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AdSlot } from "@/components/ad-slot"
import { PhonicsCard } from "@/components/phonics-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { phonicsRules } from "@/lib/phonics-data"
import { initSpeech } from "@/lib/audio"
import { Languages } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function PhonicsPage() {
  const [filter, setFilter] = useState<"all" | "vowel" | "consonant" | "combination">("all")
  const { t } = useLanguage()

  useEffect(() => {
    initSpeech()
  }, [])

  const filteredRules = filter === "all" ? phonicsRules : phonicsRules.filter((rule) => rule.category === filter)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Languages className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-balance">{t.phonics.title}</h1>
          </div>
          <p className="mt-2 text-muted-foreground text-pretty">{t.phonics.subtitle}</p>
        </div>

        {/* Introduction card - keep English for now as it's educational content */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{t.phonics.clickToHear}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>{t.phonics.subtitle}</p>
          </CardContent>
        </Card>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            {t.phonics.all}
          </Button>
          <Button variant={filter === "vowel" ? "default" : "outline"} onClick={() => setFilter("vowel")}>
            {t.phonics.vowels}
          </Button>
          <Button variant={filter === "consonant" ? "default" : "outline"} onClick={() => setFilter("consonant")}>
            {t.phonics.consonants}
          </Button>
          <Button variant={filter === "combination" ? "default" : "outline"} onClick={() => setFilter("combination")}>
            {t.phonics.combinations}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRules.map((rule) => (
            <PhonicsCard key={rule.id} rule={rule} />
          ))}
        </div>

        <div className="mt-12">
          <AdSlot />
        </div>
      </main>
    </div>
  )
}
