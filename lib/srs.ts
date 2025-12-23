// Simple Spaced Repetition System logic

export function calculateNextReview(confidence: "unknown" | "fuzzy" | "known", reviewCount: number): number {
  const now = Date.now()
  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR

  // Simple intervals based on confidence
  if (confidence === "unknown") {
    return now + 10 * MINUTE // Review in 10 minutes
  } else if (confidence === "fuzzy") {
    // 1 hour, 4 hours, 1 day, 3 days
    const intervals = [HOUR, 4 * HOUR, DAY, 3 * DAY]
    const interval = intervals[Math.min(reviewCount, intervals.length - 1)]
    return now + interval
  } else {
    // known: 1 day, 3 days, 7 days, 14 days, 30 days
    const intervals = [DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY]
    const interval = intervals[Math.min(reviewCount, intervals.length - 1)]
    return now + interval
  }
}

export function getStatus(
  reviewCount: number,
  confidence: "unknown" | "fuzzy" | "known",
): "new" | "learning" | "mastered" {
  if (reviewCount === 0) return "new"
  if (confidence === "known" && reviewCount >= 3) return "mastered"
  return "learning"
}
