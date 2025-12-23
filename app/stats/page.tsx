"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AdSlot } from "@/components/ad-slot"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Flame, BookOpen, Target, TrendingUp, Calendar, Trophy } from "lucide-react"
import { db } from "@/lib/db"
import type { LearningProgress, Vocabulary, DailyStats } from "@/lib/types"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [allProgress, setAllProgress] = useState<LearningProgress[]>([])
  const [stats, setStats] = useState<DailyStats[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const { t, language } = useLanguage()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const vocabs = await db.getVocabularies()
      setVocabularies(vocabs)

      // Get all progress
      const progressList: LearningProgress[] = []
      for (const vocab of vocabs) {
        const vocabProgress = await db.getProgressByVocab(vocab.id)
        progressList.push(...vocabProgress)
      }
      setAllProgress(progressList)

      // Get all stats
      const allStats = await db.getAllStats()
      setStats(allStats.sort((a, b) => b.date.localeCompare(a.date)))

      // Calculate current streak
      const today = new Date().toISOString().split("T")[0]
      const todayStats = allStats.find((s) => s.date === today)

      if (todayStats) {
        setCurrentStreak(todayStats.streak)
      } else {
        // Check if yesterday had a streak
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split("T")[0]
        const yesterdayStats = allStats.find((s) => s.date === yesterdayStr)

        setCurrentStreak(0) // Streak broken
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to load stats:", error)
      setLoading(false)
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

  // Calculate statistics
  const totalWords = vocabularies.reduce((sum, vocab) => sum + vocab.words.length, 0)
  const masteredWords = allProgress.filter((p) => p.status === "mastered").length
  const learningWords = allProgress.filter((p) => p.status === "learning").length
  const newWords = totalWords - allProgress.length

  const totalLearned = allProgress.length
  const progressPercent = totalWords > 0 ? (totalLearned / totalWords) * 100 : 0

  const todayStats = stats.find((s) => s.date === new Date().toISOString().split("T")[0])
  const todayLearned = todayStats?.newWordsLearned || 0
  const todayReviewed = todayStats?.wordsReviewed || 0

  const totalNewWordsLearned = stats.reduce((sum, s) => sum + s.newWordsLearned, 0)
  const totalReviewed = stats.reduce((sum, s) => sum + s.wordsReviewed, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">{t.stats.title}</h1>
          <p className="mt-2 text-muted-foreground text-pretty">{t.stats.subtitle}</p>
        </div>

        {vocabularies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <TrendingUp className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t.stats.noData}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">{t.stats.noDataDesc}</p>
              <Button asChild className="mt-6">
                <Link href="/vocab">{t.stats.startNow}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title={t.stats.currentStreak} value={`${currentStreak} ${t.stats.days}`} icon={Flame} />
              <StatCard
                title={t.stats.totalWords}
                value={totalWords}
                icon={BookOpen}
                description={`${newWords} ${t.stats.learning}`}
              />
              <StatCard
                title={t.stats.mastered}
                value={masteredWords}
                icon={Trophy}
                description={`${learningWords} ${t.stats.learning}`}
              />
              <StatCard title={t.stats.todayActivity} value={todayLearned + todayReviewed} icon={Target} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t.stats.overview}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {totalLearned} / {totalWords} {t.vocab.words}
                    </span>
                    <span className="text-muted-foreground">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-bold text-primary">{masteredWords}</div>
                    <div className="text-sm text-muted-foreground">{t.stats.mastered}</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-bold text-accent">{learningWords}</div>
                    <div className="text-sm text-muted-foreground">{t.stats.learning}</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-bold text-muted-foreground">{newWords}</div>
                    <div className="text-sm text-muted-foreground">New</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.stats.todayActivity}</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">{t.stats.noData}</div>
                ) : (
                  <div className="space-y-3">
                    {stats.slice(0, 7).map((stat) => {
                      const date = new Date(stat.date)
                      const isToday = stat.date === new Date().toISOString().split("T")[0]
                      const dateStr = isToday
                        ? language === "zh"
                          ? "今天"
                          : "Today"
                        : date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
                            month: "short",
                            day: "numeric",
                          })

                      return (
                        <div
                          key={stat.date}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{dateStr}</div>
                              <div className="text-sm text-muted-foreground">
                                {stat.newWordsLearned} {t.stats.learned} · {stat.wordsReviewed} {t.stats.reviewed}
                              </div>
                            </div>
                          </div>
                          {stat.streak > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Flame className="h-4 w-4 text-primary" />
                              <span className="font-medium">{stat.streak}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.stats.vocabularies}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vocabularies.map((vocab) => {
                    const vocabProgress = allProgress.filter((p) => p.vocabId === vocab.id)
                    const vocabMastered = vocabProgress.filter((p) => p.status === "mastered").length
                    const vocabPercent = vocab.words.length > 0 ? (vocabMastered / vocab.words.length) * 100 : 0

                    return (
                      <div key={vocab.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-balance">{vocab.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vocabMastered} / {vocab.words.length} {t.stats.mastered}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-primary">{vocabPercent.toFixed(0)}%</div>
                        </div>
                        <Progress value={vocabPercent} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-12">
          <AdSlot />
        </div>
      </main>
    </div>
  )
}
