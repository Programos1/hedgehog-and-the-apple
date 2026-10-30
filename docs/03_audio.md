# 03 – Hudba a zvuky

Vychází z promptu pro Suno od ChatGPT (`01_vstupni_zadani.md` §E–F). Každá skladba má společný základ
(stejná instrumentace a tempo), aby hra zněla jednotně, a vlastní náladu podle levelu.

## Jak generovat v Suno
- Režim **Custom**, zapnout **Instrumental**.
- Do pole **Style** vložit řádek „Style“, do pole **Lyrics/Prompt** delší popis (nebo nechat prázdné).
- Vygenerovat několik verzí, vybrat tu, která má **klidný začátek i konec** (kvůli smyčce).
- Zacyklení a ořez: Audacity. Export **MP3 128–160 kbps** (menší stažení na mobilu), délka ideálně 1,5–3 min.
- Uložit do `public/assets/audio/music/` a zapsat do `src/assets/manifest.ts` → `AUDIO_MANIFEST.music`.
- ⚠️ Pro případné vydání hry: generovat na **placeném** plánu Suno (komerční licence) – dotazník 7.2.

## Společný základ (vložit do každého promptu)
```
Instrumental only, no vocals, no choir, no spoken words. Gentle whimsical game soundtrack for a children's 2D platformer about a little hedgehog. Soft acoustic guitar, warm felt piano, wooden flute, light pizzicato strings, delicate marimba, very soft percussion. No heavy drums, no bass drops, no electronic elements, no sudden dynamics. Even volume, seamless loop, calm ending that flows back into the beginning.
```

## 1. Menu – `menu`
**Style:** `cozy whimsical folk, music box, acoustic guitar, flute, 90 bpm, instrumental, children's game menu`
```
[společný základ] Warm welcoming title theme. Simple memorable melody on flute and music box over soft guitar picking, like opening a picture book on an autumn afternoon. Short, friendly, loopable.
```

## 2. Slunná louka – `meadow`
**Style:** `cheerful pastoral folk, acoustic guitar, wooden flute, pizzicato, 100 bpm, instrumental, cozy game`
```
[společný základ] Happy, light and optimistic. Sunny meadow with flowers and butterflies. Bouncy guitar rhythm, playful flute melody, gentle pizzicato answers. Feels safe and encouraging for a small child learning to play.
```

## 3. Lesní cestička – `forest`
**Style:** `playful mysterious forest folk, clarinet, bassoon, soft strings, marimba, 92 bpm, instrumental`
```
[společný základ] A little more curious and mysterious, but still friendly – a shady forest path with mushrooms and old roots. Woodwinds (clarinet, bassoon) with soft strings and marimba, tiptoeing pizzicato, occasional bird-like flute trills. Never scary.
```

## 4. Skalnaté údolí – `valley`
**Style:** `gentle adventurous orchestral folk, warm strings, french horn, acoustic guitar, 96 bpm, instrumental, sunset`
```
[společný základ] Adventurous and slightly epic, but still calm – a rocky valley with waterfalls at golden sunset. Broad warm string melody with a soft french horn, steady guitar, light marimba. Sense of wonder and achievement, no dramatic hits.
```

## 5. (Volitelně) Jingle dokončení levelu
**Style:** `short happy fanfare, music box, flute, pizzicato, instrumental, 5 seconds`
```
Instrumental only. A 4–6 second cheerful "you did it" jingle for a children's game: rising flute and music box arpeggio ending on a warm major chord. No vocals.
```

## Zvukové efekty
Seznam klíčů a jejich význam je v `docs/ASSETS.md`. Doporučené zdroje: Kenney.nl (CC0), freesound.org (filtr CC0).
„Mňam“ a vyprsknutí („pfft“) doporučuju nahrát vlastní pusou, bude to roztomilejší a autorsky tvoje.
