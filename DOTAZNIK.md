# 📋 Dotazník – ujasnění zadání

**Jak vyplnit:** ke každé otázce napiš odpověď za `➡️ Odpověď:`. Stačí „souhlasím s doporučením“ nebo jen písmeno varianty.
Pokud nevíš, nech prázdné – použiju doporučení (⭐).

---

## 1. Základ

### 1.1 Název hry
Brief používá *Hedgehog & The Apple*. Hra bude primárně česky?
- ⭐ **Doporučení:** český název **„Ježek a jablíčko“** (pracovně), anglický *Hedgehog & The Apple*. Krátký název se líp hledá na Google Play. Alternativy: „Ježkova podzimní cesta“, „Ježek Bodlinka“.

➡️ Odpověď:

### 1.2 Pro jak staré děti?
Ovlivňuje obtížnost, množství textu a velikost tlačítek.
- a) 3–5 let (neumí číst, učí se ovládat zařízení)
- b) 5–8 let (začínají číst)
- c) 3–8 let s nastavitelnou obtížností
- ⭐ **Doporučení:** **c)** – cílová skupina 4–7 let, hra **bez nutnosti číst** (ikony, obrázky, namluvený hlas). Volitelně „Lehký / Normální“ režim pro rodiče.

➡️ Odpověď: ✅ **3–5 let** (neumí číst, učí se ovládat zařízení).

### 1.3 Jazyk
- ⭐ **Doporučení:** čeština od začátku, ale texty v samostatném souboru, aby šla snadno přidat angličtina (větší publikum na Google Play).

➡️ Odpověď:

### 1.4 Referenční screenshot od ChatGPT
Zatím ho nemám. Ulož ho prosím do `docs/reference/` (např. `screenshot_chatgpt.png`) – podívám se na něj a popíšu styl do design dokumentu.

➡️ Odpověď / hotovo:

### 1.5 „Prehistorický“ styl – co přesně z Prehistoriku chceš?
- a) jen **herní žánr a pocit** (boční skákačka, barevné pozadí, sbírání věcí), prostředí normální příroda
- b) i **pravěké prostředí** (kapradiny, obří přesličky, sopky v dálce, skalní kresby…)
- c) mix: příroda s „pradávným“ nádechem (staré balvany, obří stromy)
- ⭐ **Doporučení:** **a/c** – naučná hra o ježkovi by měla ukazovat **skutečné prostředí, kde ježek žije** (zahrada, louka, les). Pravěk (dinosauři, sopky) by fakta mátl. „Pradávný“ nádech může dát skalnaté údolí v levelu 3.

➡️ Odpověď:

---

## 2. Ovládání

### 2.1 Navržené rozložení – souhlasíš?
| Akce | Klávesnice | Dotyk |
|---|---|---|
| Doleva / doprava | `←` `→` (i `A` `D`) | 2 velká tlačítka vlevo |
| Skok nahoru | `↑` (i `W`) | tlačítko vpravo |
| Skok dopředu | `Mezerník` | tlačítko vpravo |
| Pauza | `Esc` | ikona v rohu |

Sbírání a doručení jablek automaticky (bez klávesy E). Nikdy dvě klávesy naráz.
- ⭐ **Doporučení:** ano, takto. Na dotyku mít tlačítka **s obrázky** (šipka nahoru s obloučkem, šipka šikmo), ne s textem.

➡️ Odpověď:

### 2.2 Co když dítě zmáčkne skok, když ježek ještě jde?
- a) ignorovat – musí nejdřív pustit šipku (striktní, učí pořadí)
- b) ježek se **sám plynule zastaví** a pak skočí (shovívavé)
- ⭐ **Doporučení:** **b)** – malé dítě často drží šipku a zároveň mačká jiné tlačítko. Výsledek je pořád „skok ze stoje“, ale dítě není potrestané.

➡️ Odpověď:

### 2.3 Běh
Brief chce animaci „běh“. Běh by potřeboval další tlačítko nebo držení, a zrychluje tempo.
- ⭐ **Doporučení:** **bez běhu.** Jen klidná chůze.

➡️ Odpověď:

### 2.4 Ťukací režim pro nejmenší (později)
Dítě ťukne na místo v levelu a ježek tam sám dojde (skoky se zvýrazní jako „šipky“, na které se ťukne).
- ⭐ **Doporučení:** **ano, ale až po prototypu** (Fáze 2+). Architekturu vstupu na to připravím hned.

➡️ Odpověď:

### 2.5 Skok – jak vysoko/daleko?
- ⭐ **Doporučení:** jeden pevný skok nahoru (cca 1,5× výška ježka) a jeden pevný skok dopředu (cca 3× délka ježka). Žádné „podle délky stisku“. Levely navrhneme na tyto rozměry.

➡️ Odpověď:

---

## 3. Herní smyčka a naučnost ⚠️ důležité

### 3.1 Co ježek nosí do úkrytu a kdy najde „červíka“?
Fakta (viz `docs/02_herni_design.md` §4): ježci si **neukládají zásoby jídla** (návrh ChatGPT „sběratel zásob na zimu“ je mýtus), a jablka na bodlinách **nenosí** (známý mýtus). Před zimou se **vykrmují** a **staví hnízdo z listí**.

- a) **Původní nápad:** ježek nese jablko do úkrytu → tam objeví červíka → sní → jablko vyprskne. (Jednoduché, jasný cíl, ale fakticky „proč nosí jablka domů?“)
- b) **Vykrmování:** ježek jablko najde → **na místě** ho očuchá, objeví červíka, sní, jablko vyprskne → **ukazatel bříška** roste. Do úkrytu z listí jde až na konci, když je „vykrmený na zimu“.
- c) **Kombinace:** jako b), plus ježek po cestě sbírá **listí na hnízdo** (nese ho do úkrytu). Dva jednoduché cíle: najíst se + postavit hnízdo.
- ⭐ **Doporučení:** **c)** (případně b) pro první prototyp). Je to pravdivé, pořád obsahuje tvoji hlavní pointu (sní jen červíka, jablko vyprskne), a nošení listí dává smysl úkrytu. Mýtus o jablkách na bodlinách využijeme jako vtipnou zajímavost: ježek se pokusí jablko napíchnout na bodliny a… nejde to. 😄

➡️ Odpověď: ✅ **c)** jíst na místě (očuchá → červík → sní → vyprskne jablko, roste bříško) + nosí **listí na hnízdo** do úkrytu.

### 3.2 Kolik věcí může ježek nést najednou?
- ⭐ **Doporučení:** **jednu** (v tlamičce). Jednoduché, nutí k cestám tam a zpět jen v malém levelu. Případně nošení úplně vypustit, pokud zvolíš 3.1 b).

➡️ Odpověď:

### 3.3 Je ve **všech** jablkách červík?
- a) ano, ve všech
- b) ne – některá jsou zdravá; ježek očuchá, nic nenajde, nechá je ležet („ježek jablka nejí“)
- ⭐ **Doporučení:** **b)** od levelu 2. Učí to, že ježek hledá hmyz, ne ovoce. V levelu 1 všechna s červíkem.

➡️ Odpověď:

### 3.4 Jiná potrava než jablka?
Ve skutečnosti ježek jí hlavně brouky, žížaly, housenky, slimáky.
- ⭐ **Doporučení:** ano, v levelu 2–3 přidat **brouky pod listím / kameny** a **žížaly po dešti**. Rozšíří to naučnost a nestane se z toho „hra o jablkách“.

➡️ Odpověď:

### 3.5 Zajímavosti „Víš, že…?“
- a) kartička po každém snědeném červíkovi
- b) jedna kartička na konci levelu
- c) sbírka kartiček (album), které dítě odemyká
- ⭐ **Doporučení:** **b + c** – nerušit hraní, na konci levelu jedna zajímavost s obrázkem a **namluveným** textem, ukládá se do „Ježkova alba“. Fakta před vydáním ověří člověk.

➡️ Odpověď:

### 3.6 Kdo namluví texty?
- ⭐ **Doporučení:** pro prototyp bez hlasu (jen text + obrázek). Později namluvit vlastním hlasem / dítětem, nebo AI hlasem. Pro 3–5leté je hlas zásadní.

➡️ Odpověď:

---

## 4. Obtížnost a překážky

### 4.1 Životy a „game over“
Brief chce srdíčka a zranění.
- a) srdíčka, po ztrátě všech restart levelu
- b) **žádné prohry**: po „nehodě“ se ježek objeví na posledním bezpečném místě, nic se neztratí
- ⭐ **Doporučení:** **b)**. Srdíčka z HUD vynechat. Malé dítě nemá být trestáno. Místo „zranění“ animace svinutí do klubíčka (naučné – tak se ježek brání).

➡️ Odpověď: ✅ **b)** nikdy neprohraje – svine se do klubíčka a objeví se na posledním bezpečném místě, bez srdíček.

### 4.2 Překážky a zvířata
- ⭐ **Doporučení:** jen **neškodné** překážky: louže/potok (cákne a vrátí se), padající šiška (svine se do klubíčka), trnité ostružiní (nedá se projít, nutno přeskočit). Zvířata jen jako přátelská kulisa (ptáček, motýl, spící liška). **Žádní nepřátelé.**

➡️ Odpověď:

### 4.3 Časový limit, skóre, hvězdičky?
- ⭐ **Doporučení:** bez časového limitu a bez skóre. Volitelně 1–3 „bonusové“ věci schované v levelu (např. zlatý brouk) pro starší děti, co rády prozkoumávají.

➡️ Odpověď:

### 4.4 Délka levelu
- ⭐ **Doporučení:** 2–4 minuty pro dítě. Krátké levely = pocit úspěchu, a hodí se i na „jen chvilku na tabletu“.

➡️ Odpověď:

---

## 5. Technologie

### 5.1 Herní engine
Brief doporučuje Godot. Ty chceš **prohlížeč + Android**.
- a) **Phaser 3 + TypeScript** (web-first; Android přes Capacitor; hostování zdarma na GitHub Pages)
- b) **Godot 4** (silný editor; ale web export ~30–40 MB, pomalé načítání, potíže na mobilních prohlížečích)
- ⭐ **Doporučení:** **a) Phaser 3 + TypeScript + Vite.** Hra se načte za pár sekund i na tabletu, testovat budeš jen otevřením odkazu, a z téhož kódu uděláme Android aplikaci. Na tuhle hru (2D, jednoduchá fyzika) je Phaser ideální.

➡️ Odpověď: ✅ **a) Phaser 3 + TypeScript.**

### 5.2 Editor levelů
- ⭐ **Doporučení:** **Tiled** (zdarma, tiled.org) – levely kreslíš myší, hra je načte. Můžeš pak sám upravovat levely bez programování.

➡️ Odpověď:

### 5.3 Na čem budeš testovat?
Pomůže znát konkrétní zařízení (model tabletu/telefonu, verze Androidu) – zvolím rozlišení a výkon.

➡️ Odpověď:

### 5.4 Tvoje zkušenosti s programováním
Ať vím, jak podrobně psát návody (README, jak spustit, jak měnit levely/grafiku).

➡️ Odpověď:

---

## 6. Grafika

### 6.1 Čím budeme grafiku generovat?
(ChatGPT/DALL·E, Midjourney, Leonardo, Stable Diffusion, ručně…?)
- ⭐ **Doporučení:** nástroj, který umí držet **konzistentní postavu** (reference image / character reference). Postup: nejdřív **model sheet ježka** (bok, předek, záda, výrazy, paleta) → z něj vše ostatní. Pozadí generovat po vrstvách (nebe, hory, stromy, popředí) kvůli parallaxu.

➡️ Odpověď:

### 6.2 Technika animace
- a) **snímková animace** (každý snímek obrázek, sprite sheet) – nejvěrnější, ale AI generátory mají potíž udržet snímky konzistentní
- b) **„cut-out“ animace** (ježek složený z dílů – tělo, hlava, nožičky, oči; animují se díly) – stačí nakreslit jednou, animace plynulé a levné
- ⭐ **Doporučení:** **b)** pro ježka (hodí se k AI grafice – vygenerujeme jednou díly), a) pro drobné efekty (housenka, vyprsknutí). Rozhodnout můžeme až ve Fázi 3, prototyp to neblokuje.

➡️ Odpověď:

### 6.3 Podoba ježka – máš představu?
(Jméno postavičky? Barva? Oblečení/šátek, nebo přírodní vzhled? Kluk/holka/neurčeno?)
- ⭐ **Doporučení:** přírodní vzhled (bez oblečení – je to naučná hra), velké oči, výrazné **jméno** (děti si postavu oblíbí rychleji), např. *Bodlinka*, *Pícháček*, *Ježurka*.

➡️ Odpověď:

---

## 7. Hudba a zvuk

### 7.1 Kolik skladeb?
- ⭐ **Doporučení:** 4 – menu + 3 levely, plus krátký „jingle“ na dokončení levelu. Prompty pro Suno připravím zvlášť pro každou (podle tabulky z ChatGPT), se stejným základem instrumentace.

➡️ Odpověď:

### 7.2 Licence Suno
Pro případné vydání (Google Play) je potřeba, aby hudba byla generovaná na **placeném** plánu Suno (free plán nepovoluje komerční využití – ověř aktuální podmínky).
- Máš placený Suno? Plánuješ hru někdy zpoplatnit / vydat?

➡️ Odpověď:

### 7.3 Zvukové efekty
- ⭐ **Doporučení:** pro prototyp zdarma z **Kenney.nl** / **freesound.org (CC0)**; vtipné „mňam“ a „pfft“ (vyprsknutí) klidně nahrát vlastní pusou – bude to roztomilejší. 😊

➡️ Odpověď:

---

## 8. Vydání a spolupráce

### 8.1 GitHub
- Název repozitáře? Veřejný nebo soukromý?
- ⭐ **Doporučení:** repozitář `jezek` (nebo `jezek-a-jablicko`), zatím **soukromý**. Pro testování v prohlížeči/tabletu nasadíme na GitHub Pages (pro soukromé repo vyžaduje GitHub Pro, jinak alternativně Netlify/Cloudflare Pages zdarma).
- Propojení: spusť v terminálu `! gh auth login` a pak mi dej vědět.

➡️ Odpověď: ✅ repozitář **`hedgehog-and-the-apple`**, **veřejný** (účet Programos1), testovací verze přes GitHub Pages.

### 8.2 Cíl hry
- a) pro vlastní děti / rodinu
- b) zdarma pro veřejnost (web, Google Play)
- c) placená / s reklamami
- ⭐ **Doporučení:** **a → b**. Pokud někdy Google Play, tak **zdarma bez reklam a bez sledování** – u dětských aplikací to výrazně zjednoduší pravidla (Google Play Families, GDPR pro děti).

➡️ Odpověď:

### 8.3 Co dalšího po 3 levelech?
(Jen pro představu, nic se tím teď neblokuje.)
- ⭐ **Nápady:** noční level (ježek je noční zvíře – světlušky, sova), podzimní level se stavbou hnízda a usnutím na zimu jako „finále“, zahrada s člověkem, který nechá ježkovi hromadu listí (učí děti, jak ježkům pomoct).

➡️ Odpověď:

---

**Až dotazník vyplníš, napiš mi „dotazník hotový“** – zapracuju odpovědi do `docs/02_herni_design.md` a `STAV_PROJEKTU.md` a navrhnu první krok vývoje.
