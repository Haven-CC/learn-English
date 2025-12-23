"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"
import { db } from "@/lib/db"
import type { Vocabulary, Word } from "@/lib/types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { batchTranslateWords } from "@/lib/translation-api"

export default function ImportVocabPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [jsonText, setJsonText] = useState("")
  const [csvText, setCsvText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  async function autoFillTranslations(words: Word[]): Promise<Word[]> {
    const wordsNeedingTranslation = words.filter((w) => !w.translation || !w.phonetic)

    if (wordsNeedingTranslation.length === 0) {
      return words
    }

    setIsTranslating(true)

    try {
      const wordTexts = wordsNeedingTranslation.map((w) => w.word)
      const translations = await batchTranslateWords(wordTexts)

      return words.map((word) => {
        const translation = translations.get(word.word.toLowerCase())
        if (!translation) return word

        return {
          ...word,
          translation: word.translation || translation.translation || word.translation,
          phonetic: word.phonetic || translation.phonetic || word.phonetic,
          example: word.example || (translation.examples?.[0] ?? word.example),
        }
      })
    } finally {
      setIsTranslating(false)
    }
  }

  async function handleJSONImport() {
    try {
      const data = JSON.parse(jsonText)

      // Validate structure
      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array of words")
      }

      let words: Word[] = data.map((item, index) => ({
        id: `word-${Date.now()}-${index}`,
        word: item.word || item.english || "",
        translation: item.translation || item.chinese || "",
        phonetic: item.phonetic || item.ipa || "",
        example: item.example || "",
        tags: item.tags || [],
        createdAt: Date.now(),
      }))

      if (words.length === 0 || !words[0].word) {
        throw new Error("Invalid word format")
      }

      words = await autoFillTranslations(words)

      const vocabulary: Vocabulary = {
        id: `vocab-${Date.now()}`,
        name: name.trim() || "Imported Vocabulary",
        description: "Imported from JSON",
        words,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await db.addVocabulary(vocabulary)
      router.push("/vocab")
    } catch (error) {
      console.error("[v0] JSON import error:", error)
      alert(t.common.error)
    }
  }

  async function handleCSVImport() {
    try {
      const lines = csvText.trim().split("\n")
      if (lines.length === 0) {
        throw new Error("CSV is empty")
      }

      // Skip header if it exists
      const hasHeader = lines[0].toLowerCase().includes("word") || lines[0].toLowerCase().includes("english")
      const dataLines = hasHeader ? lines.slice(1) : lines

      let words: Word[] = dataLines
        .map((line, index) => {
          const parts = line.split(",").map((p) => p.trim())
          if (parts.length < 1 || !parts[0]) return null

          return {
            id: `word-${Date.now()}-${index}`,
            word: parts[0] || "",
            translation: parts[1] || "",
            phonetic: parts[2] || "",
            example: parts[3] || "",
            tags: parts[4] ? parts[4].split(";").map((t) => t.trim()) : [],
            createdAt: Date.now(),
          }
        })
        .filter((w): w is Word => w !== null && w.word !== "")

      if (words.length === 0) {
        throw new Error("No valid words found in CSV")
      }

      words = await autoFillTranslations(words)

      const vocabulary: Vocabulary = {
        id: `vocab-${Date.now()}`,
        name: name.trim() || "Imported Vocabulary",
        description: "Imported from CSV",
        words,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await db.addVocabulary(vocabulary)
      router.push("/vocab")
    } catch (error) {
      console.error("[v0] CSV import error:", error)
      alert(t.common.error)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string

      if (file.name.endsWith(".json")) {
        setJsonText(content)
      } else if (file.name.endsWith(".csv")) {
        setCsvText(content)
      }

      if (!name) {
        setName(file.name.replace(/\.(json|csv)$/, ""))
      }
    }
    reader.readAsText(file)
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.vocab.importTitle}</CardTitle>
              <CardDescription>{t.vocab.importSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vocab-name">{t.vocab.vocabName}</Label>
                <Input
                  id="vocab-name"
                  placeholder={t.vocab.vocabNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">{t.vocab.selectFile}</Label>
                <div className="flex gap-2">
                  <Input id="file-upload" type="file" accept=".json,.csv" onChange={handleFileUpload} />
                </div>
              </div>

              {isTranslating && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.vocab.autoTranslating || "Auto-translating missing words..."}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" />
                <CardTitle>JSON</CardTitle>
              </div>
              <CardDescription>{t.vocab.formatInstructions}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`[\n  {\n    "word": "hello",\n    "translation": "你好",\n    "phonetic": "/həˈloʊ/",\n    "example": "Hello, how are you?",\n    "tags": ["greeting"]\n  }\n]`}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <Button onClick={handleJSONImport} disabled={!jsonText.trim() || isTranslating} className="w-full">
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.vocab.autoTranslating || "Translating..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t.vocab.import} JSON
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <CardTitle>CSV</CardTitle>
              </div>
              <CardDescription>
                {t.vocab.formatInstructions}: {t.vocab.formatExample}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`word,translation,phonetic,example,tags\nhello,你好,/həˈloʊ/,Hello how are you?,greeting\nworld,世界,/wɜːrld/,Hello world!,basic`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <Button onClick={handleCSVImport} disabled={!csvText.trim() || isTranslating} className="w-full">
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.vocab.autoTranslating || "Translating..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t.vocab.import} CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
