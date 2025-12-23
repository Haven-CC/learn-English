// English phonics rules and examples for Chinese learners

export interface PhonicsRule {
  id: string
  category: "vowel" | "consonant" | "combination"
  symbol: string
  ipa: string
  description: string
  examples: string[]
  chineseHint?: string
}

export const phonicsRules: PhonicsRule[] = [
  // Vowels
  {
    id: "a-short",
    category: "vowel",
    symbol: "a",
    ipa: "/æ/",
    description: "Short 'a' sound",
    examples: ["cat", "hat", "man", "bad"],
    chineseHint: "类似汉语拼音 'a' 但嘴巴张更大",
  },
  {
    id: "e-short",
    category: "vowel",
    symbol: "e",
    ipa: "/ɛ/",
    description: "Short 'e' sound",
    examples: ["bed", "pet", "red", "get"],
    chineseHint: "类似汉语拼音 'ei' 的前半部分",
  },
  {
    id: "i-short",
    category: "vowel",
    symbol: "i",
    ipa: "/ɪ/",
    description: "Short 'i' sound",
    examples: ["sit", "hit", "big", "pin"],
    chineseHint: "类似汉语拼音 'yi' 但更短促",
  },
  {
    id: "o-short",
    category: "vowel",
    symbol: "o",
    ipa: "/ɒ/",
    description: "Short 'o' sound",
    examples: ["hot", "pot", "dog", "box"],
    chineseHint: "类似汉语拼音 'o'",
  },
  {
    id: "u-short",
    category: "vowel",
    symbol: "u",
    ipa: "/ʌ/",
    description: "Short 'u' sound",
    examples: ["cup", "but", "run", "sun"],
    chineseHint: "类似汉语拼音 'a' 的轻声",
  },

  // Long vowels
  {
    id: "a-long",
    category: "vowel",
    symbol: "a_e",
    ipa: "/eɪ/",
    description: "Long 'a' sound (with silent e)",
    examples: ["cake", "make", "name", "face"],
    chineseHint: "类似汉语拼音 'ei'",
  },
  {
    id: "e-long",
    category: "vowel",
    symbol: "e_e",
    ipa: "/iː/",
    description: "Long 'e' sound",
    examples: ["these", "complete", "Pete"],
    chineseHint: "类似汉语拼音 'yi'",
  },
  {
    id: "i-long",
    category: "vowel",
    symbol: "i_e",
    ipa: "/aɪ/",
    description: "Long 'i' sound (with silent e)",
    examples: ["bike", "like", "time", "nice"],
    chineseHint: "类似汉语拼音 'ai'",
  },
  {
    id: "o-long",
    category: "vowel",
    symbol: "o_e",
    ipa: "/oʊ/",
    description: "Long 'o' sound (with silent e)",
    examples: ["home", "hope", "note", "code"],
    chineseHint: "类似汉语拼音 'ou'",
  },
  {
    id: "u-long",
    category: "vowel",
    symbol: "u_e",
    ipa: "/juː/",
    description: "Long 'u' sound (with silent e)",
    examples: ["cute", "use", "tube", "huge"],
    chineseHint: "类似汉语拼音 'you'",
  },

  // Consonants
  {
    id: "th-voiced",
    category: "consonant",
    symbol: "th",
    ipa: "/ð/",
    description: "Voiced 'th' sound",
    examples: ["this", "that", "the", "father"],
    chineseHint: "舌头放在上下齿之间,振动声带",
  },
  {
    id: "th-voiceless",
    category: "consonant",
    symbol: "th",
    ipa: "/θ/",
    description: "Voiceless 'th' sound",
    examples: ["think", "thing", "thank", "math"],
    chineseHint: "舌头放在上下齿之间,不振动声带",
  },
  {
    id: "sh",
    category: "consonant",
    symbol: "sh",
    ipa: "/ʃ/",
    description: "'sh' sound",
    examples: ["ship", "show", "fish", "wash"],
    chineseHint: "类似汉语拼音 'sh'",
  },
  {
    id: "ch",
    category: "consonant",
    symbol: "ch",
    ipa: "/tʃ/",
    description: "'ch' sound",
    examples: ["chair", "chip", "church", "watch"],
    chineseHint: "类似汉语拼音 'q'",
  },

  // Common combinations
  {
    id: "ea",
    category: "combination",
    symbol: "ea",
    ipa: "/iː/",
    description: "Long 'e' sound",
    examples: ["eat", "read", "meat", "teach"],
    chineseHint: "类似汉语拼音 'yi'",
  },
  {
    id: "oo-long",
    category: "combination",
    symbol: "oo",
    ipa: "/uː/",
    description: "Long 'oo' sound",
    examples: ["food", "moon", "pool", "school"],
    chineseHint: "类似汉语拼音 'wu'",
  },
  {
    id: "oo-short",
    category: "combination",
    symbol: "oo",
    ipa: "/ʊ/",
    description: "Short 'oo' sound",
    examples: ["book", "look", "good", "foot"],
    chineseHint: "类似汉语拼音 'u'",
  },
  {
    id: "tion",
    category: "combination",
    symbol: "tion",
    ipa: "/ʃən/",
    description: "'-tion' ending",
    examples: ["nation", "action", "station", "education"],
    chineseHint: "读作 'shun'",
  },
  {
    id: "ing",
    category: "combination",
    symbol: "ing",
    ipa: "/ɪŋ/",
    description: "'-ing' ending",
    examples: ["running", "playing", "eating", "walking"],
    chineseHint: "'i' + 后鼻音 'ng'",
  },
  {
    id: "ar",
    category: "combination",
    symbol: "ar",
    ipa: "/ɑːr/",
    description: "'ar' sound",
    examples: ["car", "far", "star", "park"],
    chineseHint: "类似汉语拼音 'a' + 'r' 的卷舌音",
  },
  {
    id: "er",
    category: "combination",
    symbol: "er",
    ipa: "/ɜːr/",
    description: "'er' sound",
    examples: ["her", "term", "person", "teacher"],
    chineseHint: "轻声 'e' + 卷舌音",
  },
]
