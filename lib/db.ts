// IndexedDB utilities for local storage

import type { Vocabulary, LearningProgress, DailyStats, UserSettings } from "./types"

const DB_NAME = "EnglishLearningDB"
const DB_VERSION = 1

interface DBSchema {
  vocabularies: Vocabulary
  progress: LearningProgress
  stats: DailyStats
  settings: UserSettings
}

class VocabDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Vocabularies store
        if (!db.objectStoreNames.contains("vocabularies")) {
          const vocabStore = db.createObjectStore("vocabularies", { keyPath: "id" })
          vocabStore.createIndex("createdAt", "createdAt", { unique: false })
        }

        // Progress store
        if (!db.objectStoreNames.contains("progress")) {
          const progressStore = db.createObjectStore("progress", { keyPath: "wordId" })
          progressStore.createIndex("vocabId", "vocabId", { unique: false })
          progressStore.createIndex("nextReview", "nextReview", { unique: false })
          progressStore.createIndex("status", "status", { unique: false })
        }

        // Stats store
        if (!db.objectStoreNames.contains("stats")) {
          db.createObjectStore("stats", { keyPath: "date" })
        }

        // Settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" })
        }
      }
    })
  }

  private async getStore(storeName: keyof DBSchema, mode: IDBTransactionMode = "readonly") {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Vocabulary operations
  async addVocabulary(vocab: Vocabulary): Promise<void> {
    const store = await this.getStore("vocabularies", "readwrite")
    return new Promise((resolve, reject) => {
      const request = store.add(vocab)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getVocabularies(): Promise<Vocabulary[]> {
    const store = await this.getStore("vocabularies")
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getVocabulary(id: string): Promise<Vocabulary | undefined> {
    const store = await this.getStore("vocabularies")
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateVocabulary(vocab: Vocabulary): Promise<void> {
    const store = await this.getStore("vocabularies", "readwrite")
    return new Promise((resolve, reject) => {
      const request = store.put(vocab)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteVocabulary(id: string): Promise<void> {
    const store = await this.getStore("vocabularies", "readwrite")
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Progress operations
  async saveProgress(progress: LearningProgress): Promise<void> {
    const store = await this.getStore("progress", "readwrite")
    return new Promise((resolve, reject) => {
      const request = store.put(progress)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getProgress(wordId: string): Promise<LearningProgress | undefined> {
    const store = await this.getStore("progress")
    return new Promise((resolve, reject) => {
      const request = store.get(wordId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getProgressByVocab(vocabId: string): Promise<LearningProgress[]> {
    const store = await this.getStore("progress")
    const index = store.index("vocabId")
    return new Promise((resolve, reject) => {
      const request = index.getAll(vocabId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getDueWords(): Promise<LearningProgress[]> {
    const store = await this.getStore("progress")
    const index = store.index("nextReview")
    const now = Date.now()

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.upperBound(now))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Stats operations
  async saveStats(stats: DailyStats): Promise<void> {
    const store = await this.getStore("stats", "readwrite")
    return new Promise((resolve, reject) => {
      const request = store.put(stats)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getStats(date: string): Promise<DailyStats | undefined> {
    const store = await this.getStore("stats")
    return new Promise((resolve, reject) => {
      const request = store.get(date)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllStats(): Promise<DailyStats[]> {
    const store = await this.getStore("stats")
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Settings operations
  async saveSettings(settings: UserSettings): Promise<void> {
    const store = await this.getStore("settings", "readwrite")
    return new Promise((resolve, reject) => {
      const request = store.put({ ...settings, id: "user-settings" })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSettings(): Promise<UserSettings> {
    const store = await this.getStore("settings")
    return new Promise((resolve, reject) => {
      const request = store.get("user-settings")
      request.onsuccess = () => {
        resolve(
          request.result || {
            dailyNewWords: 15,
            lastStudyDate: "",
            currentStreak: 0,
          },
        )
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const db = new VocabDB()
