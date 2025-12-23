// Text-to-speech utilities for pronunciation

let speechSynthesis: SpeechSynthesis | null = null
let voices: SpeechSynthesisVoice[] = []

export function initSpeech() {
  if (typeof window === "undefined") return

  speechSynthesis = window.speechSynthesis

  // Load voices
  const loadVoices = () => {
    voices = speechSynthesis?.getVoices() || []
  }

  loadVoices()
  if (speechSynthesis) {
    speechSynthesis.onvoiceschanged = loadVoices
  }
}

export function speakWord(text: string, lang = "en-US") {
  if (!speechSynthesis) {
    initSpeech()
  }

  if (!speechSynthesis) {
    console.warn("Speech synthesis not supported")
    return
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.8 // Slightly slower for learning

  // Try to find a native English voice
  const enVoice =
    voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Google")) ||
    voices.find((voice) => voice.lang.startsWith("en"))

  if (enVoice) {
    utterance.voice = enVoice
  }

  speechSynthesis.speak(utterance)
}
