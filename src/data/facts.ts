// Hedgehog facts shown on the "Did you know?" card after each level.
// Every fact must be true – verify with a reliable source (e.g. ČSOP, wildlife rescue stations) before release.

export interface Fact {
  id: string;
  /** Short sentence for kids (will be voiced later). */
  text: string;
  /** Texture key of the illustration. */
  image: string;
}

export const FACTS: Record<string, Fact> = {
  insectivore: {
    id: 'insectivore',
    text: 'Ježek je hmyzožravec. Nejradši papá brouky, housenky a žížaly.',
    image: 'fact-insectivore',
  },
  notApples: {
    id: 'notApples',
    text: '„Červík“ v jablku je housenka motýla. Ježek sní housenku, jablko nechá.',
    image: 'fact-larva',
  },
  curlUp: {
    id: 'curlUp',
    text: 'Když se ježek bojí, svine se do pichlavého klubíčka. Má asi 6 000 bodlin!',
    image: 'fact-curl',
  },
};
