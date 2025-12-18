let audioCtx: AudioContext | null = null;
let musicInterval: any = null;
let isMusicPlaying = false;

const initAudio = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Simple click sound
export const playClick = () => {
  const ctx = initAudio();
  if (!ctx) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

// Ticking sound for wheel
export const playTick = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

// Victory fanfare
export const playWin = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  playNote(523.25, now, 0.2);       // C5
  playNote(659.25, now + 0.1, 0.2); // E5
  playNote(783.99, now + 0.2, 0.2); // G5
  playNote(1046.50, now + 0.3, 0.6); // C6
  
  const bufferSize = ctx.sampleRate * 1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
};

// --- Background Music (Synthesized Festive Melody) ---

const NOTES = {
  'E4': 329.63, 'G4': 392.00, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
};

const MELODY = [
  'E5', 'E5', 'E5', 'E5', 'E5', 'E5', 'E5', 'G5', 'C5', 'D5', 'E5',
  'F5', 'F5', 'F5', 'F5', 'F5', 'E5', 'E5', 'E5', 'E5', 'D5', 'D5', 'E5', 'D5', 'G5'
];

const playMelodyNote = (ctx: AudioContext, freq: number, time: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine'; // Soft bell-like sound
  osc.frequency.setValueAtTime(freq, time);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.05, time + 0.05); // Subtle volume
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.8);
};

export const startBackgroundMusic = () => {
  const ctx = initAudio();
  if (!ctx || isMusicPlaying) return;
  isMusicPlaying = true;

  let noteIndex = 0;
  const tempo = 0.3; // Seconds per note

  musicInterval = setInterval(() => {
    if (ctx.state === 'suspended') ctx.resume();
    
    const note = MELODY[noteIndex];
    const freq = NOTES[note as keyof typeof NOTES];
    if (freq) {
      playMelodyNote(ctx, freq, ctx.currentTime);
    }
    
    noteIndex = (noteIndex + 1) % MELODY.length;
  }, tempo * 1000);
};

export const stopBackgroundMusic = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  isMusicPlaying = false;
};