import Phaser from 'phaser';
import { AUDIO_MANIFEST, type SfxKey } from '../assets/manifest';
import { Progress } from '../systems/Progress';

// Plays sound effects and the background music.
// Sound effects: a real file from the manifest if loaded, otherwise a tiny synthesized placeholder.
// Music: one playlist for the whole game, streamed through an <audio> element so it keeps playing
// seamlessly across scene changes (menu → level → pause → next level) and loops forever.

type Tone = { f: number; to?: number; d: number; type?: OscillatorType; v?: number; delay?: number };

const PLACEHOLDER_SFX: Record<SfxKey, Tone[]> = {
  jump: [{ f: 320, to: 620, d: 0.18, type: 'sine' }],
  land: [{ f: 140, to: 90, d: 0.08, type: 'triangle', v: 0.25 }],
  pickup: [{ f: 660, d: 0.08 }, { f: 880, d: 0.1, delay: 0.07 }],
  sniff: [{ f: 900, to: 700, d: 0.05, type: 'square', v: 0.05 }, { f: 900, to: 700, d: 0.05, type: 'square', v: 0.05, delay: 0.12 }],
  discover: [{ f: 520, d: 0.1 }, { f: 660, d: 0.1, delay: 0.1 }, { f: 780, d: 0.16, delay: 0.2 }],
  yum: [{ f: 300, to: 420, d: 0.12, type: 'triangle' }, { f: 300, to: 460, d: 0.16, type: 'triangle', delay: 0.16 }],
  spit: [{ f: 700, to: 160, d: 0.22, type: 'sawtooth', v: 0.08 }],
  nope: [{ f: 420, to: 300, d: 0.18, type: 'triangle' }],
  deliver: [{ f: 523, d: 0.1 }, { f: 784, d: 0.18, delay: 0.1 }],
  splash: [{ f: 260, to: 80, d: 0.3, type: 'sawtooth', v: 0.06 }],
  curl: [{ f: 500, to: 200, d: 0.2, type: 'triangle' }],
  complete: [
    { f: 523, d: 0.15 },
    { f: 659, d: 0.15, delay: 0.15 },
    { f: 784, d: 0.15, delay: 0.3 },
    { f: 1047, d: 0.35, delay: 0.45 },
  ],
  tap: [{ f: 600, d: 0.05, v: 0.1 }],
};

class AudioManagerImpl {
  private game: Phaser.Game | null = null;
  private music: HTMLAudioElement | null = null;
  private track = 0;
  /** Own copy of the mute state – Phaser's getter reports the change only after the next audio tick. */
  private isMuted = false;

  init(game: Phaser.Game): void {
    this.game = game;
    this.isMuted = Progress.get().muted;
    game.sound.mute = this.isMuted;
    this.initMusic();
  }

  private initMusic(): void {
    const list = AUDIO_MANIFEST.musicPlaylist;
    if (!list.length) return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.45;
    audio.muted = this.muted;
    audio.addEventListener('ended', () => this.playTrack(this.track + 1));
    // A broken file must not stop the music – skip to the next track.
    audio.addEventListener('error', () => list.length > 1 && setTimeout(() => this.playTrack(this.track + 1), 500));
    this.music = audio;
    audio.src = list[0];

    // Browsers only allow sound after the first tap / key press.
    const start = () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      void audio.play().catch(() => undefined);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);

    // Stop the music while the app is in the background (phone locked, other tab).
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) audio.pause();
      else if (audio.currentTime > 0) void audio.play().catch(() => undefined);
    });
  }

  private playTrack(index: number): void {
    const list = AUDIO_MANIFEST.musicPlaylist;
    if (!this.music || !list.length) return;
    this.track = index % list.length;
    this.music.src = list[this.track];
    void this.music.play().catch(() => undefined);
  }

  get muted(): boolean {
    return this.isMuted;
  }

  toggleMute(): boolean {
    if (!this.game) return false;
    this.isMuted = !this.isMuted;
    this.game.sound.mute = this.isMuted;
    if (this.music) this.music.muted = this.isMuted;
    Progress.setMuted(this.isMuted);
    return this.isMuted;
  }

  sfx(key: SfxKey): void {
    if (!this.game || this.muted) return;
    const cacheKey = `sfx-${key}`;
    if (AUDIO_MANIFEST.sfx[key] && this.game.cache.audio.exists(cacheKey)) {
      this.game.sound.play(cacheKey, { volume: 0.8 });
      return;
    }
    this.synth(PLACEHOLDER_SFX[key]);
  }

  private synth(tones: Tone[]): void {
    const manager = this.game?.sound;
    if (!(manager instanceof Phaser.Sound.WebAudioSoundManager)) return;
    const ctx = manager.context;
    if (ctx.state !== 'running') return;
    const now = ctx.currentTime;
    for (const tone of tones) {
      const start = now + (tone.delay ?? 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.type ?? 'sine';
      osc.frequency.setValueAtTime(tone.f, start);
      if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, start + tone.d);
      const vol = tone.v ?? 0.15;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.d);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + tone.d + 0.02);
    }
  }
}

export const AudioManager = new AudioManagerImpl();
