// Core data types for the vocabulary learning app

export interface Word {
  id: string
  word: string
  translation: string
  phonetic?: string
  example?: string
  tags?: string[]
  createdAt: number
}

export interface Vocabulary {
  id: string
  name: string
  description?: string
  words: Word[]
  createdAt: number
  updatedAt: number
}

export interface LearningProgress {
  wordId: string
  vocabId: string
  status: "new" | "learning" | "mastered"
  lastReviewed: number
  nextReview: number
  reviewCount: number
  confidence: "unknown" | "fuzzy" | "known"
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  newWordsLearned: number
  wordsReviewed: number
  streak: number
}

export interface UserSettings {
  dailyNewWords: number
  lastStudyDate: string
  currentStreak: number
}
