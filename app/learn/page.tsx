"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AdSlot } from "@/components/ad-slot"
import { WordCard } from "@/components/word-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, PartyPopper } from "lucide-react"
import { db } from "@/lib/db"
import { calculateNextReview, getStatus } from "@/lib/srs"
import { initSpeech } from "@/lib/audio"
import type { Word, LearningProgress, Vocabulary, UserSettings } from "@/lib/types"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function LearnPage() {
  const [loading, setLoading] = useState(true)
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [todayWords, setTodayWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    initSpeech()
    loadLearningSession()
  }, [])

  async function loadLearningSession() {
    try {
      const vocabs = await db.getVocabularies()
      setVocabularies(vocabs)

      if (vocabs.length === 0) {
        setLoading(false)
        return
      }

      const userSettings = await db.getSettings()
      setSettings(userSettings)

      const allWords = vocabs.flatMap((v) => v.words)

      const progressMap = new Map<string, LearningProgress>()
      for (const word of allWords) {
        const progress = await db.getProgress(word.id)
        if (progress) {
          progressMap.set(word.id, progress)
        }
      }

      const newWords = allWords.filter((word) => {
        const progress = progressMap.get(word.id)
        return !progress || progress.status === "new"
      })

      const today = new Date().toISOString().split("T")[0]
      const todayStats = await db.getStats(today)
      const learnedToday = todayStats?.newWordsLearned || 0
      const dailyLimit = userSettings.dailyNewWords

      const remainingQuota = Math.max(0, dailyLimit - learnedToday)
      const wordsToLearn = newWords.slice(0, remainingQuota)

      setTodayWords(wordsToLearn)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to load learning session:", error)
      setLoading(false)
    }
  }

  async function handleResponse(confidence: "unknown" | "fuzzy" | "known") {
    const currentWord = todayWords[currentIndex]

    let progress = await db.getProgress(currentWord.id)

    if (!progress) {
      progress = {
        wordId: currentWord.id,
        vocabId: vocabularies.find((v) => v.words.some((w) => w.id === currentWord.id))?.id || "",
        status: "new",
        lastReviewed: Date.now(),
        nextReview: Date.now(),
        reviewCount: 0,
        confidence: "unknown",
      }
    }

    progress.confidence = confidence
    progress.lastReviewed = Date.now()
    progress.reviewCount += 1
    progress.nextReview = calculateNextReview(confidence, progress.reviewCount)
    progress.status = getStatus(progress.reviewCount, confidence)

    await db.saveProgress(progress)

    const today = new Date().toISOString().split("T")[0]
    let stats = await db.getStats(today)

    if (!stats) {
      stats = {
        date: today,
        newWordsLearned: 1,
        wordsReviewed: 0,
        streak: 1,
      }
    } else {
      stats.newWordsLearned += 1
    }

    await db.saveStats(stats)

    if (currentIndex < todayWords.length - 1) {
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
              <BookOpen className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t.learn.noVocabs}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">{t.learn.noVocabsDesc}</p>
              <Button asChild className="mt-6">
                <Link href="/vocab">{t.learn.createOne}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (todayWords.length === 0 || completed) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center py-12">
              <PartyPopper className="h-16 w-16 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{t.learn.sessionComplete}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">
                {t.learn.sessionCompleteDesc}
              </p>
              <div className="mt-6 flex gap-4">
                <Button asChild>
                  <Link href="/review">{t.learn.continueReview}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">{t.learn.backHome}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / todayWords.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              {t.learn.progress}: {currentIndex + 1} / {todayWords.length}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-center">
          <WordCard
            word={todayWords[currentIndex]}
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
