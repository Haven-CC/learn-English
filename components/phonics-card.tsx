"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import type { PhonicsRule } from "@/lib/phonics-data"
import { speakWord } from "@/lib/audio"

interface PhonicsCardProps {
  rule: PhonicsRule
}

export function PhonicsCard({ rule }: PhonicsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{rule.symbol}</CardTitle>
          <div className="text-xl text-primary">{rule.ipa}</div>
        </div>
        <p className="text-sm text-muted-foreground">{rule.description}</p>
        {rule.chineseHint && <p className="mt-1 text-sm text-accent-foreground">{rule.chineseHint}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm font-medium">Examples:</p>
          <div className="grid grid-cols-2 gap-2">
            {rule.examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center justify-between bg-transparent"
                onClick={() => speakWord(example)}
              >
                <span>{example}</span>
                <Volume2 className="ml-2 h-4 w-4 text-primary" />
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
