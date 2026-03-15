/* ─────────────────────────────────────────────
   CROSSWIRE — Puzzle Data
   Each puzzle has:
     answer    — the hidden 5-letter word (string)
     category  — short label shown to player
     puzzleNum — used in share card (#001 etc.)
     freeClue  — always visible, costs nothing
     clues     — 4 banked clues, broad → specific
                 each has .text and .check(word)
   ───────────────────────────────────────────── */

'use strict';

/* ── Helpers ───────────────────────────────── */

const VOWELS = new Set(['A','E','I','O','U']);

function isVowel(ch) {
  return VOWELS.has(ch.toUpperCase());
}

function isConsonant(ch) {
  const c = ch.toUpperCase();
  return c >= 'A' && c <= 'Z' && !VOWELS.has(c);
}

function up(word) {
  return word.toUpperCase();
}

function vowelCount(word) {
  return up(word).split('').filter(isVowel).length;
}

function hasConsecutiveDuplicate(word) {
  const w = up(word);
  for (let i = 0; i < w.length - 1; i++) {
    if (w[i] === w[i + 1]) return true;
  }
  return false;
}

function hasConsecutiveDuplicateVowel(word) {
  const w = up(word);
  for (let i = 0; i < w.length - 1; i++) {
    if (w[i] === w[i + 1] && isVowel(w[i])) return true;
  }
  return false;
}

function hasConsecutiveDuplicateConsonant(word) {
  const w = up(word);
  for (let i = 0; i < w.length - 1; i++) {
    if (w[i] === w[i + 1] && isConsonant(w[i])) return true;
  }
  return false;
}

function allUnique(word) {
  const w = up(word);
  return new Set(w.split('')).size === w.length;
}

function startsWithConsonantCluster(word) {
  const w = up(word);
  return isConsonant(w[0]) && isConsonant(w[1]);
}

function endsWithConsonantCluster(word) {
  const w = up(word);
  const n = w.length;
  return isConsonant(w[n - 1]) && isConsonant(w[n - 2]);
}

function startsAndEndsWith(word, type) {
  const w = up(word);
  const test = type === 'vowel' ? isVowel : isConsonant;
  return test(w[0]) && test(w[w.length - 1]);
}

function letterAtIndex(word, index) {
  return up(word)[index];
}

function rhymesWithAny(word, rhymeList) {
  return rhymeList.includes(up(word));
}


/* ── Puzzle bank ────────────────────────────── */

const PUZZLES = [

  // ── 001 ──────────────────────────────────
  {
    answer: 'FLOOR',
    category: 'Place',
    puzzleNum: 1,
    freeClue: {
      text: 'You walk on it every day.',
      check: null,
    },
    clues: [
      {
        text: 'The word contains a double letter.',
        check: (w) => hasConsecutiveDuplicate(w),
      },
      {
        text: 'The double letter is a vowel.',
        check: (w) => hasConsecutiveDuplicateVowel(w),
      },
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'Rhymes with DOOR.',
        check: (w) => rhymesWithAny(w, ['FLOOR','DOOR','BORE','CORE','FORE','GORE','LORE','MORE','PORE','SORE','TORE','WORE','ADORE','POUR','YOUR']),
      },
    ],
  },

  // ── 002 ──────────────────────────────────
  {
    answer: 'BEACH',
    category: 'Place',
    puzzleNum: 2,
    freeClue: {
      text: 'Sand between your toes.',
      check: null,
    },
    clues: [
      {
        text: 'Contains exactly two vowels.',
        check: (w) => vowelCount(w) === 2,
      },
      {
        text: 'The two vowels sit side by side.',
        check: (w) => {
          const s = up(w);
          for (let i = 0; i < s.length - 1; i++) {
            if (isVowel(s[i]) && isVowel(s[i + 1])) return true;
          }
          return false;
        },
      },
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'Rhymes with TEACH.',
        check: (w) => rhymesWithAny(w, ['BEACH','TEACH','REACH','PEACH','LEACH','BLEACH','PREACH','EACH']),
      },
    ],
  },

  // ── 003 ──────────────────────────────────
  {
    answer: 'CRANE',
    category: 'Animal / Object',
    puzzleNum: 3,
    freeClue: {
      text: 'It can lift enormous weight — or take flight.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly two vowels.',
        check: (w) => vowelCount(w) === 2,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'Rhymes with PLANE.',
        check: (w) => rhymesWithAny(w, ['CRANE','PLANE','LANE','RAIN','MAIN','MANE','VANE','CANE','BANE','SANE','PANE','WANE','CHAIN','TRAIN','BRAIN','GRAIN','PLAIN','STAIN','DRAIN','SPAIN','GAIN','VAIN']),
      },
    ],
  },

  // ── 004 ──────────────────────────────────
  {
    answer: 'GHOST',
    category: 'Concept',
    puzzleNum: 4,
    freeClue: {
      text: 'It haunts.',
      check: null,
    },
    clues: [
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'Ends in a cluster of two consonants.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'The single vowel falls in the middle of the word.',
        check: (w) => {
          const s = up(w);
          const mid = Math.floor(s.length / 2);
          return isVowel(s[mid]);
        },
      },
    ],
  },

  // ── 005 ──────────────────────────────────
  {
    answer: 'KNEEL',
    category: 'Action',
    puzzleNum: 5,
    freeClue: {
      text: 'A posture of reverence or submission.',
      check: null,
    },
    clues: [
      {
        text: 'The word contains a double letter.',
        check: (w) => hasConsecutiveDuplicate(w),
      },
      {
        text: 'The double letter is a vowel.',
        check: (w) => hasConsecutiveDuplicateVowel(w),
      },
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Ends in a single consonant (preceded by a vowel).',
        check: (w) => {
          const s = up(w);
          return isConsonant(s[s.length - 1]) && isVowel(s[s.length - 2]);
        },
      },
    ],
  },

  // ── 006 ──────────────────────────────────
  {
    answer: 'PRISM',
    category: 'Object',
    puzzleNum: 6,
    freeClue: {
      text: 'Light bends through it.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
    ],
  },

  // ── 007 ──────────────────────────────────
  {
    answer: 'TORCH',
    category: 'Object',
    puzzleNum: 7,
    freeClue: {
      text: 'It gives light in the dark.',
      check: null,
    },
    clues: [
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'The vowel is the second letter.',
        check: (w) => isVowel(up(w)[1]),
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
    ],
  },

  // ── 008 ──────────────────────────────────
  {
    answer: 'GREET',
    category: 'Action',
    puzzleNum: 8,
    freeClue: {
      text: 'What you do when someone arrives.',
      check: null,
    },
    clues: [
      {
        text: 'The word contains a double letter.',
        check: (w) => hasConsecutiveDuplicate(w),
      },
      {
        text: 'The double letter is a vowel.',
        check: (w) => hasConsecutiveDuplicateVowel(w),
      },
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
    ],
  },

  // ── 009 ──────────────────────────────────
  {
    answer: 'QUILL',
    category: 'Object',
    puzzleNum: 9,
    freeClue: {
      text: 'A writing instrument from a feather.',
      check: null,
    },
    clues: [
      {
        text: 'The word contains a double letter.',
        check: (w) => hasConsecutiveDuplicate(w),
      },
      {
        text: 'The double letter is a consonant.',
        check: (w) => hasConsecutiveDuplicateConsonant(w),
      },
      {
        text: 'Contains exactly two vowels.',
        check: (w) => vowelCount(w) === 2,
      },
      {
        text: 'The first letter appears nowhere else in the word.',
        check: (w) => {
          const s = up(w);
          return s.split('').filter(c => c === s[0]).length === 1;
        },
      },
    ],
  },

  // ── 010 ──────────────────────────────────
  {
    answer: 'STAMP',
    category: 'Object',
    puzzleNum: 10,
    freeClue: {
      text: 'Used to leave a mark.',
      check: null,
    },
    clues: [
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'Ends in a cluster of two consonants.',
        check: (w) => endsWithConsonantCluster(w),
      },
    ],
  },

  // ── 011 ──────────────────────────────────
  {
    answer: 'SWIFT',
    category: 'Adjective',
    puzzleNum: 11,
    freeClue: {
      text: 'Speed personified.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'Ends in a cluster of two consonants.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
    ],
  },

  // ── 012 ──────────────────────────────────
  {
    answer: 'BLIND',
    category: 'Adjective / Object',
    puzzleNum: 12,
    freeClue: {
      text: 'Unable to see — or a window covering.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
    ],
  },

  // ── 013 ──────────────────────────────────
  {
    answer: 'CLASP',
    category: 'Object / Action',
    puzzleNum: 13,
    freeClue: {
      text: 'It holds things firmly together.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'Ends in a cluster of two consonants.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
    ],
  },

  // ── 014 ──────────────────────────────────
  {
    answer: 'THUMB',
    category: 'Body Part',
    puzzleNum: 14,
    freeClue: {
      text: 'The widest of the five.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster (two consonants in a row).',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
    ],
  },

  // ── 015 ──────────────────────────────────
  {
    answer: 'IVORY',
    category: 'Material',
    puzzleNum: 15,
    freeClue: {
      text: 'White as a tusk.',
      check: null,
    },
    clues: [
      {
        text: 'Starts with a vowel.',
        check: (w) => isVowel(up(w)[0]),
      },
      {
        text: 'Contains exactly two vowels.',
        check: (w) => vowelCount(w) === 2,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'The two vowels are not adjacent to each other.',
        check: (w) => {
          const s = up(w);
          for (let i = 0; i < s.length - 1; i++) {
            if (isVowel(s[i]) && isVowel(s[i + 1])) return false;
          }
          return vowelCount(w) === 2;
        },
      },
    ],
  },

];


/* ── Date → puzzle ──────────────────────────── */

function getTodaysPuzzle() {
  // Anchor: puzzle #001 (FLOOR) on 2026-01-01
  const anchor = new Date('2026-01-01T00:00:00');
  const now    = new Date();
  // Zero out time so each day maps cleanly
  now.setHours(0, 0, 0, 0);
  const msPerDay  = 24 * 60 * 60 * 1000;
  const dayOffset = Math.floor((now - anchor) / msPerDay);
  const index     = ((dayOffset % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[index];
}
