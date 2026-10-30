# Grafika a zvuk – jak vyměnit zástupné soubory

Hra zatím všechno kreslí sama, jednoduchými tvary (`src/art/PlaceholderArt.ts`).
Skutečnou grafiku a zvuk vložíš **bez zásahu do herní logiky**:

1. Soubor ulož do `public/assets/images/…` (obrázky, PNG s průhledností) nebo `public/assets/audio/…` (MP3/OGG).
2. V `src/assets/manifest.ts` u příslušného klíče nahraď `null` cestou, např.
   `hedgehog: 'assets/images/hedgehog.png',`
3. Hotovo. Pokud se soubor nenačte, hra použije zástupnou grafiku a do konzole napíše varování.

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

Klíče v `AUDIO_MANIFEST.music`: `menu, meadow, forest, valley` – smyčky bez vokálu (Suno).
Bez souboru je ticho.
