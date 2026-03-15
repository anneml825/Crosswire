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
/*
   Clue ordering rule:
   - freeClue  : a structural fact about the word (vowel count, double
                 letter, letter position, etc.) — always visible, free
   - clues 1–3 : structural, increasingly specific
   - clue 4    : the narrative "aha" hint — or a strong structural closer
*/

const PUZZLES = [

  // ── 001 ── FLOOR ─────────────────────────
  // F-L-O-O-R  |  double O, starts+ends consonant, rhymes DOOR
  {
    answer: 'FLOOR',
    category: 'Place',
    puzzleNum: 1,
    freeClue: {
      text: 'Contains a double letter.',
      check: (w) => hasConsecutiveDuplicate(w),
    },
    clues: [
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
        check: (w) => rhymesWithAny(w, ['FLOOR','DOOR','BORE','CORE','FORE','GORE','LORE','MORE','PORE','SORE','TORE','WORE','POUR','YOUR']),
      },
      {
        text: 'You walk on it every day.',
        check: null,
      },
    ],
  },

  // ── 002 ── BEACH ─────────────────────────
  // B-E-A-C-H  |  2 vowels adjacent (EA), starts+ends consonant
  {
    answer: 'BEACH',
    category: 'Place',
    puzzleNum: 2,
    freeClue: {
      text: 'Contains exactly two vowels.',
      check: (w) => vowelCount(w) === 2,
    },
    clues: [
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
      {
        text: 'Sand between your toes.',
        check: null,
      },
    ],
  },

  // ── 003 ── CRANE ─────────────────────────
  // C-R-A-N-E  |  CR cluster, 2 vowels, all unique, ends vowel
  {
    answer: 'CRANE',
    category: 'Animal / Object',
    puzzleNum: 3,
    freeClue: {
      text: 'Starts with a consonant cluster.',
      check: (w) => startsWithConsonantCluster(w),
    },
    clues: [
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
        check: (w) => rhymesWithAny(w, ['CRANE','PLANE','LANE','RAIN','MAIN','MANE','VANE','CANE','BANE','SANE','PANE','WANE','CHAIN','TRAIN','BRAIN','GRAIN','PLAIN','STAIN','DRAIN','SPAIN']),
      },
      {
        text: 'It can lift enormous weight — or take flight.',
        check: null,
      },
    ],
  },

  // ── 004 ── GHOST ─────────────────────────
  // G-H-O-S-T  |  1 vowel, GH cluster, O in middle (pos 2), ST end cluster
  {
    answer: 'GHOST',
    category: 'Concept',
    puzzleNum: 4,
    freeClue: {
      text: 'Contains exactly one vowel.',
      check: (w) => vowelCount(w) === 1,
    },
    clues: [
      {
        text: 'Starts with a consonant cluster.',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'The single vowel is in the exact middle of the word.',
        check: (w) => {
          const s = up(w);
          return isVowel(s[Math.floor(s.length / 2)]);
        },
      },
      {
        text: 'It haunts.',
        check: null,
      },
    ],
  },

  // ── 005 ── KNEEL ─────────────────────────
  // K-N-E-E-L  |  double EE, KN cluster, ends consonant after vowel
  {
    answer: 'KNEEL',
    category: 'Action',
    puzzleNum: 5,
    freeClue: {
      text: 'Contains a double letter.',
      check: (w) => hasConsecutiveDuplicate(w),
    },
    clues: [
      {
        text: 'The double letter is a vowel.',
        check: (w) => hasConsecutiveDuplicateVowel(w),
      },
      {
        text: 'Starts with a consonant cluster.',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'The double letter falls in positions 3 and 4.',
        check: (w) => up(w)[2] === up(w)[3],
      },
      {
        text: 'A posture of reverence or submission.',
        check: null,
      },
    ],
  },

  // ── 006 ── PRISM ─────────────────────────
  // P-R-I-S-M  |  PR cluster, 1 vowel, I in middle (pos 2), all unique
  {
    answer: 'PRISM',
    category: 'Object',
    puzzleNum: 6,
    freeClue: {
      text: 'Starts with a consonant cluster.',
      check: (w) => startsWithConsonantCluster(w),
    },
    clues: [
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'The vowel is in the exact middle of the word.',
        check: (w) => {
          const s = up(w);
          return isVowel(s[Math.floor(s.length / 2)]);
        },
      },
      {
        text: 'Light bends through it.',
        check: null,
      },
    ],
  },

  // ── 007 ── TORCH ─────────────────────────
  // T-O-R-C-H  |  1 vowel, O at pos 1 (2nd letter), ends CH cluster
  {
    answer: 'TORCH',
    category: 'Object',
    puzzleNum: 7,
    freeClue: {
      text: 'Contains exactly one vowel.',
      check: (w) => vowelCount(w) === 1,
    },
    clues: [
      {
        text: 'The vowel is the second letter.',
        check: (w) => isVowel(up(w)[1]),
      },
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'Carried in a relay — or used to light the dark.',
        check: null,
      },
    ],
  },

  // ── 008 ── GREET ─────────────────────────
  // G-R-E-E-T  |  double EE, GR cluster, EE at positions 3+4
  {
    answer: 'GREET',
    category: 'Action',
    puzzleNum: 8,
    freeClue: {
      text: 'Contains a double letter.',
      check: (w) => hasConsecutiveDuplicate(w),
    },
    clues: [
      {
        text: 'The double letter is a vowel.',
        check: (w) => hasConsecutiveDuplicateVowel(w),
      },
      {
        text: 'Starts with a consonant cluster.',
        check: (w) => startsWithConsonantCluster(w),
      },
      {
        text: 'The double letter falls in positions 3 and 4.',
        check: (w) => up(w)[2] === up(w)[3],
      },
      {
        text: 'What you do when someone arrives.',
        check: null,
      },
    ],
  },

  // ── 009 ── QUILL ─────────────────────────
  // Q-U-I-L-L  |  double LL (consonant), 2 vowels, LL at the end
  {
    answer: 'QUILL',
    category: 'Object',
    puzzleNum: 9,
    freeClue: {
      text: 'Contains a double letter.',
      check: (w) => hasConsecutiveDuplicate(w),
    },
    clues: [
      {
        text: 'The double letter is a consonant.',
        check: (w) => hasConsecutiveDuplicateConsonant(w),
      },
      {
        text: 'Contains exactly two vowels.',
        check: (w) => vowelCount(w) === 2,
      },
      {
        text: 'The double letter falls at the very end of the word.',
        check: (w) => {
          const s = up(w);
          return s[s.length - 1] === s[s.length - 2];
        },
      },
      {
        text: 'A writing instrument plucked from a bird\'s wing.',
        check: null,
      },
    ],
  },

  // ── 010 ── STAMP ─────────────────────────
  // S-T-A-M-P  |  1 vowel, A in middle (pos 2), starts+ends consonant, MP end cluster
  {
    answer: 'STAMP',
    category: 'Object',
    puzzleNum: 10,
    freeClue: {
      text: 'Contains exactly one vowel.',
      check: (w) => vowelCount(w) === 1,
    },
    clues: [
      {
        text: 'The vowel falls in the exact middle of the word.',
        check: (w) => {
          const s = up(w);
          return isVowel(s[Math.floor(s.length / 2)]);
        },
      },
      {
        text: 'Starts and ends with a consonant.',
        check: (w) => startsAndEndsWith(w, 'consonant'),
      },
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'Used to leave a mark.',
        check: null,
      },
    ],
  },

  // ── 011 ── SWIFT ─────────────────────────
  // S-W-I-F-T  |  SW start cluster, FT end cluster, 1 vowel, I at pos 2
  {
    answer: 'SWIFT',
    category: 'Adjective',
    puzzleNum: 11,
    freeClue: {
      text: 'Starts with a consonant cluster.',
      check: (w) => startsWithConsonantCluster(w),
    },
    clues: [
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'The vowel is the third letter.',
        check: (w) => isVowel(up(w)[2]),
      },
      {
        text: 'Moving without delay.',
        check: null,
      },
    ],
  },

  // ── 012 ── BLIND ─────────────────────────
  // B-L-I-N-D  |  BL start cluster, ND end cluster, 1 vowel, all unique
  {
    answer: 'BLIND',
    category: 'Adjective / Object',
    puzzleNum: 12,
    freeClue: {
      text: 'Ends with a consonant cluster.',
      check: (w) => endsWithConsonantCluster(w),
    },
    clues: [
      {
        text: 'Starts with a consonant cluster.',
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
        text: 'Can mean unable to see — or a shade on a window.',
        check: null,
      },
    ],
  },

  // ── 013 ── CLASP ─────────────────────────
  // C-L-A-S-P  |  CL start cluster, SP end cluster, 1 vowel, A at pos 2
  {
    answer: 'CLASP',
    category: 'Object / Action',
    puzzleNum: 13,
    freeClue: {
      text: 'Starts with a consonant cluster.',
      check: (w) => startsWithConsonantCluster(w),
    },
    clues: [
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'The vowel is the third letter.',
        check: (w) => isVowel(up(w)[2]),
      },
      {
        text: 'It holds things firmly together.',
        check: null,
      },
    ],
  },

  // ── 014 ── THUMB ─────────────────────────
  // T-H-U-M-B  |  TH start cluster, MB end cluster, 1 vowel, U at pos 2
  {
    answer: 'THUMB',
    category: 'Body Part',
    puzzleNum: 14,
    freeClue: {
      text: 'Starts with a consonant cluster.',
      check: (w) => startsWithConsonantCluster(w),
    },
    clues: [
      {
        text: 'Ends with a consonant cluster.',
        check: (w) => endsWithConsonantCluster(w),
      },
      {
        text: 'Contains exactly one vowel.',
        check: (w) => vowelCount(w) === 1,
      },
      {
        text: 'The vowel is the third letter.',
        check: (w) => isVowel(up(w)[2]),
      },
      {
        text: 'The shortest and widest finger.',
        check: null,
      },
    ],
  },

  // ── 015 ── IVORY ─────────────────────────
  // I-V-O-R-Y  |  starts vowel, 2 vowels, all unique, vowels at pos 0+2
  {
    answer: 'IVORY',
    category: 'Material',
    puzzleNum: 15,
    freeClue: {
      text: 'Starts with a vowel.',
      check: (w) => isVowel(up(w)[0]),
    },
    clues: [
      {
        text: 'Contains exactly two vowels.',
        check: (w) => vowelCount(w) === 2,
      },
      {
        text: 'No letter appears more than once.',
        check: (w) => allUnique(w),
      },
      {
        text: 'One vowel is at the start, the other is in the middle of the word.',
        check: (w) => {
          const s = up(w);
          return isVowel(s[0]) && isVowel(s[Math.floor(s.length / 2)]) && vowelCount(w) === 2;
        },
      },
      {
        text: 'The colour of old piano keys and elephant tusks.',
        check: null,
      },
    ],
  },

];


/* ── Date → puzzle ──────────────────────────── */

function getTodaysPuzzle() {
  // Anchor: puzzle #001 (FLOOR) on 2026-01-01
  const anchor = new Date('2026-01-01T00:00:00');
  const now    = new Date();
  now.setHours(0, 0, 0, 0);
  const msPerDay  = 24 * 60 * 60 * 1000;
  const dayOffset = Math.floor((now - anchor) / msPerDay);

  // Dev offset lets you step through puzzles without waiting a day
  let devOffset = 0;
  try { devOffset = parseInt(localStorage.getItem('crosswire-dev-offset') || '0', 10); } catch (_) {}

  const index = (((dayOffset + devOffset) % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[index];
}
