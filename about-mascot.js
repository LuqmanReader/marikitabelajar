/* LedgerPeer mascot tour
   - right-side chapter content stays as it is
   - left mascot moves regularly
   - left speech bubble changes every 2 seconds
   - bubble text is DIFFERENT from the chapter text
*/
(() => {
  'use strict';

  const chapters = [...document.querySelectorAll('.chapter[data-pose]')];
  const pose = document.getElementById('mascotPose');
  const caption = document.getElementById('bubbleCaption');
  const speech = document.getElementById('mascotSpeech');
  const counter = document.getElementById('storyCounter');
  const progress = document.getElementById('storyProgressBar');
  const listen = document.getElementById('listenBtn');
  const listenLabel = document.getElementById('listenLabel');
  const soundNote = document.getElementById('soundNote');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bubble = speech?.closest('.speech-bubble');
  const board = document.querySelector('.mascot-board');

  if (!chapters.length || !pose || !speech || !caption) return;

  const assets = {
    wave: ['ledgerpeer-wave.png', 'LedgerPeer mascot waving'],
    explain: ['ledgerpeer-explain.png', 'LedgerPeer mascot explaining a lesson'],
    study: ['ledgerpeer-study.png', 'LedgerPeer mascot studying'],
    idle: ['ledgerpeer-idle.png', 'LedgerPeer mascot standing cheerfully'],
    celebrate: ['ledgerpeer-celebrate.png', 'LedgerPeer mascot celebrating']
  };

  // Catchy rotating lines for the LEFT bubble only
  const bubbleLines = [
    { caption: 'SAY HELLO', speech: "Hey! Welcome to LedgerPeer. Let's make revision feel lighter." },
    { caption: 'SMARTER STUDY', speech: "One weak topic at a time. That's how strong students are built." },
    { caption: 'NO PANIC', speech: "Wrong answers are not failure. They're revision directions." },
    { caption: 'LEVEL UP', speech: "Debrief it. Understand it. Retry it. Own it." },
    { caption: 'KEEP GOING', speech: "Tiny progress still counts. Stack enough of it and you win." },
    { caption: 'EXAM MODE', speech: "Less guessing. More understanding. More marks." },
    { caption: 'MONEY + STUDY', speech: "Revision and student life — all in one workspace." },
    { caption: 'YOU GOT THIS', speech: "You do not need perfect. You need progress." }
  ];

  // Preload pose images
  Object.values(assets).forEach(([src]) => {
    const img = new Image();
    img.src = src;
  });

  let selectedIndex = 0;
  let frame = 0;
  let bubbleIndex = 0;
  let bubbleTimer = null;
  let speaking = false;
  let utterance = null;

  const supportsSpeech =
    'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  if (!supportsSpeech && listen) {
    listen.disabled = true;
    listen.title = 'Voice narration is not available in this browser';
    if (listenLabel) listenLabel.textContent = 'TEXT ONLY';
    if (soundNote) {
      soundNote.textContent =
        'The mascot follows your scroll. Voice playback is not supported on this browser.';
    }
  }

  function stopSpeech() {
    if (supportsSpeech) window.speechSynthesis.cancel();
    speaking = false;
    utterance = null;
    if (listenLabel && supportsSpeech) listenLabel.textContent = 'HEAR THIS PART';
    if (listen) listen.setAttribute('aria-pressed', 'false');
  }

  function animateBubble(nextLine) {
    if (!bubble) return;

    if (!reduceMotion.matches) {
      bubble.classList.remove('bubble-changing');
      void bubble.offsetWidth;
      bubble.classList.add('bubble-changing');
    }

    caption.textContent = nextLine.caption;
    speech.textContent = nextLine.speech;
  }

  function startBubbleLoop() {
    clearInterval(bubbleTimer);
    bubbleIndex = 0;
    animateBubble(bubbleLines[bubbleIndex]);

    bubbleTimer = setInterval(() => {
      bubbleIndex = (bubbleIndex + 1) % bubbleLines.length;
      animateBubble(bubbleLines[bubbleIndex]);
    }, 2000);
  }

  function kickPoseAnimation() {
    if (reduceMotion.matches) return;

    pose.classList.remove('pose-changed');
    void pose.offsetWidth;
    pose.classList.add('pose-changed');

    if (board) {
      board.classList.remove('board-pop');
      void board.offsetWidth;
      board.classList.add('board-pop');
    }
  }

  function select(index) {
    const nextIndex = Math.min(chapters.length - 1, Math.max(0, index));
    selectedIndex = nextIndex;

    const current = chapters[selectedIndex];
    const data = assets[current.dataset.pose] || assets.idle;

    pose.src = data[0];
    pose.alt = data[1];
    kickPoseAnimation();

    if (counter) {
      counter.textContent =
        `${String(selectedIndex + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
    }

    if (progress) {
      progress.style.width = `${((selectedIndex + 1) / chapters.length) * 100}%`;
    }

    chapters.forEach((el, i) => {
      el.classList.toggle('is-current', i === selectedIndex);
    });
  }

  function updateActive() {
    frame = 0;
    const referenceY =
      window.innerWidth <= 950
        ? Math.min(window.innerHeight - 80, 390)
        : window.innerHeight * 0.5;

    let bestIndex = 0;
    let bestDistance = Infinity;

    chapters.forEach((chapter, i) => {
      const rect = chapter.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const distance = Math.abs(center - referenceY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });

    select(bestIndex);
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateActive);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pagehide', () => {
    stopSpeech();
    clearInterval(bubbleTimer);
  });

  listen?.addEventListener('click', () => {
    if (!supportsSpeech) return;

    if (speaking) {
      stopSpeech();
      return;
    }

    const msg = speech.textContent.trim();
    if (!msg) return;

    stopSpeech();

    utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = 'en-US';
    utterance.rate = 0.96;
    utterance.pitch = 1.08;

    utterance.onend = () => {
      speaking = false;
      if (listenLabel) listenLabel.textContent = 'HEAR THIS PART';
      listen?.setAttribute('aria-pressed', 'false');
    };

    utterance.onerror = () => {
      speaking = false;
      if (listenLabel) listenLabel.textContent = 'HEAR THIS PART';
      listen?.setAttribute('aria-pressed', 'false');
    };

    speaking = true;
    if (listenLabel) listenLabel.textContent = 'STOP VOICE';
    listen?.setAttribute('aria-pressed', 'true');
    window.speechSynthesis.speak(utterance);
  });

  select(0);
  startBubbleLoop();
  requestAnimationFrame(updateActive);
})();
