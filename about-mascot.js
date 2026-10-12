/* LedgerPeer: original PNG mascot, automatic floating and smooth transitions.
   Public intro collapses via CSS as soon as a signed-in #hubView appears. */
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
  const assets = {
    wave: ['ledgerpeer-wave.png', 'LedgerPeer mascot waving'],
    explain: ['ledgerpeer-explain.png', 'LedgerPeer mascot explaining a lesson'],
    study: ['ledgerpeer-study.png', 'LedgerPeer mascot studying'],
    idle: ['ledgerpeer-idle.png', 'LedgerPeer mascot standing cheerfully'],
    celebrate: ['ledgerpeer-celebrate.png', 'LedgerPeer mascot celebrating']
  };
  // Short, playful messages distinct from the chapter narration.
  const cheers = [
    ['READY, SET, GROW!', 'Small steps. BIG wins! ✨'],
    ['LET’S GO!', 'Your next breakthrough is loading! 🚀'],
    ['STUDY BUDDY!', 'Brains on. Worries off! ⚡'],
    ['YOU GOT THIS!', 'One more question? Easy! 🌟'],
    ['KEEP SHINING!', 'Make mistakes. Make progress! 🎉'],
    ['LEVEL UP!', 'Today’s effort = tomorrow’s confidence! 💥'],
    ['HIGH FIVE!', 'Your future self says THANK YOU! 🙌'],
    ['ON A ROLL!', 'Look at you, building momentum! 🥳']
  ];
  const poseKeys = ['wave', 'celebrate', 'explain', 'wave', 'study', 'celebrate', 'idle'];
  let cheerIndex = 0;
  let cheerTimer = null;
  let fadeTimer = null;
  const MESSAGE_INTERVAL_MS = 6000; // Change to 7000 or 8000 for even slower chat.
  const FADE_OUT_MS = 650;         // Match the 650ms CSS transition.
  const bubble = speech?.closest('.speech-bubble');
  let selectedIndex = 0;
  let speaking = false;
  let utterance = null;
  if (!chapters.length || !pose) return;

  // Preload only pose images; no third-party assets or remote calls.
  Object.values(assets).forEach(([src]) => { const i = new Image(); i.src = src; });

  const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  if (!supportsSpeech && listen) {
    listen.disabled = true;
    listen.title = 'Voice narration is not available in this browser';
    listenLabel.textContent = 'TEXT NARRATION ONLY';
    if (soundNote) soundNote.textContent = 'The mascot moves automatically. Voice playback is not supported on this browser.';
  }
  function stopSpeech() {
    if (supportsSpeech) window.speechSynthesis.cancel();
    speaking = false;
    utterance = null;
    if (listenLabel && supportsSpeech) listenLabel.textContent = 'HEAR THIS PART';
    if (listen) listen.setAttribute('aria-pressed', 'false');
  }
  function select(index) {
    const nextIndex = Math.min(chapters.length - 1, Math.max(0, index));
    if (nextIndex === selectedIndex && counter.textContent) return;
    selectedIndex = nextIndex;
    // Update the right-hand chapter marker only. Scrolling does not touch
    // the mascot pose, its flight, or the speech bubble.
    stopSpeech();
    counter.textContent = `${String(selectedIndex + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
    progress.style.width = `${((selectedIndex + 1) / chapters.length) * 100}%`;
    chapters.forEach((el, i) => el.classList.toggle('is-current', i === selectedIndex));
  }
  let frame = 0;
  function updateActive() {
    frame = 0;
    // At narrow widths, the sticky mascot occupies the first third of the screen.
    const referenceY = window.innerWidth <= 950 ? Math.min(window.innerHeight - 80, 390) : window.innerHeight * 0.50;
    let bestIndex = 0, bestDistance = Infinity;
    chapters.forEach((chapter, i) => {
      const rect = chapter.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const distance = Math.abs(center - referenceY);
      if (distance < bestDistance) { bestDistance = distance; bestIndex = i; }
    });
    select(bestIndex);
  }
  function scheduleUpdate() { if (!frame) frame = requestAnimationFrame(updateActive); }
  window.addEventListener('scroll', scheduleUpdate, {passive:true});
  window.addEventListener('resize', scheduleUpdate, {passive:true});
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pagehide', () => {
    stopSpeech();
    if (cheerTimer) clearInterval(cheerTimer);
    if (fadeTimer) clearTimeout(fadeTimer);
  });
  listen?.addEventListener('click', () => {
    if (!supportsSpeech) return;
    if (speaking) { stopSpeech(); return; }
    stopSpeech();
    const msg = speech.textContent || '';
    if (!msg) return;
    utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onend = () => { speaking = false; listenLabel.textContent = 'HEAR THIS PART'; listen.setAttribute('aria-pressed', 'false'); };
    utterance.onerror = () => { speaking = false; listenLabel.textContent = 'HEAR THIS PART'; listen.setAttribute('aria-pressed', 'false'); };
    speaking = true;
    listenLabel.textContent = 'STOP VOICE';
    listen.setAttribute('aria-pressed', 'true');
    window.speechSynthesis.speak(utterance);
  });
  // This loop operates on time alone, not on scroll position.
  function showCheer(animated = true) {
    const [label, message] = cheers[cheerIndex % cheers.length];
    const key = poseKeys[cheerIndex % poseKeys.length];
    const data = assets[key];
    cheerIndex++;

    function swapContent() {
      caption.textContent = label;
      speech.textContent = message;
      pose.src = data[0];
      pose.alt = data[1];
    }

    if (fadeTimer) clearTimeout(fadeTimer);
    if (!animated || reduceMotion.matches || !bubble) {
      swapContent();
      bubble?.classList.remove('lp-cheer-switching');
      pose.classList.remove('lp-pose-switching');
      return;
    }

    // Fade text and pose out, swap when transparent, and fade back in.
    // The bubble frame stays visible and the flight animation keeps running.
    bubble.classList.add('lp-cheer-switching');
    pose.classList.add('lp-pose-switching');
    fadeTimer = window.setTimeout(() => {
      swapContent();
      bubble.classList.remove('lp-cheer-switching');
      pose.classList.remove('lp-pose-switching');
      fadeTimer = null;
    }, FADE_OUT_MS);
  }

  select(0);
  showCheer(false); // Show the first message immediately on page load.
  cheerTimer = window.setInterval(() => {
    if (!document.hidden) showCheer(true);
  }, MESSAGE_INTERVAL_MS);
  requestAnimationFrame(updateActive);
})();
