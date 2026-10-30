# Grafika a zvuk – jak vyměnit zástupné soubory

Hra zatím všechno kreslí sama, jednoduchými tvary (`src/art/PlaceholderArt.ts`).
Skutečnou grafiku a zvuk vložíš **bez zásahu do herní logiky**:

1. Soubor ulož do `public/assets/images/…` (obrázky, PNG s průhledností) nebo `public/assets/audio/…` (MP3/OGG).
2. V `src/assets/manifest.ts` u příslušného klíče nahraď `null` cestou, např.
   `hedgehog: 'assets/images/hedgehog.png',`
3. Hotovo. Pokud se soubor nenačte, hra použije zástupnou grafiku a do konzole napíše varování.

## Ježek Nibbles (atlas z referenčního listu)

Ježek se vyřezává automaticky z tvého referenčního obrázku `docs/reference/jezek.ikony.png`:

```
npm run sprites
```

Nástroj `tools/slice-sprites.mjs` podle `tools/nibbles.sprites.json` vyřízne snímky, odstraní pozadí
a uloží atlas `public/assets/images/nibbles.png` + `.json`. Hra ho načte sama (`ATLAS_MANIFEST`).

| Snímky v atlasu | Použití ve hře |
|---|---|
| `idle_0–3` | stání (dýchání) |
| `walk_0–3` | chůze |
| `jump_0` → `jump_1` → `jump_2` → `jump_3` / `fall_0` → `jump_4`, `land_2` | přikrčení → odraz → vrchol → pád → dopad |
| `discover_0` | čuchání k jablku |
| `eat_0–1`, `spit_0–1` | jedení housenky, vyprsknutí jablka |
| `hurt_0` | trefa šiškou (klubíčko s hvězdičkami) |
| `celebrate_0` | konec levelu (ježek v hnízdě) |
| `face_*`, `front_0` | portrét v HUD, budoucí použití |

**Když dodáš nový / lepší list:** ulož ho do `docs/reference/`, a pokud se změní rozložení, je potřeba
upravit souřadnice v `tools/nibbles.sprites.json` (`node tools/find-sprites.mjs <obrázek>` je vypíše).

**Pravidla pro listy s grafikou (aby šly automaticky vyříznout):**
- jednobarevné světlé pozadí, **bez stínů pod postavou** a bez prachu/čar pohybu (nebo dál od postavy),
- mezi obrázky aspoň **20 px volného místa**, popisky dál od obrázků,
- všechny obrázky ve **stejném měřítku** a ideálně větší (postava aspoň 250 px na šířku → ostřejší na tabletu),
- postava kouká **doprava**.

## Jednotlivé objekty z malovaného obrázku

Když objekt není na jednobarevném pozadí (např. výřez ze screenshotu), ale má **tmavý obrys**,
vyřízne ho `tools/cut-object.mjs`. Jablko: `npm run apple`
(z `docs/reference/jablko.png` udělá `apple.png` a automaticky i nakousnuté `apple-bitten.png`).

## Obrázky (klíč → rozměr)

| Klíč | Rozměr (px) | Poznámka |
|---|---|---|
| `hedgehog` | 128×96 | ježek z boku, **dívá se doprava**, nožičky u spodního okraje |
| `hedgehog-curled` | 84×84 | ježek svinutý do klubíčka |
| `apple`, `apple-bitten` | 52×56 | celé / nakousnuté jablko |
| `larva` | 48×20 | housenka (hlavička vpravo) |
| `leaf` | 56×40 | list na hnízdo |
| `shelter` | 300×200 | úkryt z listí, spodní okraj = zem, vchod uprostřed dole |
| `pine-cone` | 34×46 | šiška |
| `ground-<téma>` | 128×512 | dlaždice země, opakuje se vodorovně, tráva nahoře |
| `platform-<téma>`, `moving-<téma>` | 64×36 | dlaždice plošiny / pohyblivé plošiny |
| `water` | 128×200 | dlaždice vody |
| `bg-<téma>-sky/far/mid/near` | 1920×1080 | vrstvy parallaxu (kromě `sky` průhledné), opakují se vodorovně |
| `fact-*` | 420×300 | obrázky ke kartičkám „Víš, že…?“ |

Témata: `meadow` (louka), `forest` (les), `valley` (údolí).
Ikony tlačítek (`icon-*`, 96×96, bílé) jdou nahradit stejně, jen je potřeba je přidat do manifestu.

**Animace:** ježek má zatím jednoduché „procedurální“ animace (houpání, naklonění, zmáčknutí).
Až budeme mít finální grafiku, doplníme sprite sheety / cut-out animaci (viz dotazník 6.2).

## Zvuky

Klíče v `AUDIO_MANIFEST.sfx`: `jump, land, pickup, sniff, discover, yum, spit, nope, deliver, splash, curl, complete, tap`.
Bez souboru hraje krátký syntetický tón.

## Hudba

**Jedna hudba pro celou hru** (menu i všechny levely), hraje plynule i při přechodech mezi obrazovkami.
Skladby ze složky `public/assets/audio/music/` jsou v seznamu `AUDIO_MANIFEST.musicPlaylist`
(`src/assets/manifest.ts`) – hrají postupně za sebou a pak znovu od začátku.

- Přidání skladby: ulož MP3 do složky (název bez mezer, např. `music-07.mp3`) a připiš ho do seznamu.
- Skladby se nestahují předem, ale postupně při přehrávání → hra se načte rychle i na mobilu.
- Hudba začne po prvním ťuknutí / stisku klávesy (pravidlo prohlížečů), při zamčení telefonu se zastaví.
- Ztlumení: tlačítko v menu a v pauze (pamatuje si ho).
