// All player-facing texts in one place, so translations (e.g. English) can be added later.
// The game is for kids who cannot read yet, so texts are short and always paired with pictures.

export const TEXTS = {
  title: 'Ježek a jablíčko',
  tapToPlay: 'Ťukni a hraj',
  level1: 'Slunná louka',
  level2: 'Lesní cestička',
  level3: 'Skalnaté údolí',
  didYouKnow: 'Víš, že…?',
  paused: 'Pauza',
  allDone: 'Hurá! Ježek je připravený na zimu.',
} as const;

export type TextKey = keyof typeof TEXTS;

export function t(key: string): string {
  return (TEXTS as Record<string, string>)[key] ?? key;
}
