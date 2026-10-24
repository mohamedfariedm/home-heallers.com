/**
 * A short two-tone chime, loud enough to cut through a quiet office.
 * Browsers block audio until the page has been clicked, so a chime that
 * arrives first is held briefly and played on the next interaction.
 */

const MAX_BURST = 3;
const HOLD_MS = 20_000;

let audioCtx: AudioContext | null = null;
let unlocked = false;
let pending = 0;
let pendingUntil = 0;
let installed = false;
let nextStart = 0;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function canPlay() {
  return unlocked && audioCtx?.state === 'running';
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  peak: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function playChime(times: number) {
  const ctx = context();
  if (!ctx) return;
  const count = Math.min(MAX_BURST, Math.max(1, times));
  let cursor = Math.max(ctx.currentTime + 0.02, nextStart);
  for (let i = 0; i < count; i += 1) {
    const start = cursor;
    tone(ctx, 784, start, 0.16, 'triangle', 0.38);
    tone(ctx, 784, start, 0.1, 'square', 0.05);
    tone(ctx, 1174, start + 0.14, 0.28, 'triangle', 0.42);
    tone(ctx, 1568, start + 0.32, 0.2, 'sine', 0.18);
    cursor += 0.72;
  }
  nextStart = cursor;
}

export function playSupportAlert(times = 1) {
  const count = Math.min(MAX_BURST, Math.max(1, times));
  if (canPlay()) {
    playChime(count);
    return;
  }
  const ctx = context();
  if (ctx?.state === 'suspended') void ctx.resume().catch(() => undefined);
  pending = Math.min(MAX_BURST, pending + count);
  pendingUntil = Date.now() + HOLD_MS;
}

export function unlockSupportAlertSound() {
  const ctx = context();
  if (!ctx) return;
  unlocked = true;
  if (ctx.state === 'suspended') {
    void ctx.resume().then(flushPending).catch(() => undefined);
    return;
  }
  flushPending();
}

function flushPending() {
  if (!pending || Date.now() > pendingUntil || !canPlay()) {
    pending = 0;
    return;
  }
  const count = pending;
  pending = 0;
  playChime(count);
}

export function installSupportAlertUnlock() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const unlock = () => unlockSupportAlertSound();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });
}
