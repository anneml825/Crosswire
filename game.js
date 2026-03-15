/* ─────────────────────────────────────────────
   CROSSWIRE — Game Logic
   ───────────────────────────────────────────── */

'use strict';

(function () {

  /* ── State ─────────────────────────────────── */

  let puzzle         = null;   // current puzzle object
  let revealedClues  = 0;      // how many banked clues revealed
  let wrongGuesses   = 0;      // wrong guess count
  let lockedLetters  = [];     // per-slot locked letter (null or char)
  let solved         = false;


  /* ── Bootstrap ──────────────────────────────── */

  function init() {
    puzzle        = getTodaysPuzzle();
    lockedLetters = Array(puzzle.answer.length).fill(null);

    renderDate();
    renderPuzzleMeta();
    renderSlots();
    renderFreeClue();
    renderClueBank();
    setupInput();
    updateScore();
  }


  /* ── Date line ─────────────────────────────── */

  function renderDate() {
    const DAYS   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    const d = new Date();
    document.getElementById('date-line').textContent =
      `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }


  /* ── Puzzle meta ────────────────────────────── */

  function renderPuzzleMeta() {
    document.getElementById('category').textContent  = puzzle.category.toUpperCase();
    document.getElementById('puzzle-num').textContent = '#' + String(puzzle.puzzleNum).padStart(3, '0');
  }


  /* ── Letter slots ───────────────────────────── */

  function renderSlots() {
    const el = document.getElementById('slots');
    el.innerHTML = '';
    for (let i = 0; i < puzzle.answer.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id        = 'slot-' + i;
      el.appendChild(slot);
    }
  }

  function refreshSlots(winAnimation) {
    for (let i = 0; i < puzzle.answer.length; i++) {
      const slot = document.getElementById('slot-' + i);
      if (winAnimation) {
        slot.textContent = puzzle.answer[i];
        slot.classList.remove('locked');
        slot.classList.add('solved');
        slot.style.animationDelay = (i * 0.07) + 's';
      } else if (lockedLetters[i]) {
        slot.textContent = lockedLetters[i];
        slot.classList.add('locked');
      }
    }
  }


  /* ── Free clue ──────────────────────────────── */

  function renderFreeClue() {
    document.getElementById('free-clue-text').textContent = puzzle.freeClue.text;
  }


  /* ── Clue bank ──────────────────────────────── */

  function renderClueBank() {
    const container = document.getElementById('clue-bank');
    container.innerHTML = '';
    puzzle.clues.forEach((_, i) => {
      const row = document.createElement('div');
      row.className = 'banked-clue';
      row.id        = 'banked-clue-' + i;
      container.appendChild(row);
      drawClueBankRow(i);
    });
  }

  function drawClueBankRow(index) {
    const row  = document.getElementById('banked-clue-' + index);
    const clue = puzzle.clues[index];

    if (index < revealedClues) {
      // Already revealed
      row.innerHTML =
        '<div class="banked-header">' +
          '<span class="clue-num">CLUE ' + (index + 1) + '</span>' +
          '<span class="clue-tag cost-tag">−1</span>' +
        '</div>' +
        '<div class="revealed-text">' +
          '<span class="clue-text">' + escapeHtml(clue.text) + '</span>' +
        '</div>';

    } else if (index === revealedClues && !solved) {
      // Next in line — show Reveal button
      row.innerHTML =
        '<div class="banked-header">' +
          '<span class="clue-num">CLUE ' + (index + 1) + '</span>' +
          '<button class="reveal-btn" id="reveal-btn-' + index + '">REVEAL &nbsp;−1 pt</button>' +
        '</div>';
      document.getElementById('reveal-btn-' + index)
        .addEventListener('click', function () { revealClue(index); });

    } else {
      // Not yet available
      row.innerHTML =
        '<div class="banked-header">' +
          '<span class="clue-num">CLUE ' + (index + 1) + '</span>' +
          '<span class="clue-locked-hint">· · ·</span>' +
        '</div>';
    }
  }

  function revealClue(index) {
    if (index !== revealedClues || solved) return;
    revealedClues++;
    drawClueBankRow(index);
    if (index + 1 < puzzle.clues.length) {
      drawClueBankRow(index + 1);
    }
    updateScore();
    setFeedback('', '');
  }


  /* ── Input & submit ─────────────────────────── */

  function setupInput() {
    const input = document.getElementById('guess-input');
    const btn   = document.getElementById('submit-btn');
    btn.addEventListener('click', submitGuess);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitGuess();
    });
    input.focus();
  }

  function submitGuess() {
    if (solved) return;

    const input = document.getElementById('guess-input');
    const raw   = input.value.trim().toUpperCase().replace(/[^A-Z]/g, '');

    if (!raw) return;

    if (raw.length !== puzzle.answer.length) {
      setFeedback('Must be ' + puzzle.answer.length + ' letters.', 'error');
      return;
    }

    input.value = '';

    if (raw === puzzle.answer) {
      handleWin();
      return;
    }

    // Wrong guess
    wrongGuesses++;
    lockCorrectPositions(raw);
    updateScore();

    // Clue-fit feedback
    const { fits, total } = countClueFits(raw);
    if (total === 0) {
      setFeedback(
        wrongGuesses === 1
          ? 'Not quite — keep going.'
          : 'Not quite. ' + wrongGuesses + ' wrong so far.',
        ''
      );
    } else {
      setFeedback(
        'Fits ' + fits + ' of ' + total + ' revealed clue' + (total !== 1 ? 's' : '') + '.',
        ''
      );
    }
  }


  /* ── Clue-fit logic ─────────────────────────── */

  function countClueFits(word) {
    let fits  = 0;
    let total = 0;

    // Free clue (if checkable)
    if (puzzle.freeClue.check) {
      total++;
      if (puzzle.freeClue.check(word)) fits++;
    }

    // Revealed banked clues
    for (let i = 0; i < revealedClues; i++) {
      const clue = puzzle.clues[i];
      if (clue.check) {
        total++;
        if (clue.check(word)) fits++;
      }
    }

    return { fits, total };
  }


  /* ── Letter locking ─────────────────────────── */

  function lockCorrectPositions(guess) {
    let changed = false;
    for (let i = 0; i < puzzle.answer.length; i++) {
      if (guess[i] === puzzle.answer[i] && !lockedLetters[i]) {
        lockedLetters[i] = puzzle.answer[i];
        changed = true;
      }
    }
    if (changed) refreshSlots(false);
  }


  /* ── Win handling ───────────────────────────── */

  function handleWin() {
    solved = true;
    lockedLetters = puzzle.answer.split('');
    refreshSlots(true);

    // Disable UI
    document.getElementById('guess-input').disabled = true;
    document.getElementById('submit-btn').disabled  = true;
    // Remove any remaining reveal buttons
    for (let i = revealedClues; i < puzzle.clues.length; i++) {
      const btn = document.getElementById('reveal-btn-' + i);
      if (btn) btn.disabled = true;
    }

    updateScore();
    saveStreak();

    // Wait for slot animation, then show overlay
    const delay = puzzle.answer.length * 70 + 350;
    setTimeout(showWinOverlay, delay);
  }

  function scoreLabel() {
    const score = revealedClues + wrongGuesses;
    if (score === 0) return 'Genius \uD83D\uDD25';   // 🔥
    if (score === 1) return 'Sharp \uD83E\uDDE0';    // 🧠
    if (score <= 3)  return 'Strong';
    return 'Got there';
  }

  function showWinOverlay() {
    const overlay = document.getElementById('win-overlay');
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');

    const label     = scoreLabel();
    const cluesWord = revealedClues === 1 ? 'clue' : 'clues';
    const wrongWord = wrongGuesses  === 1 ? 'wrong' : 'wrong';

    document.getElementById('win-score-label').textContent = label;
    document.getElementById('win-stats').textContent =
      revealedClues + ' ' + cluesWord + ' revealed\u2002·\u2002' +
      wrongGuesses + ' ' + wrongWord;

    const shareText = buildShareText();
    document.getElementById('share-card').textContent = shareText;

    document.getElementById('share-btn').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(flashCopied);
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = shareText;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        flashCopied();
      }
    });

    const streak = loadStreak();
    const streakEl = document.getElementById('streak-line');
    if (streak > 1) {
      streakEl.textContent = streak + '\u2002day streak';
    }
  }

  function flashCopied() {
    const msg = document.getElementById('copied-msg');
    msg.textContent = 'Copied to clipboard';
    msg.classList.add('visible');
    setTimeout(function () { msg.classList.remove('visible'); }, 2200);
  }


  /* ── Share card ─────────────────────────────── */

  function buildShareText() {
    const label     = scoreLabel();
    const num       = '#' + String(puzzle.puzzleNum).padStart(3, '0');
    const cluesWord = revealedClues === 1 ? 'clue' : 'clues';
    const statLine  = revealedClues + ' ' + cluesWord + ', ' + wrongGuesses + ' wrong';

    const clueEmojis = puzzle.clues
      .map(function (_, i) { return i < revealedClues ? '\uD83D\uDFE1' : '\u2B1C'; })
      .join('');

    const misses = wrongGuesses === 0 ? 'none' : String(wrongGuesses);

    return [
      'CROSSWIRE ' + num + '  ' + label + '  \u2014  ' + statLine,
      'Clues: ' + clueEmojis + '  Misses: ' + misses,
      'crosswire.game',
    ].join('\n');
  }


  /* ── Score display ──────────────────────────── */

  function updateScore() {
    document.getElementById('clues-used').textContent    = revealedClues;
    document.getElementById('wrong-guesses').textContent = wrongGuesses;
  }


  /* ── Feedback ───────────────────────────────── */

  function setFeedback(msg, cls) {
    const el = document.getElementById('feedback');
    el.textContent = msg;
    el.className   = 'feedback' + (cls ? ' ' + cls : '');
  }


  /* ── Streak (localStorage) ──────────────────── */

  const STREAK_KEY = 'crosswire-streak';

  function todayStamp() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function saveStreak() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(STREAK_KEY)) || {};
    } catch (_) {
      data = {};
    }

    const today = todayStamp();
    if (data.lastSolved === today) return; // already counted today

    if (data.lastSolved) {
      const last    = new Date(data.lastSolved);
      const now     = new Date();
      last.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffDays = Math.round((now - last) / 86400000);

      if (diffDays === 1) {
        data.streak = (data.streak || 1) + 1;
      } else {
        data.streak = 1;
      }
    } else {
      data.streak = 1;
    }

    data.lastSolved = today;
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function loadStreak() {
    try {
      const data = JSON.parse(localStorage.getItem(STREAK_KEY)) || {};
      return data.streak || 0;
    } catch (_) {
      return 0;
    }
  }


  /* ── Utility ────────────────────────────────── */

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


  /* ── Start ──────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
