// Web Audio API ambient BGM engine — all synthesized, no external files

let ctx: AudioContext | null = null;
let currentNodes: AudioNode[] = [];
let currentBgm: string | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function getMaster(): GainNode {
  if (!masterGain || !ctx) {
    const c = getCtx();
    masterGain = c.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(c.destination);
  }
  return masterGain;
}

function stopAll() {
  currentNodes.forEach(n => {
    try {
      if (n instanceof OscillatorNode) n.stop();
      else if (n instanceof AudioBufferSourceNode) n.stop();
      n.disconnect();
    } catch {}
  });
  currentNodes = [];
  currentBgm = null;
}

function createDrone(freq: number, type: OscillatorType, vol: number): OscillatorNode {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start();
  currentNodes.push(osc);
  return osc;
}

function createLFO(target: AudioParam, rate: number, depth: number) {
  const c = getCtx();
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = rate;
  lfoGain.gain.value = depth;
  lfo.connect(lfoGain);
  lfoGain.connect(target);
  lfo.start();
  currentNodes.push(lfo);
}

function createFilteredNoise(freq: number, q: number, vol: number) {
  const c = getCtx();
  const bufferSize = c.sampleRate * 2;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.value = vol;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMaster());
  source.start();
  currentNodes.push(source);
}

// === HOME: Mystical fortune-telling ambience ===
function playHomeBgm() {
  // Deep foundation drone
  createDrone(65, 'sine', 0.3);       // low C
  createDrone(98, 'sine', 0.15);      // low G (fifth)

  // Ethereal shimmer pad
  const shimmer = createDrone(523, 'sine', 0.06);  // C5
  createLFO(shimmer.frequency, 0.08, 8);  // slow wobble

  const shimmer2 = createDrone(659, 'sine', 0.04); // E5
  createLFO(shimmer2.frequency, 0.06, 6);

  // Mystic whisper texture
  createFilteredNoise(2000, 5, 0.015);
  createFilteredNoise(400, 2, 0.01);

  // Subtle pulsing
  const pulse = createDrone(131, 'triangle', 0.08); // C3
  createLFO(pulse.frequency, 0.03, 4); // very slow drift
}

// === TAROT: Mysterious, mystical ===
function playTarotBgm() {
  // Dark minor drone
  createDrone(55, 'sine', 0.3);        // low A
  createDrone(82, 'sine', 0.15);       // low E (fifth)

  // Eerie high tones
  const eerie1 = createDrone(440, 'sine', 0.05);  // A4
  createLFO(eerie1.frequency, 0.1, 12);  // unsettling wobble

  const eerie2 = createDrone(523, 'sine', 0.04);  // C5 (minor third)
  createLFO(eerie2.frequency, 0.07, 10);

  // Dark texture
  createFilteredNoise(300, 3, 0.02);
  createFilteredNoise(1500, 8, 0.008);

  // Deep pulse
  const deep = createDrone(110, 'triangle', 0.1);
  createLFO(deep.frequency, 0.05, 3);

  // Mystery overtone
  const mystery = createDrone(660, 'sine', 0.03);
  createLFO(mystery.frequency, 0.15, 20);  // wider vibrato
}

// === HOROSCOPE: Calm, celestial, serene ===
function playHoroscopeBgm() {
  // Gentle foundation
  createDrone(73, 'sine', 0.25);       // low D
  createDrone(110, 'sine', 0.12);      // A (fifth)

  // Celestial pads - major/suspended feel
  const pad1 = createDrone(294, 'sine', 0.06); // D4
  createLFO(pad1.frequency, 0.04, 3);

  const pad2 = createDrone(440, 'sine', 0.05); // A4
  createLFO(pad2.frequency, 0.03, 2);

  const pad3 = createDrone(370, 'sine', 0.04); // F#4
  createLFO(pad3.frequency, 0.05, 4);

  // Starlight shimmer
  createFilteredNoise(4000, 10, 0.006);
  createFilteredNoise(6000, 12, 0.004);

  // Gentle breath
  const breath = createDrone(147, 'sine', 0.05); // D3
  createLFO(breath.frequency, 0.02, 2);
}

// === SAJU: Eastern, calm, healing — pentatonic ===
function playSajuBgm() {
  // Warm low drone
  createDrone(65, 'sine', 0.25);        // low C
  createDrone(87, 'sine', 0.12);        // low F (fourth - eastern interval)

  // Pentatonic pads: C - D - E - G - A
  const p1 = createDrone(262, 'triangle', 0.06); // C4
  createLFO(p1.frequency, 0.03, 2);

  const p2 = createDrone(330, 'triangle', 0.04); // E4
  createLFO(p2.frequency, 0.04, 3);

  const p3 = createDrone(392, 'sine', 0.03);     // G4
  createLFO(p3.frequency, 0.05, 4);

  // Warm wood texture
  createFilteredNoise(800, 4, 0.01);

  // Healing low pulse
  const heal = createDrone(131, 'sine', 0.08); // C3
  createLFO(heal.frequency, 0.015, 1.5); // very slow
}

// === OMIKUJI: Japanese shrine, mystical ===
function playOmikujiBgm() {
  // Shrine bell fundamental
  createDrone(87, 'sine', 0.2);         // low F
  createDrone(131, 'sine', 0.1);        // C (fifth)

  // Koto-like tones (Japanese scale: F - G - Bb - C - Db)
  const koto1 = createDrone(349, 'triangle', 0.05); // F4
  createLFO(koto1.frequency, 0.06, 5);

  const koto2 = createDrone(466, 'triangle', 0.04); // Bb4
  createLFO(koto2.frequency, 0.04, 3);

  const koto3 = createDrone(523, 'sine', 0.03);     // C5
  createLFO(koto3.frequency, 0.08, 6);

  // Wind through shrine
  createFilteredNoise(1200, 6, 0.012);
  createFilteredNoise(3000, 8, 0.006);

  // Deep bell resonance
  const bell = createDrone(175, 'sine', 0.07); // F3
  createLFO(bell.frequency, 0.02, 2);
}

// === PUBLIC API ===

export type BgmType = 'home' | 'tarot' | 'horoscope' | 'saju' | 'omikuji';

export function playBgm(type: BgmType) {
  if (currentBgm === type) return; // already playing
  stopAll();
  currentBgm = type;

  try {
    switch (type) {
      case 'home': playHomeBgm(); break;
      case 'tarot': playTarotBgm(); break;
      case 'horoscope': playHoroscopeBgm(); break;
      case 'saju': playSajuBgm(); break;
      case 'omikuji': playOmikujiBgm(); break;
    }
  } catch {
    // Audio API not available
  }
}

export function stopBgm() {
  stopAll();
}

export function isBgmPlaying(): boolean {
  return currentBgm !== null;
}

// Pause/resume AudioContext on app lifecycle (prevents background audio)
function initLifecycle() {
  // Browser visibility change (works for both web and Capacitor)
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) {
      ctx.suspend().catch(() => {});
    } else if (currentBgm) {
      ctx.resume().catch(() => {});
    }
  });

  // Capacitor native app state (more reliable on Android)
  import('@capacitor/app').then(({ App }) => {
    const handle = App.addListener('appStateChange', ({ isActive }) => {
      if (!ctx) return;
      if (!isActive) {
        ctx.suspend().catch(() => {});
      } else if (currentBgm) {
        ctx.resume().catch(() => {});
      }
    });
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      handle.then(h => h.remove()).catch(() => {});
    }, { once: true });
  }).catch(() => {});
}

initLifecycle();
