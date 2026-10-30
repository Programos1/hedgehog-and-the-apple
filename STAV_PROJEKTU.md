# 🦔 STAV PROJEKTU – Ježek a jablíčko

> **Živý dokument.** Aktualizuje se s každým commitem (hlídá to git hook `.githooks/pre-commit`)
> a po každém commitu se jeho přehled vypíše v terminálu (`.githooks/post-commit`).
>
> Poslední aktualizace: **2026-10-30** · Fáze: **0 – Příprava a ujasnění zadání**

---

## 📌 Aktuálně
- **Teď:** doplnit zbytek [`DOTAZNIK.md`](DOTAZNIK.md) (zodpovězeno 1.2, 3.1, 4.1, 5.1, 8.1).
- **Další krok:** založit kostru hry v Phaseru (Fáze 1).
- **Blokuje nás:** nic zásadního – zbytek dotazníku lze doplňovat průběžně.

---

## ✅ Hotovo
- [x] Zpracováno vstupní zadání (brief ChatGPT, Suno prompt, hudba podle levelů) → [`docs/01_vstupni_zadani.md`](docs/01_vstupni_zadani.md)
- [x] Analýza, rozpory, faktická kontrola, návrh ovládání pro děti → [`docs/02_herni_design.md`](docs/02_herni_design.md)
- [x] Dotazník k ujasnění → [`DOTAZNIK.md`](DOTAZNIK.md)
- [x] Git repozitář + hooky pro aktualizaci tohoto souboru
- [x] GitHub CLI přihlášen (účet Programos1)
- [x] Zodpovězeny klíčové otázky: věk 3–5, herní smyčka, bez prohry, Phaser

---

## 🔑 Klíčová rozhodnutí (závazná)
| # | Rozhodnutí | Zdroj |
|---|---|---|
| R1 | Hra pro **malé děti**: klidné tempo, bez stresu, bez násilí | autor |
| R2 | **Nikdy dvě klávesy současně.** Skok jen ze stoje, pevná dráha skoku (nahoru / dopředu) | autor |
| R3 | **Naučná**: ježek je hmyzožravec – z jablka sní jen „červíka“ a jablko vyprskne | autor |
| R4 | 2D ručně malovaný kreslený styl, ne pixel-art; inspirace žánrem, ne kopie hry | autor |
| R5 | Platformy: **prohlížeč** nejdřív, později **Android** telefony a tablety | autor |
| R6 | Prototyp nejdřív se zástupnou grafikou; grafika se dělá později společně, vyměnitelná bez zásahu do kódu | brief |
| R7 | První verze: **přesně 3 levely** (Louka → Les → Skalnaté údolí) | autor + brief |
| R8 | Hudba bez vokálu, každý level vlastní skladba, stejná instrumentace | autor + brief |
| R9 | Verzování na GitHubu – repozitář `hedgehog-and-the-apple`, veřejný, **všechna práva vyhrazena** (LICENSE, © Programos1) | autor |
| R10 | Cílová skupina **3–5 let**: hra bez čtení, velká tlačítka, velmi lehké levely | dotazník 1.2 |
| R11 | Herní smyčka: jablko očuchá **na místě** → červík → sní → vyprskne jablko, roste bříško; do úkrytu nosí **listí na hnízdo** | dotazník 3.1 |
| R12 | **Nikdy neprohraje**: bez srdíček, po nehodě klubíčko + návrat na bezpečné místo | dotazník 4.1 |
| R13 | Technologie: **Phaser 3 + TypeScript + Vite**, Android později přes Capacitor | dotazník 5.1 |

## ❓ Otevřené otázky (detail v DOTAZNIK.md)
- [ ] 1.x Název hry, jazyk, prehistorický styl, referenční screenshot
- [ ] 2.x Detaily ovládání (skok během chůze, ťukací režim)
- [ ] 3.x Zdravá jablka, další potrava, zajímavosti, hlas
- [ ] 4.x Překážky, bonusy, délka levelu
- [ ] 5.x Tiled, testovací zařízení, zkušenosti s programováním
- [ ] 6.x Grafika – nástroje, technika animace
- [ ] 7.x Hudba, licence Suno, zvuky
- [ ] 8.x Cíl hry, Google Play

## ⚠️ Rizika a problémy k vyřešení
| # | Problém | Stav |
|---|---|---|
| P1 | Brief ChatGPT obsahuje ovládání v rozporu s R2 (běh, Space za chůze, klávesa E) | vyřešeno návrhem v design dokumentu, čeká na potvrzení |
| P7 | Veřejný repozitář – ochrana autorských práv, AI grafika a hudba nemusí být chráněné autorským právem | LICENSE „všechna práva vyhrazena“; AI obsah dotvářet ručně kvůli ochraně |
| P2 | Fakta: „červ“ v jablku je housenka obaleče; ježci nenosí jablka na bodlinách; ježci **nedělají zásoby** jídla | vyřešeno herní smyčkou R11 |
| P3 | Godot 4 web export je velký a na mobilních prohlížečích problematický | vyřešeno: Phaser 3 (R13) |
| P4 | AI generovaná grafika – udržet stejnou podobu ježka napříč obrázky | řešit model sheetem, Fáze 3 |
| P5 | Licence hudby ze Suno pro případné vydání | ověřit, dotazník 7.2 |
| P6 | Pravidla Google Play pro dětské aplikace (Families policy) | řešit ve Fázi 5 |

---

## 🗺️ Plán (roadmapa)

### Fáze 0 – Příprava ⏳
- [x] Zpracovat zadání a sepsat dokumenty
- [ ] Vyplnit a zapracovat dotazník
- [x] Přihlásit GitHub CLI
- [x] LICENSE (všechna práva vyhrazena), veřejný repozitář na GitHubu
- [ ] Uložit referenční screenshot do `docs/reference/`

### Fáze 1 – Kostra hry (zástupná grafika)
- [ ] Založit projekt (dle volby technologie), build, spuštění v prohlížeči
- [ ] Jednotná vrstva vstupu: klávesnice + dotyková tlačítka
- [ ] Pohyb ježka: chůze, zastavení, skok nahoru, skok dopředu (jen ze stoje)
- [ ] Kolize s terénem, kamera, parallax pozadí
- [ ] Testovací level

### Fáze 2 – Hratelný prototyp (3 levely)
- [ ] Jablka: sebrání, nesení, doručení do úkrytu
- [ ] Sekvence: objevení housenky → snězení → vyprsknutí jablka
- [ ] Kartičky „Víš, že…?“ (zajímavosti o ježcích)
- [ ] Neškodné překážky, pohyblivé plošiny
- [ ] Level 1 – Slunná louka (tutoriál)
- [ ] Level 2 – Lesní cestička
- [ ] Level 3 – Skalnaté údolí
- [ ] HUD (portrét, jablka, level, pauza), hlavní menu, pauza, dokončení levelu
- [ ] Ukládání postupu (localStorage)
- [ ] Zvukový systém se zástupnými zvuky, hudba po levelech
- [ ] Nasazení do prohlížeče (GitHub Pages) pro testování na tabletu
- [ ] Testování s dítětem 👶

### Fáze 3 – Grafika
- [ ] Model sheet ježka (proporce, barvy, výraz)
- [ ] Animace ježka
- [ ] Objekty (jablko, housenka, listí, kameny, stromy, květiny)
- [ ] Level 1 grafika → Level 2 → Level 3
- [ ] UI grafika
- [ ] Obrazovka „O hře“ s označením autorských práv

### Fáze 4 – Zvuk a hudba
- [ ] Suno prompty pro menu + 3 levely (`docs/03_audio.md`)
- [ ] Vygenerovat a nasadit hudbu (smyčky)
- [ ] Zvukové efekty
- [ ] (volitelně) namluvení zajímavostí

### Fáze 5 – Android a vydání
- [ ] PWA (instalace z prohlížeče, offline)
- [ ] Android build (Capacitor) a test na telefonu/tabletu
- [ ] Fakta ověřena člověkem
- [ ] Rozhodnutí o Google Play

---

## 📝 Historie změn tohoto souboru
| Datum | Změna |
|---|---|
| 2026-10-30 | Založení projektu, zpracování zadání, dotazník |
| 2026-10-30 | .gitattributes – LF konce řádků (hooky fungují i po klonování na Windows) |
| 2026-10-30 | Zapsány odpovědi 1.2, 3.1, 4.1, 5.1, 8.1 (rozhodnutí R10–R13), GitHub přihlášen |
| 2026-10-30 | LICENSE – všechna práva vyhrazena; repozitář zveřejněn na GitHubu |
