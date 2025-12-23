"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { db } from "@/lib/db"
import type { Word, Vocabulary } from "@/lib/types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { getWordDetails } from "@/lib/translation-api"

export default function CreateVocabPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [words, setWords] = useState<Omit<Word, "id" | "createdAt">[]>([
    { word: "", translation: "", phonetic: "", example: "", tags: [] },
  ])
  const [loadingStates, setLoadingStates] = useState<boolean[]>([false])

  function addWord() {
    setWords([...words, { word: "", translation: "", phonetic: "", example: "", tags: [] }])
    setLoadingStates([...loadingStates, false])
  }

  function removeWord(index: number) {
    setWords(words.filter((_, i) => i !== index))
    setLoadingStates(loadingStates.filter((_, i) => i !== index))
  }

  function updateWord(index: number, field: keyof Omit<Word, "id" | "createdAt">, value: string) {
    const newWords = [...words]
    if (field === "tags") {
      newWords[index][field] = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    } else {
      // @ts-ignore
      newWords[index][field] = value
    }
    setWords(newWords)
  }

  async function autoTranslate(index: number) {
    const word = words[index].word.trim()
    if (!word) {
      alert(t.vocab.wordPlaceholder)
      return
    }

    // Set loading state
    const newLoadingStates = [...loadingStates]
    newLoadingStates[index] = true
    setLoadingStates(newLoadingStates)

    try {
      const result = await getWordDetails(word)
      const newWords = [...words]

      // Update translation if empty
      if (!newWords[index].translation && result.translation) {
        newWords[index].translation = result.translation
      }

      // Update phonetic if empty
      if (!newWords[index].phonetic && result.phonetic) {
        newWords[index].phonetic = result.phonetic
      }

      // Update example if empty and available
      if (!newWords[index].example && result.examples && result.examples.length > 0) {
        newWords[index].example = result.examples[0]
      }

      setWords(newWords)
    } catch (error) {
      console.error("[v0] Auto-translate error:", error)
      alert(t.common.error)
    } finally {
      // Clear loading state
      const newLoadingStates = [...loadingStates]
      newLoadingStates[index] = false
      setLoadingStates(newLoadingStates)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      alert(t.vocab.vocabName)
      return
    }

    const validWords = words.filter((w) => w.word.trim() && w.translation.trim())

    if (validWords.length === 0) {
      alert(t.vocab.addWord)
      return
    }

    const vocabulary: Vocabulary = {
      id: `vocab-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      words: validWords.map((w) => ({
        ...w,
        id: `word-${Date.now()}-${Math.random()}`,
        createdAt: Date.now(),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    try {
      await db.addVocabulary(vocabulary)
      router.push("/vocab")
    } catch (error) {
      console.error("[v0] Failed to create vocabulary:", error)
      alert(t.common.error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/vocab">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t.vocab.createTitle}</CardTitle>
            <CardDescription>{t.vocab.createSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.vocab.vocabName} *</Label>
                <Input
                  id="name"
                  placeholder={t.vocab.vocabNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.vocab.subtitle}</Label>
                <Textarea
                  id="description"
                  placeholder={t.vocab.subtitle}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t.vocab.words}</Label>
                  <Button type="button" onClick={addWord} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.vocab.addWord}
                  </Button>
                </div>

                {words.map((word, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>{t.common.word} *</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder={t.vocab.wordPlaceholder}
                                value={word.word}
                                onChange={(e) => updateWord(index, "word", e.target.value)}
                                required
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => autoTranslate(index)}
                                disabled={!word.word.trim() || loadingStates[index]}
                                title={t.vocab.autoTranslate || "Auto Translate"}
                              >
                                {loadingStates[index] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.common.translation} *</Label>
                            <Input
                              placeholder={t.vocab.translationPlaceholder}
                              value={word.translation}
                              onChange={(e) => updateWord(index, "translation", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.common.pronunciation}</Label>
                          <Input
                            placeholder="e.g., /həˈloʊ/"
                            value={word.phonetic}
                            onChange={(e) => updateWord(index, "phonetic", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.common.example}</Label>
                          <Input
                            placeholder={t.vocab.examplePlaceholder}
                            value={word.example}
                            onChange={(e) => updateWord(index, "example", e.target.value)}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <Label>Tags</Label>
                            <Input
                              placeholder="e.g., greeting, basic"
                              value={word.tags?.join(", ") || ""}
                              onChange={(e) => updateWord(index, "tags", e.target.value)}
                            />
                          </div>
                          {words.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeWord(index)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {t.vocab.create}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/vocab")}>
                  {t.vocab.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
