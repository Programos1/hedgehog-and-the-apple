# 02 – Herní design a analýza (živý dokument)

> Zpracování vstupů z [`01_vstupni_zadani.md`](01_vstupni_zadani.md) + požadavků autora.
> Položky označené **[NÁVRH]** čekají na potvrzení v [`DOTAZNIK.md`](../DOTAZNIK.md).
> Položky označené **[ROZHODNUTO]** jsou závazné.

Název hry: **Nibbles' Little Adventure** [ROZHODNUTO 2026-10-30]. Ježek se jmenuje **Nibbles**.

---

## 1. Pilíře hry (podle čeho posuzujeme každé rozhodnutí)

1. **Pro malé děti** [ROZHODNUTO] — žádné kombinace kláves, žádný stres, žádný časový limit, žádné násilí.
2. **Naučná** [ROZHODNUTO] — ježek je hmyzožravec; jablko je jen „obal“ pro larvu. Fakta musí být pravdivá.
3. **Klidné tempo** [ROZHODNUTO] — pomalejší pohyb, odměňuje průzkum a rozvahu, ne reflexy.
4. **Líbivá 2D grafika** [ROZHODNUTO] — ručně malovaný kreslený styl, parallax, ne pixel-art. Inspirace žánrem klasických plošinovek (Prehistorik), **ne kopie** konkrétní hry.
5. **Prohlížeč → Android** [ROZHODNUTO] — nejdřív web, později telefony a tablety. Dotyk je plnohodnotné ovládání, ne dodatek.

---

## 2. Ovládání pro děti [ROZHODNUTO – princip] / [NÁVRH – detaily]

### Princip (závazný)
- **Vždy jen jedno tlačítko najednou.** Hra nikdy nevyžaduje držet dvě klávesy současně.
- **Skok jen ze stoje.** Postavička dojde, zastaví se, teprve pak skočí.
- Skoky mají **pevnou, předvídatelnou dráhu** (vždy stejně vysoko / stejně daleko) → dítě se je naučí, a levely se navrhují přesně na tyto vzdálenosti.

### Návrh rozložení
| Akce | Klávesnice | Dotyk (telefon/tablet) |
|---|---|---|
| Jdi doleva | `←` (nebo `A`) | velké tlačítko vlevo dole |
| Jdi doprava | `→` (nebo `D`) | velké tlačítko vlevo dole |
| Skok nahoru | `↑` (nebo `W`) | velké tlačítko vpravo dole |
| Skok dopředu (ve směru pohledu) | `Mezerník` | velké tlačítko vpravo dole |
| Pauza | `Esc` / `P` | ikona v rohu |

- **Sbírání a odevzdání jablek automaticky** (dotykem), bez klávesy `E` — o jednu věc méně k naučení.
- Stisk skoku během chůze: [NÁVRH] ježek se nejdřív sám plynule zastaví a pak skočí (dítě nemusí trefit „zastavení“). Alternativa: skok během chůze se ignoruje. → dotazník 2.2
- Žádný „běh“ (Running animace z briefu se ruší) — porušuje pomalé tempo a vyžadoval by modifikátor. → dotazník 2.3
- Volitelně později: režim „ťukni, kam má ježek dojít“ pro nejmenší. → dotazník 2.4

### Rozdíly oproti briefu ChatGPT
| Brief | Nově | Důvod |
|---|---|---|
| Space = skok (i za běhu) | Skok jen ze stoje, dva druhy skoku | Požadavek autora, předvídatelnost |
| E = interakce | Automaticky | Méně kláves |
| Running | Zrušeno | Tempo, jedna klávesa |
| 1920×1080 pevně | 16:9 základ, škálování, landscape na mobilu | Telefony mají různé poměry stran |

---

## 3. Herní smyčka (core loop) [ROZHODNUTO – viz §10, tato původní verze je překonaná]

1. Ježek prochází level a hledá spadlá jablka.
2. Jablko sebere (dotykem) a nese ho (max. počet nesených: 1? → dotazník 3.2).
3. Donese ho do úkrytu z listí.
4. V úkrytu: animace „objevení“ → z jablka vyleze **housenka** → ježek ji sní (mňam) → jablko vtipně **vyprskne**.
5. Krátká **zajímavost o ježcích** (obrázek + jedna věta, ideálně namluvená).
6. Po doručení všech jablek → konec levelu, oslava.

Alternativní smyčka (červík se objeví hned při sebrání a do úkrytu ježek nosí listí) → dotazník 3.1.

---

## 4. ⚠️ Faktická kontrola – naučný obsah

Hra je naučná, takže **nesmí šířit mýty**. V zadání jsou tři problémy:

| # | Tvrzení v zadání | Skutečnost | Návrh řešení |
|---|---|---|---|
| F1 | „Červík v jablku“ | „Červ“ v jablku je ve skutečnosti **housenka (larva) obaleče jablečného** — motýla. Není to žížala. | Ve hře zobrazovat housenku; ve hře ji klidně nazývat „červík“, ale zajímavost vysvětlí, že je to housenka motýla. |
| F2 | Ježek nosí jablka (často zobrazováno na bodlinách) | **Mýtus.** Ježci jablka na bodlinách nenosí. Je to známá pohádková představa. | Ježek nese jablko v tlamičce / tlačí ho čumáčkem. Mýtus můžeme využít jako zajímavost („Víš, že…?“). |
| F3 | „Ježek – sběratel zásob na zimu“ (návrh ChatGPT) | **Nepravda.** Ježci si zásoby jídla neukládají. Před zimou se **vykrmí (tukové zásoby)** a postaví si **hnízdo z listí**, kde přezimují. | Nosí se jablka do úkrytu, protože tam je ježek v bezpečí a v klidu ho „prohlédne“. Motivace levelu = „ježek se musí vykrmit před zimou“ (ukazatel bříška). Případně sbírá i listí na hnízdo. → dotazník 3.1 |

Další ověřená fakta vhodná do hry (kartičky „Víš, že…?“):
- Ježek je **hmyzožravec**: jí brouky, housenky, žížaly, slimáky.
- Ježek je aktivní hlavně **v noci** (soumrak/noc by mohl být bonusový level).
- Ježek **přezimuje** v hnízdě z listí (cca listopad–březen).
- Ježkům se **nesmí dávat mléko** — nesnášejí laktózu, je jim z něj zle.
- Ježek má **5–7 tisíc bodlin**, při nebezpečí se svine do klubíčka.
- Ježek je v ČR **chráněný** živočich.
- Na podzim pomůže ježkům **hromada listí** na zahradě.

> Všechny texty zajímavostí před vydáním zkontroluje člověk (ideálně ověří zdroj, např. ČSOP / záchranné stanice). Viz STAV_PROJEKTU – úkol „Fakta ověřena“.

---

## 5. Levely [IMPLEMENTOVÁNO v prototypu – viz §10]

| Level | Prostředí | Obtížnost | Nové prvky | Jablek |
|---|---|---|---|---|
| 1. Slunná louka | tráva, stromy, květiny, kameny, hory v pozadí | velmi lehká (tutoriál) | chůze, skok nahoru, skok dopředu, úkryt | 3 |
| 2. Lesní cestička | hustý les, kořeny, houby, kmeny, kopečky | střední | mezery, pohyblivé plošiny (list na vodě / větev), neškodná překážka | 4–5 |
| 3. Skalnaté údolí | skály, vodopády, západ slunce | „těžší“ (pro děti!) | vertikální průzkum, více výšek, pohybující se překážky | 5 |

- Obtížnost stoupá, ale **nikdy nesmí frustrovat**: žádný časový limit, žádné „game over“ (→ dotazník 4.1).
- Brief chce v L3 „careful timing“ — pro malé děti zmírnit: pohyblivé plošiny čekají na ježka / jsou pomalé.
- Délka levelu [NÁVRH]: 2–4 minuty hraní.

### Neškodné překážky [NÁVRH]
- Kaluž / potok → ježek „cákne“ a vrátí se na poslední bezpečné místo.
- Padající šiška / kapka z vodopádu → ježek se svine do klubíčka (naučné!) a chvíli se nehýbe.
- Žádní agresivní nepřátelé. Případně zvířata, kterým se vyhneme (liška spí, jezevec…) → dotazník 4.2.

---

## 6. Technologie [ROZHODNUTO: Phaser 4 + TypeScript + Vite]

Brief doporučuje Godot 4. Kvůli cíli **web → Android** a jednoduchosti nasazení doporučuji:

| Volba | Výhody | Nevýhody |
|---|---|---|
| **Phaser 3 + TypeScript + Vite** (doporučeno) | nativně web, malé stažení, rychlé načtení, snadné nasazení (GitHub Pages), Android přes **Capacitor** / PWA, dotyk bez problémů | méně vizuálních editorů (levely v Tiled editoru) |
| Godot 4.x | výborný editor, export na Android nativně | webový export je větší (~30–40 MB), pomalejší start, starší tablety a iOS Safari dělají potíže |

Předpokládaná architektura (Phaser):
- `src/scenes/` – Boot, Preload, Menu, Level, HUD, Pause, LevelComplete
- `src/entities/` – Hedgehog, Apple, Larva, Shelter, MovingPlatform, Hazard
- `src/input/` – jednotná vrstva vstupu (klávesnice + dotyk → stejné akce)
- `src/data/` – fakta o ježcích, nastavení levelů
- `public/assets/` – grafika/zvuk podle pevné struktury, výměna bez zásahu do kódu (manifest)
- Levely zatím jako TypeScript data (`src/levels/`); převod z **Tiled** map doplníme, až budeš chtít levely kreslit sám.
- Uložení postupu: `localStorage` (žádný server, žádná osobní data).
- Komentáře v kódu anglicky, texty hry přes překladový soubor (CZ první).

---

## 7. Grafika [NÁVRH]

- Styl: ručně malovaný kreslený, měkké světlo, zaoblené tvary, výrazné obrysy postav, 3–5 vrstev parallaxu.
- Prototyp: zástupná grafika (jednoduché tvary), ale už se **správnými rozměry a pojmenováním**.
- Animace ježka: idle, chůze, skok (odraz/let/dopad), nesení jablka, objevení housenky, jedení, vyprsknutí, oslava, svinutí do klubíčka (místo „taking damage“).
- Doporučení pro AI generování: držet jeden **model sheet** ježka (předek/bok/záda, paleta barev) a od něj odvozovat vše, jinak bude postava v každém obrázku jiná. → dotazník 6.x
- Technika animace: snímkové sekvence (sprite sheet) nebo „cut-out“ rig → dotazník 6.2.
- Referenční screenshot od ChatGPT uložit do `docs/reference/`.

---

## 8. Zvuk a hudba [NÁVRH]

- 4 skladby: Menu, Level 1 (flétna + kytara, vesele), Level 2 (tajemněji, smyčce + dřevo), Level 3 (dobrodružněji, ale klidně). Bez vokálu, smyčkovatelné.
- Zvuky: kroky po trávě, skok, dopad, sebrání jablka, objevení housenky, „mňam“, vtipné „pfft“ vyprsknutí, dokončení levelu, ambient lesa (ptáci, potok).
- Hlasitost hudby a efektů zvlášť, tlačítko ztlumit.
- **Licence:** Suno – komerční využití jen s placeným plánem v době generování (ověřit aktuální podmínky). → dotazník 7.2
- Prompty pro Suno pro jednotlivé levely připravíme samostatně (`docs/03_audio.md` – TODO).

---

## 9. Mobil a tablet – na co myslet od začátku

- Orientace **na šířku**, výzva k otočení zařízení.
- Tlačítka velká (min. ~15 % výšky obrazovky), vzdálená od okrajů (bezpečné zóny, výřezy displeje).
- Hudba se v prohlížeči smí spustit až po prvním dotyku (omezení prohlížečů) → „Ťukni a hraj“ úvodní obrazovka.
- Výkon: cílit na 60 FPS i na levném tabletu; velikost stažení < 20 MB.
- Rodičovská sekce (nastavení, odkazy) za jednoduchou „rodičovskou zámkou“.
- Google Play – kategorie pro rodiny má přísná pravidla (žádné sledování, reklamy jen certifikované) → dotazník 8.x.

---

## 10. Rozhodnutí z dotazníku a aktuální implementace (2026-10-30)

**Zodpovězeno autorem:** věk 3–5 let · smyčka „jíst na místě + listí na hnízdo“ · nikdy neprohraje · Phaser · veřejný repozitář s „všechna práva vyhrazena“.
**Předběžně podle doporučení** (dotazník nevyplněn, lze změnit): skok za chůze = ježek sám zastaví (2.2) · bez běhu (2.3) · zdravá jablka od levelu 2 (3.3) · kartička „Víš, že…?“ na konci levelu (3.5) · zatím bez hlasu (3.6) · jen neškodné překážky (4.2) · bez časového limitu a skóre (4.3) · reálná příroda, ne pravěk (1.5).

### Herní smyčka (platná)
1. Ježek dojde k jablku → zastaví se a **očuchá** ho.
2. **Jablko s červíkem:** vyleze housenka → ježek ji sní („mňam“) → jablko **vyprskne** obloukem pryč. V HUD se rozsvítí housenka.
3. **Zdravé jablko** (od levelu 2): bublina s přeškrtnutou housenkou, ježek zavrtí hlavou a jablko nechá.
4. **Listí:** ježek nese vždy 1 list na zádech → donese ho do úkrytu → list přistane na hnízdě. V HUD se rozsvítí list.
5. Když je vše hotové, úkryt se třpytí → ježek do něj vleze a usne → kartička „Víš, že…?“ → další level.
6. Šipka nad ježkem ukazuje k nejbližšímu cíli, když je mimo obrazovku (pro nejmenší).

### Pevné skoky (`src/config.ts`)
- Chůze 230 px/s. Skok nahoru: výška ~190 px. Skok dopředu: výška ~120 px, délka ~330 px.
- Plošiny jsou „jednosměrné“: dá se na ně vyskočit zespodu.

### Levely v prototypu
| Level | Délka | Housenky | Zdravá jablka | Listí | Nové prvky |
|---|---|---|---|---|---|
| 1. Slunná louka | 3800 px | 3 | 0 | 2 | cedulky s nápovědou, 1 potůček |
| 2. Lesní cestička | 5000 px | 4 | 1 | 3 | dvoupatrová plošina, schod, list-vor přes potok |
| 3. Skalnaté údolí | 5600 px | 5 | 2 | 3 | věž plošin, kamenný výtah na útes, padající šišky (ježek se svine) |

Všechny 3 levely byly automaticky dohrány v prohlížeči (test 2026-10-30).
