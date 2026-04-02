export function fadeAudio(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number,
  onDone?: () => void
) {
  const start = performance.now();
  const diff = to - from;
  audio.volume = from;

  function step(now: number) {
    const progress = Math.min(1, (now - start) / durationMs);
    audio.volume = Math.max(0, Math.min(1, from + diff * progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  }

  if (durationMs <= 0) {
    audio.volume = to;
    onDone?.();
    return;
  }

  requestAnimationFrame(step);
}
