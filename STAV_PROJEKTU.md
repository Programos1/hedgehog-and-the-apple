# 🦔 STAV PROJEKTU – Nibbles' Little Adventure

> **Živý dokument.** Aktualizuje se s každým commitem (hlídá to git hook `.githooks/pre-commit`)
> a po každém commitu se jeho přehled vypíše v terminálu (`.githooks/post-commit`).
>
> Poslední aktualizace: **2026-10-31** · Fáze: **3 – Grafika** (prototyp hotový, 4 levely)

---

## 📌 Aktuálně
- **Kde jsme skončili (2026-10-31):** hratelné 4 levely – Louka, Les, Skalnaté údolí a nový **Level 4 „Údolí vodopádů“** postavený ze stavebnice kusů autorovy malby (ostrůvky, skály, úkryt, pozadí s vodopády). Ježek Nibbles a jablko z autorovy grafiky, hudba (6 skladeb ve smyčce). Online: https://programos1.github.io/hedgehog-and-the-apple/
- **Úkol pro autora:** 🎯 #1 – zahrát si Level 4 a rozhodnout, jestli „stavebnice z malby“ je ten správný směr pro další levely.
- **Další krok (Claude):** podle odpovědi – buď další levely ze stavebnice (a převést Level 1–3 do stejného stylu), nebo jiný přístup; pak housenka.
- **Blokuje nás:** nic. Ostřejší grafika potřebuje kusy ve vyšším rozlišení (úkol #3).

---

## 🎯 Fronta úkolů pro autora (podle priority, dávkuje se po jednom)
| # | Úkol | Proč teď | Stav |
|---|---|---|---|
| 1 | Zahrát Level 4 „Údolí vodopádů“ – sedí směr „stavebnice z malby“? | rozhoduje, jak dělat všechny další levely | ▶️ zadáno |
| 2 | Housenka ve stylu Nibblese (prompt: zelená housenka z boku, hlava vpravo, stejný styl a obrys, světlé pozadí, ≥ 300 px) | hlavní naučný prvek, je zatím kreslená kódem | čeká |
| 3 | Kusy stavebnice ve vyšším rozlišení, každý zvlášť na jednobarevném pozadí: pozadí po vrstvách (obloha+hory, údolí), 2–3 ostrůvky, skála, úkryt | Level 4 je ze screenshotu 974 px → měkký | čeká |
| 4 | Vyzkoušet hru na tabletu/telefonu s dítětem, poslat model zařízení a postřehy | ovládání a výkon na skutečném zařízení | čeká |
| 5 | Zbylé objekty: listy, šiška, cedulka | stylová jednota | čeká |
| 6 | Nahrát vlastní „mňam“ a „pfft“ (mobil stačí) | zvukové efekty jsou zatím pípání | čeká |
| 7 | Ověřit licenci hudby ze Suno (placený plán?) – dotazník 7.2 | nutné před vydáním | čeká |
| ✅ | Hudba, grafika ježka, jablko, referenční scéna, zpětná vazba k levelům | | hotovo |

## 🧩 Co ve hře ještě chybí (přehled)
- **Grafika:** housenka, listy, šiška, cedulky, UI tlačítka a kartičky „Víš, že…?“ jsou zatím kreslené kódem; Level 1–3 mají zástupná pozadí a dlaždice (nesedí ke stylu Levelu 4).
- **Zvuk:** zvukové efekty jsou syntetické pípání.
- **Obsah:** zajímavosti jen 3, bez namluvení; fakta neověřená člověkem.
- **Testování:** hra nebyla vyzkoušena na skutečném tabletu/telefonu ani s dítětem.
- **Vydání:** PWA (instalace, offline), Android (Capacitor), licence hudby, pravidla Google Play.

---

## ✅ Hotovo
- [x] Zpracováno vstupní zadání → [`docs/01_vstupni_zadani.md`](docs/01_vstupni_zadani.md)
- [x] Analýza, faktická kontrola, ovládání pro děti → [`docs/02_herni_design.md`](docs/02_herni_design.md)
- [x] Dotazník → [`DOTAZNIK.md`](DOTAZNIK.md) (klíčové otázky zodpovězeny)
- [x] Git + hooky, GitHub repozitář, LICENSE (© Tomáš Horák, všechna práva vyhrazena)
- [x] **Hratelný prototyp** (Phaser 4 + TypeScript + Vite), všechny 3 levely automaticky dohrány v Chromu
- [x] Automatické nasazení na GitHub Pages při každém pushi
- [x] Prompty pro Suno pro menu + 3 levely → [`docs/03_audio.md`](docs/03_audio.md)
- [x] Návod na výměnu grafiky a zvuků → [`docs/ASSETS.md`](docs/ASSETS.md)
- [x] Snímky obrazovky prototypu → [`docs/screenshots/`](docs/screenshots/)
- [x] **Ježek Nibbles z autorovy grafiky** – animace stání, chůze, skoku, dopadu, čuchání, jedení, vyprsknutí, zásahu, oslavy (`npm run sprites`)
- [x] Listí po cestě, víc listů najednou, úkryt vždy na konci levelu
- [x] Nápověda ve 3 stupních: šipka na okraji → jiskřičky + záře u přehlédnuté věci
- [x] Jablko z autorovy grafiky + automaticky nakousnutá verze (`npm run apple`)
- [x] **Malované levely**: pozadí = jeden obrázek, povrchy z modrého označení (`tools/trace-level.mjs`), testovací „Malovaná scéna“ v menu
- [x] Pád do propasti = návrat na bezpečné místo; skok dopředu má vyšší oblouk (150 px)
- [x] **Hudba**: 6 skladeb autora jako jeden playlist ve smyčce pro menu i hru, streamováno, funkční ztlumení
- [x] ~~Malovaná scéna~~ zrušena (autor: „není dobrá“) → nahrazena **Level 4 „Údolí vodopádů“** postaveným ze stavebnice kusů vyříznutých z autorovy malby (`npm run kit:valley`)

---

## 🔑 Klíčová rozhodnutí (závazná)
| # | Rozhodnutí | Zdroj |
|---|---|---|
| R1 | Hra pro **malé děti**: klidné tempo, bez stresu, bez násilí | autor |
| R2 | **Nikdy dvě klávesy současně.** Skok jen ze stoje, pevná dráha skoku (nahoru / dopředu) | autor |
| R3 | **Naučná**: ježek je hmyzožravec – z jablka sní jen „červíka“ a jablko vyprskne | autor |
| R4 | 2D ručně malovaný kreslený styl, ne pixel-art; inspirace žánrem, ne kopie hry | autor |
| R5 | Platformy: **prohlížeč** nejdřív, později **Android** telefony a tablety | autor |
| R6 | Prototyp nejdřív se zástupnou grafikou; grafika vyměnitelná bez zásahu do kódu (`src/assets/manifest.ts`) | brief |
| R7 | První verze: **přesně 3 levely** (Louka → Les → Skalnaté údolí) | autor + brief |
| R8 | Hudba bez vokálu, každý level vlastní skladba, stejná instrumentace | autor + brief |
| R9 | GitHub `Programos1/hedgehog-and-the-apple`, veřejný, **© 2026 Tomáš Horák, všechna práva vyhrazena** | autor |
| R10 | Cílová skupina **3–5 let**: hra bez čtení, velká tlačítka, velmi lehké levely | dotazník 1.2 |
| R11 | Herní smyčka: jablko očuchá **na místě** → housenka → sní → vyprskne jablko; do úkrytu nosí **listí na hnízdo** | dotazník 3.1 |
| R12 | **Nikdy neprohraje**: bez srdíček; voda = návrat na bezpečné místo, šiška = svinutí do klubíčka | dotazník 4.1 |
| R14 | Název hry: **Nibbles' Little Adventure**, ježek se jmenuje **Nibbles** | autor |
| R13 | Technologie: **Phaser 4 + TypeScript + Vite** (Phaser 4 je aktuální verze), Android později přes Capacitor | dotazník 5.1 |

**Předběžně podle doporučení** (autor neodpověděl, lze změnit): skok za chůze → ježek sám zastaví (2.2), bez běhu (2.3), zdravá jablka od levelu 2 (3.3), kartička na konci levelu (3.5), zatím bez hlasu (3.6), reálná příroda místo pravěku (1.5).

## ❓ Otevřené otázky (detail v DOTAZNIK.md)
- [ ] 1.x Jazyk hry (název je anglický, texty zatím česky), referenční screenshot
- [ ] 2.4 Ťukací režim pro nejmenší (později)
- [ ] 3.4 Další potrava (brouci, žížaly) v levelech 2–3
- [ ] 5.x Tiled editor, testovací zařízení, zkušenosti s programováním
- [ ] 6.x Grafika – nástroj, technika animace, podoba Nibblese
- [ ] 7.x Hudba – licence Suno, zvukové efekty
- [ ] 8.x Cíl hry, Google Play

## ⚠️ Rizika a problémy k vyřešení
| # | Problém | Stav |
|---|---|---|
| P1 | Brief ChatGPT obsahuje ovládání v rozporu s R2 | vyřešeno v prototypu |
| P2 | Fakta: „červ“ = housenka; ježci nenosí jablka na bodlinách; nedělají zásoby | vyřešeno (R11, kartičky) |
| P3 | Godot web export velký | vyřešeno: Phaser |
| P4 | AI grafika – udržet stejnou podobu ježka napříč obrázky | řešit model sheetem, Fáze 3 |
| P5 | Licence hudby ze Suno pro vydání | ověřit, dotazník 7.2 |
| P6 | Pravidla Google Play pro dětské aplikace | Fáze 5 |
| P7 | AI grafika/hudba nemusí být chráněná autorským právem | AI výstupy ručně dotvářet |
| P8 | Při velmi nízkém FPS (slabé zařízení) se hra zpomalí (nezrychlí/neprojde zdí) | ověřit na skutečném tabletu |
| P9 | Ježek z listu je malý (~110 px), na velkém tabletu může být lehce rozmazaný | později list ve vyšším rozlišení |
| P12 | Kusy stavebnice (Level 4) jsou z malého screenshotu (974 px) → zvětšené 1,8–5×, pozadí měkké | dodat kusy ve vyšším rozlišení (každý zvlášť) |
| P11 | Objekty a pozadí jsou zatím kreslené kódem, stylově nesedí k ježkovi | úkol #1 pro autora |
| P10 | Zvukové efekty jsou zatím syntetické pípnutí | Fáze 4 |

---

## 🗺️ Plán (roadmapa)

### Fáze 0 – Příprava ✅
- [x] Zpracovat zadání a sepsat dokumenty
- [x] Zodpovědět klíčové otázky dotazníku
- [x] GitHub repozitář, LICENSE
- [x] Uložit referenční screenshot do `docs/reference/`

### Fáze 1 – Kostra hry ✅
- [x] Phaser 4 + TypeScript + Vite, build, spuštění v prohlížeči
- [x] Jednotná vrstva vstupu: klávesnice + dotyková tlačítka (jedno tlačítko = jedna akce)
- [x] Pohyb ježka: chůze, automatické zastavení, skok nahoru, skok dopředu
- [x] Kolize, jednosměrné plošiny, kamera, 4 vrstvy parallaxu

### Fáze 2 – Hratelný prototyp ⏳
- [x] Očuchání jablka → housenka → snězení → vyprsknutí; zdravá jablka
- [x] Listí na zádech → úkryt, hnízdo roste
- [x] Kartičky „Víš, že…?“ (3 zajímavosti)
- [x] Voda (návrat na bezpečné místo), padající šišky (klubíčko), pohyblivé plošiny (vor, výtah)
- [x] Level 1 – Slunná louka (s cedulkami-nápovědou), Level 2 – Lesní cestička, Level 3 – Skalnaté údolí
- [x] HUD bez čísel (housenky + listy), menu se zámky, pauza, konec levelu
- [x] Ukládání postupu a ztlumení zvuku (localStorage)
- [x] Zvukový systém (syntetické zástupné zvuky, připravené na hudbu)
- [x] Šipka k nejbližšímu cíli pro nejmenší
- [x] GitHub Pages nasazení
- [ ] Test na skutečném tabletu / telefonu
- [ ] Testování s dítětem 👶 a úprava obtížnosti podle něj

### Fáze 3 – Grafika
- [x] Model sheet Nibblese (autorův referenční list)
- [x] Animace ježka z listu (stání, chůze, skok, dopad, čuchání, jedení, vyprsknutí, zásah, oslava)
- [ ] Ježek ve vyšším rozlišení (list s postavou ≥ 250 px) pro ostrost na tabletu
- [ ] Objekty: ~~jablko~~ ✅, housenka, listí, úkryt, šiška, cedulka
- [ ] Level 1 grafika → Level 2 → Level 3
- [ ] UI grafika, obrazovka „O hře“ s autorskými právy
- [ ] Písmo (zaoblené, s českou diakritikou)

### Fáze 4 – Zvuk a hudba
- [x] Suno prompty pro menu + 3 levely
- [x] Hudba nasazena (6 skladeb, playlist ve smyčce)
- [ ] Zvukové efekty (vlastní „mňam“ a „pfft“)
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
| 2026-10-30 | Autor v licenci: Tomáš Horák. Hratelný prototyp se 3 levely, GitHub Pages, Suno prompty, docs |
| 2026-10-30 | Název hry „Nibbles' Little Adventure“, fronta úkolů pro autora |
| 2026-10-30 | Nibbles z autorovy grafiky (atlas + animace), listí po cestě / úkryt na konci, nápověda ve 3 stupních |
| 2026-10-30 | Jablko z autorovy grafiky (vyříznuté z výřezu screenshotu), nakousnutá verze generovaná nástrojem |
| 2026-10-30 | Malované levely (trace-level), testovací scéna, složka na hudbu, vyšší skok dopředu |
| 2026-10-30 | Hudba: 6 skladeb jako společný playlist ve smyčce, oprava ztlumení |
| 2026-10-31 | Malovaná scéna zobrazena celá (zpětná vazba: „příliš přiblížené“) |
| 2026-10-31 | Malovaná scéna zrušena, nový Level 4 „Údolí vodopádů“ ze stavebnice kusů autorovy malby |
| 2026-10-31 | Zrychlená animace jedení jablka (~3,6 s → ~2 s) |
| 2026-10-31 | Level 4: skály jako jeden souvislý obrázek (bez schodů, děr a opakovaného vzoru) |
| 2026-10-31 | Konec dne: shrnutí kde jsme skončili, aktualizovaná fronta a přehled co chybí |
