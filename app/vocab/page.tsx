"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AdSlot } from "@/components/ad-slot"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload, Download, Trash2, FileText } from "lucide-react"
import { db } from "@/lib/db"
import type { Vocabulary } from "@/lib/types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function VocabPage() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    loadVocabularies()
  }, [])

  async function loadVocabularies() {
    try {
      const vocabs = await db.getVocabularies()
      setVocabularies(vocabs)
    } catch (error) {
      console.error("[v0] Failed to load vocabularies:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.vocab.deleteConfirm)) return

    try {
      await db.deleteVocabulary(id)
      await loadVocabularies()
    } catch (error) {
      console.error("[v0] Failed to delete vocabulary:", error)
    }
  }

  async function handleExport(vocab: Vocabulary) {
    const data = JSON.stringify(vocab, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${vocab.name.replace(/\s+/g, "-").toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">{t.common.loading}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">{t.vocab.title}</h1>
            <p className="mt-2 text-muted-foreground text-pretty">{t.vocab.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/vocab/import">
                <Upload className="mr-2 h-4 w-4" />
                {t.vocab.import}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/vocab/create">
                <Plus className="mr-2 h-4 w-4" />
                {t.vocab.createNew}
              </Link>
            </Button>
          </div>
        </div>

        {vocabularies.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t.vocab.noVocabs}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">{t.vocab.noVocabsDesc}</p>
              <div className="mt-6 flex gap-4">
                <Button asChild>
                  <Link href="/vocab/import">
                    <Upload className="mr-2 h-4 w-4" />
                    {t.vocab.import}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/vocab/create">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.vocab.createNew}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vocabularies.map((vocab) => (
              <Card key={vocab.id}>
                <CardHeader>
                  <CardTitle className="text-balance">{vocab.name}</CardTitle>
                  <CardDescription className="text-pretty">{vocab.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {vocab.words.length} {t.vocab.words}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleExport(vocab)} title={t.vocab.export}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vocab.id)}
                        title={t.vocab.delete}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12">
          <AdSlot />
        </div>
      </main>
    </div>
  )
}
