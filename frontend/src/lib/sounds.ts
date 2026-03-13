let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playJoinSound() {
  playTone(660, 0.15, "sine", 0.1);
  setTimeout(() => playTone(880, 0.15, "sine", 0.1), 100);
}

export function playStartSound() {
  playTone(523, 0.12, "sine", 0.12);
  setTimeout(() => playTone(659, 0.12, "sine", 0.12), 100);
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 200);
}

export function playTurnSound() {
  playTone(784, 0.12, "triangle", 0.12);
  setTimeout(() => playTone(988, 0.18, "triangle", 0.12), 120);
}

export function playCorrectSound() {
  playTone(523, 0.15, "sine", 0.12);
  setTimeout(() => playTone(659, 0.15, "sine", 0.12), 120);
  setTimeout(() => playTone(784, 0.15, "sine", 0.12), 240);
  setTimeout(() => playTone(1047, 0.3, "sine", 0.12), 360);
}

export function playWrongSound() {
  playTone(330, 0.2, "square", 0.08);
  setTimeout(() => playTone(277, 0.3, "square", 0.08), 200);
}

export function playNotificationSound() {
  playTone(880, 0.1, "sine", 0.08);
}
