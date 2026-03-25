// Web Audio API synthesized sound effects — no external files needed

let ctx: AudioContext | null = null;
const pendingTimers: Set<ReturnType<typeof setTimeout>> = new Set();

function sfxTimeout(fn: () => void, ms: number) {
  const id = setTimeout(() => {
    pendingTimers.delete(id);
    fn();
  }, ms);
  pendingTimers.add(id);
}

export function cancelAllSfxTimers() {
  for (const id of pendingTimers) clearTimeout(id);
  pendingTimers.clear();
}

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  // Only resume if app is in foreground
  if (ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(() => {});
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, fadeOut = true) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function playNoise(duration: number, volume = 0.05) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  gain.gain.value = volume;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start();
}

// === COMMON ===

export function sfxButtonClick() {
  // Dreamy water ripple — like disturbing calm water
  playTone(400, 0.4, 'sine', 0.06);
  sfxTimeout(() => playTone(600, 0.3, 'sine', 0.04), 60);
  sfxTimeout(() => playTone(800, 0.2, 'sine', 0.03), 120);
  sfxTimeout(() => playTone(500, 0.5, 'sine', 0.02), 180);
}

export function sfxTextInput() {
  // Writing / quill scratching feel
  playNoise(0.04, 0.06);
  playTone(1200 + Math.random() * 400, 0.06, 'triangle', 0.03);
}

export function sfxHover() {
  playTone(600, 0.1, 'sine', 0.04);
}

export function sfxPopupOpen() {
  playTone(300, 0.3, 'sine', 0.06);
  sfxTimeout(() => playTone(500, 0.25, 'sine', 0.04), 80);
  sfxTimeout(() => playTone(400, 0.3, 'sine', 0.03), 160);
}

export function sfxPopupClose() {
  playTone(500, 0.2, 'sine', 0.05);
  sfxTimeout(() => playTone(300, 0.3, 'sine', 0.03), 60);
}

export function sfxPageTransition() {
  playTone(300, 0.3, 'sine', 0.06);
  sfxTimeout(() => playTone(450, 0.3, 'sine', 0.05), 100);
}

export function sfxLanguageSwitch() {
  playTone(1200, 0.15, 'sine', 0.08);
  sfxTimeout(() => playTone(1500, 0.12, 'sine', 0.06), 80);
  sfxTimeout(() => playTone(1800, 0.1, 'sine', 0.04), 160);
}

// === TAROT ===

export function sfxBreath(phase: 'in' | 'hold' | 'out') {
  if (phase === 'in') {
    playNoise(2, 0.03);
    playTone(200, 2, 'sine', 0.04);
  } else if (phase === 'out') {
    playNoise(2.5, 0.02);
    playTone(150, 2.5, 'sine', 0.03);
  }
}

export function sfxShuffle() {
  for (let i = 0; i < 8; i++) {
    sfxTimeout(() => playNoise(0.04, 0.12), i * 30);
  }
}

export function sfxCut() {
  playNoise(0.1, 0.1);
  sfxTimeout(() => playTone(400, 0.15, 'triangle', 0.08), 50);
}

export function sfxCardFlip() {
  playNoise(0.06, 0.08);
  sfxTimeout(() => playTone(800, 0.2, 'sine', 0.1), 40);
  sfxTimeout(() => playTone(1200, 0.15, 'sine', 0.06), 100);
}

export function sfxReadingReveal() {
  playTone(400, 0.8, 'sine', 0.08);
  sfxTimeout(() => playTone(600, 0.6, 'sine', 0.06), 200);
  sfxTimeout(() => playTone(800, 0.5, 'sine', 0.05), 400);
}

export function sfxAdviceCard() {
  playTone(523, 0.4, 'sine', 0.1); // C5
  sfxTimeout(() => playTone(659, 0.4, 'sine', 0.08), 150); // E5
  sfxTimeout(() => playTone(784, 0.6, 'sine', 0.1), 300); // G5
}

// === HOROSCOPE ===

export function sfxSync() {
  getCtx();
  for (let i = 0; i < 5; i++) {
    sfxTimeout(() => playTone(300 + i * 200, 0.1, 'square', 0.04), i * 60);
  }
  sfxTimeout(() => playTone(1500, 0.5, 'sine', 0.08), 350);
}

export function sfxConstellationAppear() {
  playTone(250, 1.2, 'sine', 0.06);
  sfxTimeout(() => playTone(375, 1, 'sine', 0.05), 200);
  sfxTimeout(() => playTone(500, 0.8, 'sine', 0.04), 400);
}

export function sfxMoonOrbit() {
  playTone(120, 2, 'sine', 0.04);
}

export function sfxResonance(type: 'aligned' | 'approaching' | 'neutral' | 'distant') {
  if (type === 'aligned') {
    playTone(400, 0.6, 'sine', 0.1);
    playTone(500, 0.6, 'sine', 0.08);
    playTone(600, 0.6, 'sine', 0.06);
    sfxTimeout(() => { playTone(800, 0.8, 'sine', 0.1); playTone(1000, 0.8, 'sine', 0.06); }, 300);
  } else if (type === 'approaching') {
    playTone(300, 0.5, 'sine', 0.06);
    sfxTimeout(() => playTone(450, 0.5, 'sine', 0.06), 200);
  } else if (type === 'distant') {
    playTone(150, 1.5, 'sine', 0.04);
  }
}

export function sfxOracleKeyword() {
  playTone(600 + Math.random() * 400, 0.12, 'square', 0.04);
  playNoise(0.03, 0.06);
}

export function sfxOracleComplete() {
  playTone(200, 1.5, 'sine', 0.08);
  sfxTimeout(() => playTone(300, 1.2, 'sine', 0.06), 300);
  sfxTimeout(() => playTone(400, 1, 'sine', 0.05), 600);
  sfxTimeout(() => playTone(200, 2, 'sine', 0.04), 900);
}

// === SAJU ===

export function sfxPillarDrop(index: number) {
  const freq = 150 + index * 30;
  playTone(freq, 0.3, 'triangle', 0.12);
  sfxTimeout(() => playNoise(0.08, 0.1), 50);
}

export function sfxElementReveal(element: string) {
  const freqs: Record<string, number> = { '木': 350, '火': 500, '土': 250, '金': 700, '水': 200 };
  const types: Record<string, OscillatorType> = { '木': 'triangle', '火': 'sawtooth', '土': 'sine', '金': 'square', '水': 'sine' };
  const freq = freqs[element] || 400;
  const type = types[element] || 'sine';
  playTone(freq, 0.5, type, 0.08);
  sfxTimeout(() => playTone(freq * 1.5, 0.4, 'sine', 0.05), 150);
}

export function sfxBarRise() {
  for (let i = 0; i < 5; i++) {
    sfxTimeout(() => playTone(200 + i * 80, 0.15, 'sine', 0.04), i * 100);
  }
}

export function sfxDaeunTimeline() {
  playTone(180, 0.3, 'sine', 0.05);
  playNoise(0.15, 0.03);
  sfxTimeout(() => playTone(220, 0.3, 'sine', 0.04), 200);
}

export function sfxDaeunInteraction(type: 'harmony' | 'clash' | 'neutral') {
  if (type === 'harmony') {
    playTone(400, 0.3, 'sine', 0.08);
    playTone(500, 0.3, 'sine', 0.06);
    playTone(600, 0.3, 'sine', 0.05);
  } else if (type === 'clash') {
    playTone(200, 0.2, 'sawtooth', 0.06);
    playTone(213, 0.2, 'sawtooth', 0.06);
    sfxTimeout(() => playNoise(0.1, 0.08), 100);
  } else {
    playTone(300, 0.5, 'sine', 0.04);
  }
}

// === OMIKUJI ===

export function sfxWaterPour() {
  getCtx();
  for (let i = 0; i < 10; i++) {
    sfxTimeout(() => playTone(800 + Math.random() * 600, 0.08, 'sine', 0.03), i * 40);
  }
  playNoise(0.5, 0.04);
}

export function sfxBow() {
  playNoise(0.3, 0.02);
  playTone(150, 0.5, 'sine', 0.03);
}

export function sfxClap() {
  playNoise(0.08, 0.2);
  sfxTimeout(() => playNoise(0.04, 0.08), 30);
}

export function sfxBell() {
  playTone(800, 1.2, 'sine', 0.12);
  playTone(1200, 0.8, 'sine', 0.06);
  sfxTimeout(() => playTone(600, 1.5, 'sine', 0.04), 200);
}

export function sfxShakeSticks() {
  for (let i = 0; i < 15; i++) {
    sfxTimeout(() => {
      playTone(2000 + Math.random() * 2000, 0.03, 'triangle', 0.06);
      playNoise(0.02, 0.04);
    }, i * 50 + Math.random() * 30);
  }
}

export function sfxStickDrop() {
  playTone(1500, 0.1, 'triangle', 0.1);
  sfxTimeout(() => playTone(800, 0.15, 'triangle', 0.08), 80);
  sfxTimeout(() => playNoise(0.05, 0.06), 120);
}

export function sfxPaperUnfold() {
  for (let i = 0; i < 6; i++) {
    sfxTimeout(() => playNoise(0.04, 0.05), i * 60);
  }
}

export function sfxKoto() {
  playTone(440, 0.8, 'triangle', 0.1);
  sfxTimeout(() => playTone(523, 0.6, 'triangle', 0.06), 100);
  sfxTimeout(() => playTone(330, 1, 'triangle', 0.04), 300);
}

export function sfxRankReveal(isGood: boolean) {
  if (isGood) {
    playTone(523, 0.3, 'sine', 0.1);
    sfxTimeout(() => playTone(659, 0.3, 'sine', 0.08), 100);
    sfxTimeout(() => playTone(784, 0.5, 'sine', 0.1), 200);
  } else {
    playTone(200, 0.8, 'sine', 0.08);
    sfxTimeout(() => playTone(150, 1, 'sine', 0.06), 200);
  }
}

export function sfxKeep() {
  playNoise(0.1, 0.04); // paper fold
  sfxTimeout(() => playTone(500, 0.2, 'sine', 0.06), 150);
  sfxTimeout(() => playTone(600, 0.15, 'sine', 0.04), 250);
}

export function sfxTie() {
  playNoise(0.15, 0.04); // rope
  sfxTimeout(() => {
    playTone(250, 1, 'sine', 0.05);
    playNoise(0.5, 0.02); // wind
  }, 200);
}
