import { STORAGE_KEY } from '../config';

// Saves which levels are unlocked. Storage may be unavailable (private mode), so every access is guarded.

interface ProgressData {
  unlocked: number;
  muted: boolean;
}

const DEFAULTS: ProgressData = { unlocked: 1, muted: false };

function read(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore – the game still works, it just won't remember progress.
  }
}

let cache: ProgressData | null = null;

export const Progress = {
  get(): ProgressData {
    return (cache ??= read());
  },
  unlock(levelId: number): void {
    const data = Progress.get();
    if (levelId > data.unlocked) {
      data.unlocked = levelId;
      write(data);
    }
  },
  setMuted(muted: boolean): void {
    const data = Progress.get();
    data.muted = muted;
    write(data);
  },
};
