"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AdSlot } from "@/components/ad-slot"
import { WordCard } from "@/components/word-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, PartyPopper } from "lucide-react"
import { db } from "@/lib/db"
import { calculateNextReview, getStatus } from "@/lib/srs"
import { initSpeech } from "@/lib/audio"
import type { Word, LearningProgress, Vocabulary } from "@/lib/types"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function ReviewPage() {
  const [loading, setLoading] = useState(true)
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [dueWords, setDueWords] = useState<{ word: Word; progress: LearningProgress }[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [completed, setCompleted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    initSpeech()
    loadReviewSession()
  }, [])

  async function loadReviewSession() {
    try {
      const vocabs = await db.getVocabularies()
      setVocabularies(vocabs)

      if (vocabs.length === 0) {
        setLoading(false)
        return
      }

      // Get all due words (words that need review)
      const dueProgress = await db.getDueWords()

      // Match progress with actual words
      const wordsToReview: { word: Word; progress: LearningProgress }[] = []

      for (const progress of dueProgress) {
        for (const vocab of vocabs) {
          const word = vocab.words.find((w) => w.id === progress.wordId)
          if (word) {
            wordsToReview.push({ word, progress })
            break
          }
        }
      }

      setDueWords(wordsToReview)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to load review session:", error)
      setLoading(false)
    }
  }

  async function handleResponse(confidence: "unknown" | "fuzzy" | "known") {
    const current = dueWords[currentIndex]

    // Update progress
    current.progress.confidence = confidence
    current.progress.lastReviewed = Date.now()
    current.progress.reviewCount += 1
    current.progress.nextReview = calculateNextReview(confidence, current.progress.reviewCount)
    current.progress.status = getStatus(current.progress.reviewCount, confidence)

    await db.saveProgress(current.progress)

    // Update stats
    const today = new Date().toISOString().split("T")[0]
    let stats = await db.getStats(today)

    if (!stats) {
      // Calculate streak
      const allStats = await db.getAllStats()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]
      const yesterdayStats = allStats.find((s) => s.date === yesterdayStr)

      stats = {
        date: today,
        newWordsLearned: 0,
        wordsReviewed: 1,
        streak: yesterdayStats ? yesterdayStats.streak + 1 : 1,
      }
    } else {
      stats.wordsReviewed += 1
    }

    await db.saveStats(stats)

    // Move to next word
    if (currentIndex < dueWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      setCompleted(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-muted-foreground">{t.common.loading}</div>
        </main>
      </div>
    )
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center py-12">
              <RefreshCw className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t.review.noReviews}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">{t.review.noReviewsDesc}</p>
              <Button asChild className="mt-6">
                <Link href="/vocab">{t.vocab.createNew}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (dueWords.length === 0 || completed) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center py-12">
              <PartyPopper className="h-16 w-16 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{t.review.sessionComplete}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">
                {completed ? t.review.sessionCompleteDesc : t.review.noReviewsDesc}
              </p>
              <div className="mt-6 flex gap-4">
                <Button asChild>
                  <Link href="/learn">{t.review.learnWords}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/stats">{t.nav.stats}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / dueWords.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              {t.review.title} {currentIndex + 1} / {dueWords.length}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Word card */}
        <div className="flex justify-center">
          <WordCard
            word={dueWords[currentIndex].word}
            onResponse={handleResponse}
            showAnswer={showAnswer}
            onToggleAnswer={() => setShowAnswer(!showAnswer)}
          />
        </div>

        <div className="mt-8">
          <AdSlot />
        </div>
      </main>
    </div>
  )
}
