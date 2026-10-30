# 01 – Původní vstupní zadání (archiv)

> Tento soubor je **archiv původních vstupů** tak, jak vznikly (prompt uživatele pro ChatGPT a odpovědi ChatGPT).
> Neupravuje se. Platná rozhodnutí a jejich změny jsou v [`STAV_PROJEKTU.md`](../STAV_PROJEKTU.md)
> a v [`02_herni_design.md`](02_herni_design.md). Kde se tyto dokumenty liší od archivu, **platí novější dokumenty**.

Datum zpracování: 2026-10-30

---

## A) Původní prompt autora pro ChatGPT

> Chtěl bych udělat hru, takovou skákačku na styl prehistoric, podobná grafika, trošku líbivější dnešní době, pomalejší tempo, kde v hlavní roli bude ježek. Ježek by měl sbírat jablíčka a dostat je do úkrytu listí. Levely by se měly stupňovat náročností, pro začátek by to chtělo udělat maximálně 3 úrovně od kterých se odrazíme. Chtěl bych tuhle hru vytvořit tak, aby byla naučná, takže byť ježek sbírá jablíčka, nakonec by měl z toho jablíčka sežrat akorát červíka a jablíčko vyprsknout.
>
> Měla by to být 2D grafika (ne nutně pixelart), chtělo by to i nějakou líbeznou podkresovou hudbu. Napiš mi prompt pro Claude Code, který tuhle hru vytvoří. Grafiku a modely budeme později generovat spolu, ale potřebuji od tebe navrhnout i screenshot jak by tato hra mohla vypadat, abych ho mohl použít pro pozdější použití.
>
> - navrhni prompt pro Claude Code
> - navrhni screenshot takové hry
> - navrhni prompt pro Suno pro podkresovou muziku (bez vokálu, jen melodie)

## B) Doplňující požadavky autora (zadané přímo Claude Code)

- Hra má jít hrát **v prohlížeči** a později **na Android telefonech a tabletech**.
- Hra je **pro děti**. Nesmí vyžadovat **více kláves současně**. Příklad: šipkou dojdu dopředu, zastavím se, a teprve když postavička stojí, jinou klávesou skočím nahoru nebo dopředu. Takto to zvládne i malé dítě a pomalu se učí ovládat tablet / telefon / počítač.
- Klíčové body se zapisují do projektu a soubor se stavem se **aktualizuje a zobrazuje s každým commitem**.
- Commituje se na **GitHub** (účet se propojí později).

## C) Vizuální reference (screenshot od ChatGPT)

Screenshot zatím **není v repozitáři**. Uložit do `docs/reference/` (viz dotazník, otázka 1.4).

---

## D) Brief pro Claude Code (výstup ChatGPT, beze změn obsahu)

### Game Development Brief: Hedgehog & The Apple

Act as a senior indie game developer, game designer, and 2D artist. Your task is to create a fully playable 2D platformer prototype called Hedgehog & The Apple.

#### 1. Game Concept

Create a charming, relaxing, educational 2D platformer inspired by classic prehistoric platform games such as Prehistorik, but with a more modern, polished, colorful and appealing visual style.

The main character is a small, adorable hedgehog living in a prehistoric-inspired natural environment.

The game should feel:
- Relaxing and enjoyable.
- Slightly adventurous.
- Family-friendly.
- Charming and visually appealing.
- Educational, with a subtle connection to real hedgehog behavior and nature.

Avoid overly fast gameplay, aggressive enemies, excessive combat or complicated mechanics.
The game should have a relatively slow pace, rewarding exploration and careful movement.

#### 2. Main Character and Core Gameplay

The player controls a small hedgehog. The hedgehog must:
- Explore the environment.
- Collect fallen apples.
- Carry apples to its leafy shelter.
- Find worms inside the apples.
- Eat the worms.
- Spit out the remaining apple.

The central educational element is that hedgehogs are insectivores. They eat insects, worms and other small invertebrates, not apples as their primary food. The apple is therefore a container for a hidden worm.

When the hedgehog finds an apple:
- Play a small discovery animation.
- Reveal a worm inside.
- Let the hedgehog eat the worm.
- Play a funny but cute animation of the hedgehog spitting out the remaining apple.

Make this mechanic visually understandable, entertaining and suitable for children.
Important: Do not suggest that apples are a normal or recommended food for real hedgehogs. The game should communicate the educational distinction naturally.

#### 3. Game Structure

For the first prototype, create exactly THREE playable levels. Each level should introduce additional challenges.

**Level 1 – The Sunny Meadow** — Difficulty: Easy.
Environment: green grass, large trees, colorful flowers, small rocks, fallen leaves, beautiful distant mountains.
Gameplay: introduce basic movement, introduce jumping, collect 3–5 apples, introduce the leafy shelter, teach the player how to discover and eat worms. This level should be very forgiving and serve as a tutorial.

**Level 2 – The Forest Path** — Difficulty: Medium.
Environment: denser forest, tree roots, mushrooms, fallen logs, small hills, natural obstacles.
Gameplay: more complex platform placement, small gaps requiring jumps, slightly harder-to-reach apples, moving platforms such as floating leaves or branches, introduce a harmless environmental hazard.

**Level 3 – The Rocky Valley** — Difficulty: Hard.
Environment: rocky landscape, waterfalls, higher platforms, ancient-looking rocks, more vertical exploration, beautiful sunset lighting.
Gameplay: more challenging jumps, multiple platform heights, moving obstacles, more complex apple collection routes, require careful timing and exploration.

Difficulty should increase gradually without making the game frustrating.

#### 4. Visual Direction

Use modern 2D hand-painted cartoon graphics.
Visual inspiration: classic Prehistorik platform games, modern indie platformers, children's illustrated storybooks, beautiful nature-inspired environments.
Art direction: rich natural colors, soft lighting, detailed foreground and background, rounded character shapes, expressive animations, layered parallax backgrounds, smooth transitions.
Do not use basic pixel art. The hedgehog should be recognizable, cute, expressive and have a distinctive silhouette. Use a side-scrolling 2D perspective. The environment should have multiple visual layers to create depth.
For the prototype, use placeholder assets where necessary, but organize the project so that all artwork can be replaced later without changing gameplay logic.

#### 5. Character Animations

Idle, Walking, Running, Jumping, Falling, Landing, Collecting an apple, Carrying an apple, Discovering a worm, Eating a worm, Spitting out an apple, Celebrating at the shelter, Taking damage.
Animations should be smooth and expressive. The apple-eating sequence is one of the most important visual moments in the game.

#### 6. Game Mechanics

Horizontal movement, jumping with gravity, platform collision, collectible apples, apple inventory or carrying mechanic, worm discovery interaction, eating animation, apple-spitting animation, leaf shelter as the level objective, health or lives system, level completion, restart functionality, basic pause menu.
The player should be able to carry apples and deliver them to the shelter. The game should track the number of apples collected and delivered.

#### 7. User Interface

Simple, attractive HUD: hedgehog portrait, health represented by hearts, apple collection counter, current level, pause button. Should feel like part of a modern children's adventure game. Avoid clutter.

#### 8. Audio

Audio system supporting: background instrumental music, walking on grass, jumping, landing, apple collection, worm discovery, eating, funny apple-spitting sound, level completion, ambient forest sounds.
Music gentle, melodic, playful and relaxing. No vocals. All audio assets replaceable later.

#### 9. Technical Requirements

Inspect the environment and select an appropriate technology. Prefer Godot 4.x unless the existing environment suggests a better option.
2D physics, scene-based architecture, reusable game objects, separate player / environment / UI / level logic, clean and maintainable code, descriptive naming, comments in English.
Target resolution 1920x1080 with appropriate scaling.
Keyboard controls: A / D or Left / Right: Move. Space: Jump. E: Interact. Escape: Pause.

#### 10. Development Strategy

Do not generate all final artwork immediately. First create a complete playable prototype using placeholder graphics.
Prioritize: functional movement, collision and physics, collectible apples, worm discovery and eating mechanic, leaf shelter objective, three playable levels, UI, audio integration.
Clean project structure allowing placeholder replacement later. Do not generate random final character designs or environments yet.

#### 11. Expected Deliverables

Fully playable three-level prototype, working main menu, pause menu, level progression, functional apple and worm mechanics, basic sound and music integration, README explaining how to run the game, clearly documented asset structure, instructions for replacing placeholder assets.

---

## E) Prompt pro Suno (výstup ChatGPT)

```
Instrumental only. Absolutely no vocals, no singing, no spoken words, no choir.

Create a beautiful, gentle and whimsical soundtrack for a charming 2D platformer adventure game about a little hedgehog exploring a prehistoric forest and collecting apples.

The music should evoke a magical natural world, peaceful exploration, curiosity and childhood nostalgia.

Musical direction:
Soft acoustic guitar.
Warm piano melodies.
Gentle flute and wooden wind instruments.
Light pizzicato strings.
Subtle orchestral strings.
Delicate marimba and soft percussion.
Occasional natural-sounding musical accents.

The melody should be memorable, sweet, playful and emotionally warm without becoming childish or overly simplistic.

The atmosphere should combine:
Peaceful forest exploration.
A little sense of adventure.
Magical discovery.
Warm autumn afternoons.
A cozy fairytale atmosphere.

Tempo: 85–105 BPM.

Keep the arrangement relatively minimal, with no aggressive drums, heavy bass, electronic dance elements or dramatic cinematic impacts.

The soundtrack must work as continuous background music during gameplay. Avoid sudden changes in volume or intensity.

Create a seamless loop if possible.

Style references: modern indie game soundtrack, cozy adventure, whimsical orchestral folk, animated fairytale soundtrack.

Pure instrumental melody. No vocals whatsoever.
```

## F) Hudba podle levelů (výstup ChatGPT)

| Level | Hudební charakter |
|---|---|
| 1. Sunny Meadow | Veselá, jemná, optimistická melodie, flétna a kytara |
| 2. Forest Path | Tajemnější, hravější, jemné smyčce a dřevěné nástroje |
| 3. Rocky Valley | Dobrodružnější, trochu epická, ale stále klidná melodie |

Každý level má vlastní hudební identitu, ale všechny skladby používají podobnou instrumentaci a melodický styl.

## G) Doporučený postup vývoje (výstup ChatGPT)

Nejdřív funkční prototyp s jednoduchými grafickými objekty, teprve potom kompletní grafický balíček:

1. Hlavní postava – finální podoba ježka (proporce, barvy, výraz).
2. Animace – chůze, běh, skok, nesení jablíčka, hledání červíka, snězení, vyprsknutí jablíčka.
3. Objekty – jablíčka, červíci, listí, kameny, stromy, květiny.
4. Level 1 – kompletní grafické prostředí.
5. Level 2 a 3 – postupně náročnější prostředí a překážky.

Designová myšlenka ChatGPT: ježek jako „malý sběratel zásob na zimu“, hráč mu pomáhá připravit úkryt a postupně se dozvídá zajímavosti o skutečném životě ježků.
⚠️ Pozor – viz faktická kontrola v `02_herni_design.md`: ježci si **zásoby jídla neukládají**.
