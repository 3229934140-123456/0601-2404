type SoundType = 'jump' | 'collect' | 'hit' | 'gameover' | 'click' | 'achievement' | 'powerup';

interface AudioState {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  musicGain: GainNode | null;
  soundGain: GainNode | null;
  musicOscillator: OscillatorNode | null;
  isInitialized: boolean;
}

const state: AudioState = {
  audioContext: null,
  masterGain: null,
  musicGain: null,
  soundGain: null,
  musicOscillator: null,
  isInitialized: false,
};

const initAudio = (): void => {
  if (state.isInitialized || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    state.audioContext = new AudioContextClass();
    
    state.masterGain = state.audioContext.createGain();
    state.masterGain.connect(state.audioContext.destination);
    state.masterGain.gain.value = 0.5;
    
    state.musicGain = state.audioContext.createGain();
    state.musicGain.connect(state.masterGain);
    state.musicGain.gain.value = 0.3;
    
    state.soundGain = state.audioContext.createGain();
    state.soundGain.connect(state.masterGain);
    state.soundGain.gain.value = 0.5;
    
    state.isInitialized = true;
  } catch {
    console.warn('Web Audio API not supported');
  }
};

const resumeAudio = (): void => {
  if (state.audioContext?.state === 'suspended') {
    state.audioContext.resume();
  }
};

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume: number = 0.3
): void => {
  if (!state.isInitialized || !state.audioContext || !state.soundGain) return;
  
  resumeAudio();
  
  const oscillator = state.audioContext.createOscillator();
  const gainNode = state.audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(volume, state.audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, state.audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(state.soundGain);
  
  oscillator.start();
  oscillator.stop(state.audioContext.currentTime + duration);
};

const play8BitSound = (frequencies: number[], duration: number, type: OscillatorType = 'square'): void => {
  const noteDuration = duration / frequencies.length;
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      playTone(freq, noteDuration * 0.8, type, 0.2);
    }, index * noteDuration * 1000);
  });
};

export const playSound = (type: SoundType): void => {
  if (!state.isInitialized) initAudio();
  
  switch (type) {
    case 'jump':
      play8BitSound([440, 660, 880], 0.15);
      break;
    case 'collect':
      play8BitSound([523, 659, 784, 1047], 0.2);
      break;
    case 'hit':
      play8BitSound([200, 150, 100], 0.3, 'sawtooth');
      break;
    case 'gameover':
      play8BitSound([400, 350, 300, 250, 200], 0.8, 'triangle');
      break;
    case 'click':
      playTone(800, 0.05, 'square', 0.15);
      break;
    case 'achievement':
      play8BitSound([523, 659, 784, 1047, 1319], 0.5);
      break;
    case 'powerup':
      play8BitSound([392, 523, 659, 784], 0.3, 'triangle');
      break;
  }
};

export const playBackgroundMusic = (): void => {
  if (!state.isInitialized) initAudio();
  if (!state.audioContext || !state.musicGain) return;
  
  resumeAudio();
  
  stopBackgroundMusic();
  
  const melody = [262, 294, 330, 349, 392, 440, 494, 523];
  let noteIndex = 0;
  
  const playNote = () => {
    if (!state.audioContext || !state.musicGain || !state.musicOscillator) return;
    
    const freq = melody[noteIndex % melody.length];
    state.musicOscillator.frequency.setValueAtTime(freq, state.audioContext.currentTime);
    
    noteIndex++;
  };
  
  state.musicOscillator = state.audioContext.createOscillator();
  state.musicOscillator.type = 'square';
  state.musicOscillator.frequency.value = melody[0];
  
  state.musicOscillator.connect(state.musicGain);
  state.musicOscillator.start();
  
  setInterval(playNote, 300);
};

export const stopBackgroundMusic = (): void => {
  if (state.musicOscillator) {
    try {
      state.musicOscillator.stop();
      state.musicOscillator.disconnect();
    } catch {
      // Ignore errors when stopping
    }
    state.musicOscillator = null;
  }
};

export const setSoundVolume = (volume: number): void => {
  if (state.soundGain) {
    state.soundGain.gain.value = Math.max(0, Math.min(1, volume));
  }
};

export const setMusicVolume = (volume: number): void => {
  if (state.musicGain) {
    state.musicGain.gain.value = Math.max(0, Math.min(1, volume)) * 0.3;
  }
};

export const setMasterVolume = (volume: number): void => {
  if (state.masterGain) {
    state.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
};

export const isAudioInitialized = (): boolean => {
  return state.isInitialized;
};
