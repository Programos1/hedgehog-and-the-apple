# Pravidla projektu – Ježek a jablíčko

Naučná 2D skákačka pro **malé děti**: ježek najde jablko, sní z něj jen „červíka“ (housenku) a jablko vyprskne.
Dokumentace a komunikace česky, komentáře v kódu anglicky.

## Závazná pravidla
- **Hra je pro malé děti.** Klidné tempo, žádný stres, časový limit ani násilí.
- **Nikdy nevyžadovat dvě klávesy / dvě tlačítka současně.** Skok jen ze stoje, pevná dráha (skok nahoru / skok dopředu). Každá akce = jedno tlačítko. Dotykové ovládání je rovnocenné klávesnici.
- **Naučný obsah musí být fakticky správný** (viz `docs/02_herni_design.md` §4). Žádné mýty jako fakta.
- Cílové platformy: **prohlížeč**, později **Android** (telefon, tablet, na šířku).
- Grafika a zvuk musí jít vyměnit bez zásahu do herní logiky.

## Dokumenty
- `STAV_PROJEKTU.md` – živý stav (hotovo / rozhodnutí / otevřené otázky / rizika / roadmapa).
- `DOTAZNIK.md` – otázky pro autora a jeho odpovědi.
- `docs/01_vstupni_zadani.md` – archiv původního zadání (neupravovat).
- `docs/02_herni_design.md` – platný herní design.

## Workflow commitů
- **Před každým commitem aktualizovat `STAV_PROJEKTU.md`** (Aktuálně, Hotovo, otázky, rizika, datum, historie změn). Hook `.githooks/pre-commit` commit bez něj zablokuje.
- Po commitu hook `.githooks/post-commit` vypíše přehled stavu; v odpovědi autorovi vždy stručně shrnout, co je hotovo a co je další krok.
- Po klonování: `git config core.hooksPath .githooks`
