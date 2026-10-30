import Phaser from 'phaser';
import { AUDIO_MANIFEST, type SfxKey, type MusicKey } from '../assets/manifest';
import { Progress } from '../systems/Progress';

// Plays sound effects and music. When a real audio file is listed in the manifest and loaded,
// it is used; otherwise a tiny synthesized placeholder sound is played, so the prototype is never silent.

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
  private music: Phaser.Sound.BaseSound | null = null;
  private musicKey: MusicKey | null = null;

  init(game: Phaser.Game): void {
    this.game = game;
    game.sound.mute = Progress.get().muted;
  }

  get muted(): boolean {
    return this.game?.sound.mute ?? false;
  }

  toggleMute(): boolean {
    if (!this.game) return false;
    this.game.sound.mute = !this.game.sound.mute;
    Progress.setMuted(this.game.sound.mute);
    return this.game.sound.mute;
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

  /** Starts looping music for a level/menu. Silent until real music files are added. */
  playMusic(key: MusicKey): void {
    if (!this.game || this.musicKey === key) return;
    this.stopMusic();
    const cacheKey = `music-${key}`;
    if (!AUDIO_MANIFEST.music[key] || !this.game.cache.audio.exists(cacheKey)) return;
    this.music = this.game.sound.add(cacheKey, { loop: true, volume: 0.45 });
    this.music.play();
    this.musicKey = key;
  }

  stopMusic(): void {
    this.music?.stop();
    this.music?.destroy();
    this.music = null;
    this.musicKey = null;
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
