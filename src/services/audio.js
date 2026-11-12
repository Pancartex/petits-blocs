export function createAudio() {
  let context;
  return function playTone(enabled, cleared = false) {
    if (!enabled) return;
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      const delays = cleared ? [0, 0.09, 0.18] : [0];
      delays.forEach((delay, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + delay;
        oscillator.type = 'sine';
        oscillator.frequency.value = (cleared ? 440 : 330) * 1.25 ** index;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.26);
      });
    } catch { /* Sound is optional; browser audio restrictions must not stop play. */ }
  };
}
