"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, X, HelpCircle, Check } from "lucide-react"
import type { Word } from "@/lib/types"
import { speakWord } from "@/lib/audio"
import { useLanguage } from "@/contexts/language-context"

interface WordCardProps {
  word: Word
  onResponse: (confidence: "unknown" | "fuzzy" | "known") => void
  showAnswer: boolean
  onToggleAnswer: () => void
}

export function WordCard({ word, onResponse, showAnswer, onToggleAnswer }: WordCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="w-full max-w-2xl border-2">
      <CardContent className="p-8 sm:p-12">
        <div className="space-y-8">
          {/* Word with pronunciation */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-4xl font-bold sm:text-5xl">{word.word}</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => speakWord(word.word)}
                className="h-12 w-12 text-primary hover:bg-primary/10"
                aria-label="Play pronunciation"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>
            {word.phonetic && <p className="mt-3 text-lg text-muted-foreground">{word.phonetic}</p>}
          </div>

          {/* Show/Hide answer */}
          {!showAnswer ? (
            <div className="flex justify-center">
              <Button onClick={onToggleAnswer} size="lg" variant="outline">
                {t.learn.tapToReveal}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Translation */}
              <div className="rounded-lg bg-secondary p-6 text-center">
                <p className="text-2xl font-semibold text-secondary-foreground">{word.translation}</p>
              </div>

              {/* Example sentence */}
              {word.example && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium text-muted-foreground">{t.common.example}:</p>
                  <p className="mt-1 text-base leading-relaxed">{word.example}</p>
                </div>
              )}

              {/* Tags */}
              {word.tags && word.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {word.tags.map((tag, index) => (
                    <span key={index} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Confidence buttons */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <Button
                  onClick={() => onResponse("unknown")}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-6 w-6" />
                  <span className="text-sm font-medium">{t.learn.dontKnow}</span>
                </Button>
                <Button
                  onClick={() => onResponse("fuzzy")}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 hover:border-accent hover:bg-accent/10 hover:text-accent-foreground"
                >
                  <HelpCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">{t.learn.knowSomewhat}</span>
                </Button>
                <Button
                  onClick={() => onResponse("known")}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Check className="h-6 w-6" />
                  <span className="text-sm font-medium">{t.learn.knowWell}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
