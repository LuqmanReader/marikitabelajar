/* LedgerPeer homepage-only magnetic pixel field.
   Original implementation inspired by cursor-reactive event-site canvases.
   No dependencies, no authentication changes, and no interception of controls. */
(() => {
  'use strict';

  const stage = document.querySelector('[data-lp-playground]');
  const canvas = stage?.querySelector('canvas');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!stage || !canvas || !context) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const pointerFine = window.matchMedia?.('(pointer: fine)').matches ?? true;
  let width = 1;
  let height = 1;
  let dots = [];
  let animationFrame = 0;
  let inViewport = true;
  let previousFrame = 0;
  const cursor = { x: -1000, y: -1000, sx: -1000, sy: -1000, active: false };
  const waves = [];
  const palette = ['#7ae8ce', '#ffd562', '#b99cff', '#71b4ff', '#ff8f86'];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const hash = (a, b) => {
    const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const step = width < 600 ? 30 : 27;
    dots = [];
    const rows = Math.ceil(height / step);
    const cols = Math.ceil(width / step);
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const seed = hash(col, row);
        dots.push({
          x: col * step + step * .43,
          y: row * step + step * .5,
          seed,
          phase: seed * Math.PI * 2,
          star: seed > .967
        });
      }
    }
    if (reducedMotion) draw(0);
  }

  function localCoordinates(event) {
    const bounds = stage.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function move(event) {
    if (reducedMotion) return;
    const position = localCoordinates(event);
    cursor.x = position.x;
    cursor.y = position.y;
    if (!cursor.active) {
      cursor.sx = position.x;
      cursor.sy = position.y;
    }
    cursor.active = true;
    start();
  }

  function ripple(event) {
    if (reducedMotion) return;
    const p = localCoordinates(event);
    waves.push({ x: p.x, y: p.y, created: performance.now() });
    if (waves.length > 5) waves.shift();
    cursor.x = cursor.sx = p.x;
    cursor.y = cursor.sy = p.y;
    cursor.active = true;
    start();
  }

  function draw(now) {
    const ctx = context;
    ctx.clearRect(0, 0, width, height);

    // The field has a genuine quiet state; movement reveals the brighter lattice.
    if (cursor.active) {
      const easing = pointerFine ? .16 : .11;
      cursor.sx += (cursor.x - cursor.sx) * easing;
      cursor.sy += (cursor.y - cursor.sy) * easing;
      const halo = ctx.createRadialGradient(cursor.sx, cursor.sy, 3, cursor.sx, cursor.sy, 180);
      halo.addColorStop(0, 'rgba(115,236,202,.15)');
      halo.addColorStop(.45, 'rgba(121,138,255,.09)');
      halo.addColorStop(1, 'rgba(121,138,255,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(cursor.sx - 180, cursor.sy - 180, 360, 360);
    }

    const seconds = now / 1000;
    for (const dot of dots) {
      let x = dot.x;
      let y = dot.y;
      let influence = 0;
      let waveStrength = 0;

      const dx = x - cursor.sx;
      const dy = y - cursor.sy;
      const distance = Math.hypot(dx, dy);
      if (cursor.active && distance < 165) {
        influence = Math.pow(1 - distance / 165, 2);
        const repel = influence * 30;
        x += (dx / Math.max(1, distance)) * repel;
        y += (dy / Math.max(1, distance)) * repel;
      }

      for (const wave of waves) {
        const elapsed = (now - wave.created) / 1000;
        const radius = elapsed * 315;
        const waveDistance = Math.hypot(x - wave.x, y - wave.y);
        const ring = Math.exp(-Math.pow((waveDistance - radius) / 23, 2)) * (1 - elapsed / 1.55);
        if (ring > 0) {
          const direction = 9 * ring;
          x += (x - wave.x) / Math.max(waveDistance, 1) * direction;
          y += (y - wave.y) / Math.max(waveDistance, 1) * direction;
          waveStrength += ring;
        }
      }

      const ambient = reducedMotion ? 0 : Math.sin(seconds * 1.25 + dot.phase) * .7;
      y += ambient;
      const active = clamp(influence * 2.3 + waveStrength * 1.9, 0, 1);
      const opacity = .21 + dot.seed * .16 + active * .67;
      const size = (dot.star ? 2.5 : 1.55) + active * 2.8;
      const color = active > .25
        ? palette[Math.min(4, Math.floor(dot.seed * 5))]
        : '#8ba8bb';

      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      if (dot.star || active > .8) {
        ctx.fillRect(x - size * .28, y - size * 1.6, size * .56, size * 3.2);
        ctx.fillRect(x - size * 1.6, y - size * .28, size * 3.2, size * .56);
      } else {
        ctx.fillRect(x - size * .5, y - size * .5, size, size);
      }
    }
    ctx.globalAlpha = 1;

    // Waves travel through the lattice rather than covering the full panel.
    for (let i = waves.length - 1; i >= 0; i--) {
      const wave = waves[i];
      const age = (now - wave.created) / 1000;
      if (age >= 1.55) {
        waves.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, age * 315, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120,236,209,' + ((1 - age / 1.55) * .43).toFixed(3) + ')';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    if (cursor.active && pointerFine) {
      const x = cursor.sx, y = cursor.sy;
      ctx.strokeStyle = 'rgba(255,210,98,.72)';
      ctx.lineWidth = 1.2;
      const r = 17;
      ctx.beginPath();
      ctx.moveTo(x - r, y); ctx.lineTo(x - 7, y);
      ctx.moveTo(x + 7, y); ctx.lineTo(x + r, y);
      ctx.moveTo(x, y - r); ctx.lineTo(x, y - 7);
      ctx.moveTo(x, y + 7); ctx.lineTo(x, y + r);
      ctx.stroke();
    }
  }

  function animate(now) {
    animationFrame = 0;
    if (!inViewport || document.hidden) return;
    // Cap the idle frame rate to keep this purely decorative effect economical.
    if (now - previousFrame >= 33) {
      previousFrame = now;
      draw(now);
    }
    animationFrame = requestAnimationFrame(animate);
  }

  function start() {
    if (reducedMotion || !inViewport || document.hidden || animationFrame) return;
    animationFrame = requestAnimationFrame(animate);
  }

  function stop() {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  resize();

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  if (!reducedMotion) {
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerdown', ripple, { passive: true });
    stage.addEventListener('pointerleave', () => { cursor.active = false; }, { passive: true });
    stage.addEventListener('pointercancel', () => { cursor.active = false; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inViewport = !!entries[0]?.isIntersecting;
        if (inViewport) start();
        else stop();
      }, { threshold: .01 }).observe(stage);
    }
    start();
  }
})();
