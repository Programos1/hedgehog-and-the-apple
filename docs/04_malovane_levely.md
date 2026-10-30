# 04 – Malované levely (z obrázku do hry)

Místo skládání levelu z dlaždic může být celý level **jeden namalovaný obrázek**. Hra z něj vezme pozadí
a podle tvého označení ví, kudy se chodí. Ukázka: **Malovaná scéna** v menu (`src/levels/testScene.ts`).

## Co potřebuju od tebe (2 obrázky)

1. **Čistý obrázek scény**:
   - **bez ježka, bez jablek a listů, bez herních ukazatelů** (srdíčka, počítadla, tlačítka, texty) – všechno tohle kreslí hra sama;
   - široký formát (panorama, např. 3:1 nebo delší – level se posouvá doprava);
   - co nejvyšší rozlišení (ideálně výška ≥ 1080 px, jinak bude rozmazaný);
   - úkryt z listí klidně namaluj na konec (pravý okraj) – hra ho použije.
2. **Kopie téhož obrázku s označením** (stejný rozměr, nic jiného se nemění):

| Barva / značka | Význam | Jak to zpracuju |
|---|---|---|
| **MODRÁ čára** | povrch, po kterém ježek chodí – obtáhni **horní hranu** trávy / skály | automaticky (`tools/trace-level.mjs`) |
| *kde modrá není* | díra / propast – ježek spadne a vrátí se na bezpečné místo | automaticky |
| **ČERVENÉ J** | jablko s červíkem | podle oka |
| **ČERVENÉ Z** | zdravé jablko (bez červíka) | podle oka |
| **ČERVENÉ L** | list na hnízdo | podle oka |
| **ČERVENÉ S** | start ježka | podle oka |
| **ČERVENÉ Ú** | úkryt (pokud není namalovaný) | podle oka |
| **ČERVENÁ šipka ↔ / ↕** s obdélníkem | jezdící plošina a kudy jezdí | podle oka |
| **ČERVENÉ V** | voda (šplouchne a vrátí se) | podle oka |

Stačí hrubě, já to doladím.

## Na co myslet při kreslení
- Ježek skáče **nahoru asi o 1,5 své výšky** a **dopředu asi o 2,5 své délky**. Mezery a výšky mezi plošinami
  by měly být v těchto mezích – jinak upravím velikost ježka v levelu (`worldScale`), aby to šlo.
- Plošiny, na které se skáče zespodu, ježek „prostřelí“ hlavou a dopadne nahoru (je to pro děti snazší).
- Úkryt vždy **na konci** (vpravo), listí a jablka **po cestě**.

## Jak to zpracuju (pro vývojáře)
```
node tools/trace-level.mjs <čistý.png> <označený.png> public/assets/levels/<jméno>.png --cropBottom=<výška> --patches=tools/levels/<jméno>.patches.json
```
- vypíše povrchy (`surfaces`) v souřadnicích hry → vložit do nového souboru v `src/levels/`,
- `--patches` (volitelně) zamaluje věci, které v obrázku být nemají (klon z okolí nebo rozmazání),
- obrázek pozadí přidat do `IMAGE_MANIFEST` a level do `src/levels/index.ts`.
