// Translation and phonetic lookup utilities

export interface TranslationResult {
  translation: string
  phonetic: string
  examples?: string[]
}

// Use Free Dictionary API for English words
async function fetchFromFreeDictionary(word: string): Promise<Partial<TranslationResult>> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!response.ok) return {}

    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) return {}

    const entry = data[0]
    const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || ""
    const meanings = entry.meanings || []
    const examples: string[] = []

    // Collect examples
    meanings.forEach((meaning: any) => {
      meaning.definitions?.forEach((def: any) => {
        if (def.example) examples.push(def.example)
      })
    })

    return {
      phonetic: phonetic.replace(/[/[\]]/g, "").trim() ? phonetic : "",
      examples: examples.slice(0, 2),
    }
  } catch (error) {
    console.error("[v0] Free Dictionary API error:", error)
    return {}
  }
}

// Use translation via a simple API (we'll use MyMemory Translation API - free tier)
async function translateToSimplifiedChinese(word: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-CN`,
    )
    if (!response.ok) return ""

    const data = await response.json()
    return data.responseData?.translatedText || ""
  } catch (error) {
    console.error("[v0] Translation API error:", error)
    return ""
  }
}

// Main function to get word details
export async function getWordDetails(word: string): Promise<TranslationResult> {
  const cleanWord = word.trim().toLowerCase()

  if (!cleanWord) {
    return { translation: "", phonetic: "" }
  }

  try {
    // Fetch both in parallel
    const [dictResult, translation] = await Promise.all([
      fetchFromFreeDictionary(cleanWord),
      translateToSimplifiedChinese(cleanWord),
    ])

    return {
      translation: translation || "",
      phonetic: dictResult.phonetic || "",
      examples: dictResult.examples,
    }
  } catch (error) {
    console.error("[v0] getWordDetails error:", error)
    return { translation: "", phonetic: "" }
  }
}

// Batch translate multiple words
export async function batchTranslateWords(words: string[]): Promise<Map<string, TranslationResult>> {
  const results = new Map<string, TranslationResult>()

  // Process in batches of 3 to avoid rate limiting
  const batchSize = 3
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map((word) => getWordDetails(word)))

    batch.forEach((word, index) => {
      results.set(word.toLowerCase(), batchResults[index])
    })

    // Small delay between batches
    if (i + batchSize < words.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return results
}
