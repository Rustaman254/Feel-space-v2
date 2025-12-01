/**
 * Game Sound Effects Manager
 * Provides audio context and playback for game sound effects
 */

// Audio context (lazy initialization)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a beep/tone sound
 * @param frequency Frequency in Hz
 * @param duration Duration in seconds
 * @param volume Volume 0-1
 */
export function playBeep(frequency: number = 800, duration: number = 0.1, volume: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Could not play sound:', error);
  }
}

/**
 * Play a "success" sound (ascending tones)
 */
export function playSuccess(): void {
  playBeep(400, 0.1, 0.3);
  setTimeout(() => playBeep(600, 0.1, 0.3), 100);
  setTimeout(() => playBeep(800, 0.2, 0.3), 200);
}

/**
 * Play a "match found" sound (double beep)
 */
export function playMatch(): void {
  playBeep(600, 0.15, 0.4);
  setTimeout(() => playBeep(700, 0.15, 0.4), 150);
}

/**
 * Play a "wrong match" sound (low tone)
 */
export function playWrong(): void {
  playBeep(300, 0.2, 0.3);
}

/**
 * Play a "pop" sound (short burst)
 */
export function playPop(): void {
  playBeep(1200, 0.05, 0.2);
  setTimeout(() => playBeep(1000, 0.05, 0.2), 50);
}

/**
 * Play a "game over" sound
 */
export function playGameOver(): void {
  playBeep(500, 0.2, 0.3);
  setTimeout(() => playBeep(400, 0.2, 0.3), 200);
  setTimeout(() => playBeep(300, 0.3, 0.3), 400);
}

/**
 * Play a "level complete" sound (ascending melody)
 */
export function playComplete(): void {
  playBeep(523, 0.1, 0.3); // C
  setTimeout(() => playBeep(659, 0.1, 0.3), 100); // E
  setTimeout(() => playBeep(784, 0.2, 0.3), 200); // G
}

/**
 * Play a "breathing cue" sound
 */
export function playBreathingCue(): void {
  playBeep(440, 0.5, 0.2); // Soft A note
}

/**
 * Play a tick sound
 */
export function playTick(): void {
  playBeep(1500, 0.05, 0.15);
}
