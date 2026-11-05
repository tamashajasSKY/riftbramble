# RiftBramble – átadás Codex / GitHub számára

Állapot: **1.6.1**, 2026. november 5. Tulajdonos: Tamás Hajas (Kardhal).
Projektkörnyezet: „Android appok”. Korábbi nevek: Forintvédő → Riftward → RiftBramble.
A másik Codex nem látja automatikusan a ChatGPT Work beszélgetéseit és fájljait.
Ez a csomag önmagában tartalmazza a továbbfejlesztéshez szükséges játékforrást és kontextust.

## Azonnali feladat a fogadó Codexnek

A csomag `RiftBramble-1.6.1/` könyvtárának tartalmát emeld be a csatolt
`riftbramble` repository gyökerébe. Előbb olvasd el az AGENTS.md-t és nézd át a
meglévő repositoryt; a felhasználó meglévő munkáját őrizd meg. A ZIP ne egyetlen
bináris fájlként kerüljön gitbe, hanem a kibontott forrásfájlok kerüljenek be.
A `.gitignore` és `.gitattributes` is a csomag része. Kövesd a csatolt repo
engedélyezett branch/PR munkafolyamatát; nem szükséges új repositoryt létrehozni.

A frissített UI már meg van valósítva. Ellenőrizd a változásokat és futtasd a
BUILDING.md szerinti teszteket, majd készíts commitot és a felhasználó által kért
GitHub-feltöltést. Kulcsot vagy jelszót ne commitolj. Ez az átadási csomag
önmagában nem igazolja, hogy a GitHub-feltöltés megtörtént.

## Kötelező folytonosság

- Android applicationId: `hu.forintvedo.survival`. A névváltás miatt ezt tilos átírni.
- Eredeti aláírókulcs: külön privát mentésben. A forrás ZIP nem tartalmaz kulcsot.
  Frissítő APK-t csak ezzel készíts; a kulcs hiányát a build világosan jelzi.
- Verziókód 10, verziónév 1.6.1. Régi rekordok, valuták, feloldások és futamok megmaradnak.
- Magyar felület; Android 7.0+, offline alapkiadás; reklám és fiókkényszer nélkül.
- A felhasználó a kész, telepíthető APK-t és a teljes forrást kéri minden kiadásnál.
- Ne állíts fizikai androidos tesztet: eddig ilyen nem történt.

## Elfogadott játék és szabályok

**Ostrom / dungeon:** top-down, automatikus támadás, mozgás, dash, négy kaszt
(Warrior, Mage, Ranger, Necromancer) és külön aktiválható kasztskill. Végtelen
hullámok, illetve opcionális 15 hullámos expedíció sárkányfináléval. Fejlesztésnél
három rögzített méretű kártya; a hosszú szöveg a kártyán belül görgethető.
Pályafeladatok: hasadékbezárás, karavánkísérés, rúnakővédelem. Önkéntes tövisoltár:
két következő hullám felezett gyógyításáért garantált ritka/epikus lap.

Skill-evolúciók: Fagygyűrű 3 + Jéglándzsa 3 → Szilánkvihar;
Lángmező 3 + Meteor 3 → Parázsüstökös; Láncvillám 3 + Rúnarobbanás 3 → Viharszív.
Az ellenfelek a teljes pályán jelenhetnek meg biztonsági távolsággal. Látómezőn
kívülről támadhatnak, pályán kívülről nem. A nehézség hullám elején, korlátosan
igazodik az erőhöz; hullám közben nem semlegesíti az új fejlesztés előnyét.

**Űrjárat:** automatikus lövés, oldalirányú mozgás, aktiválható pajzs;
vadász, drónhordozó és cirkáló; ezektől független skinek. Szektor után modul és
útvonal választás; mentőkapszulák, konvojvédelem, aszteroidák, elit flotta.
Boss: külön kilőhető generátor, két löveg és hajtómű. Saját zene és buffok.

**Hasadékkrónikák:** négy kaszt, 34 lap, 10 lapos kezdőpakli, 5 lap húzás és
3 energia körönként. Előre látható ellenfél-szándékok; lapkijátszás külön
gombbal, kijelölt célpontra. Dobó-/húzópakli, időzített hatások, három lapból
választható vagy kihagyható jutalom, kereskedő, ritkítás, pihenő és események.
Nyolc állomás, boss, öt feloldható nehézség. A pet itt fix szerepbónuszt ad,
az Ostrom petszintje nem növeli a kártyák erejét.

Közös gyöngytár és bossokkal/krónikagyőzelemmel feloldható emlékgyűjtemény;
a módok önállóan játszhatók. A forint nem váltható gyöngyre. A gyöngy ritka.
Hétnapos belépési ajándék budapesti napváltással, kihagyás miatti nullázás nélkül.

## Grafika és UI: mit kért kifejezetten a felhasználó?

- A mobok elfogadottak. A varázsló varázsoljon, a páncélos közelharcoljon.
- A hősök és petek részletes, eltérő figurák legyenek, ne egyszerű újraszínezések.
  A korábbi túl egyszerű hősgrafikákat elutasította. A peteket is visszajavítottuk.
- Az Ősi holló valódi holló: a korábbi borzszerű grafika hibás volt; javítva.
- A boltban és a pályán azonos figura jelenjen meg, a névvel összhangban.
- A saját lövedék, ellenséges lövedék, pénz és gyöngy alakban/színben is különüljön el.
- A skillikonok a hatásukat ábrázolják; leírásuk mindenhol koppintható.
  Az információ ne vásároljon, és ne aktiváljon skillt. Játék közben szüneteltessen.
- A petek futamon belüli ágai és a külső kötelék maximuma 10; az aktuális és
  következő fejlesztés valódi számszerű hatása látható. A kasztok balanszára figyelj.
- Kis, rögzített Főmenü gomb bal felül a hosszú képernyőkön.
- Rejtett Andris-tűzijáték: Súgó → „Összetartás” öt koppintás.

## A mostani kérés és az 1.6.1 megoldása

A végtelen Ostrom UI-ja túl sokat takart. A felső sáv most kompakt;
a skillek, a pet és az ideiglenes buffok egy sorban, oldalra görgethető ikonként jelennek meg
szintjelzéssel, továbbra is leírással. A hullámnév/hősszint/ostromerő/összeállítás
a felső `i` gombbal nyílik meg, szünet közben. A mellékfeladat rövid gombja a
felső sorban van; részletes szövege az interakcióban elérhető.
Kisebb alsó minimap, dash és kasztskill; az ikonok érintőfelülete legalább 44 CSS px.
Az ideiglenes buffok és a boss életereje továbbra is közvetlenül látszanak.

## Kódtérkép

| Fájl | Szerep |
|---|---|
| `app/src/main/assets/game.js` | Ostrom, profil, kasztok, mentés, render, HUD, menük |
| `expeditions.js` ugyanott | Pályafeladatok, oltárok, interakció |
| `space.js` | Űrjárat és modul-/útvonalválasztás |
| `chronicles.js` | Kártyák, körökre osztott harc és krónikafutam |
| `account.js` | Három mód export/import/reset és natív híd |
| `pet-rules.js` | Petfejlesztések és maximumok |
| `roles.js`, `skill-art.js` | Figurák és saját skillikonok |
| `index.html`, `style.css` | Felületi szerkezet és reszponzív stílusok |
| `app/src/main/java/...` | WebView, fájlos átvitel és cloud interfész |
| `cloud/` | Opcionális Google Play Games-adapter |
| `generate_changelog.py` | A verziónaplók és játékbeli újdonságok egyetlen forrása |
| `build.py`, `package_release.py` | APK-build és kulcsmentes kiadási csomag |

A JS fájlok jelenleg tömör sorokba szervezettek, hagyományos script-sorrenddel,
import/bundler nélkül. Ne indíts fölösleges teljes keretrendszer-migrációt.

## Mentések

| localStorage kulcs | Tartalom |
|---|---|
| `forintvedo.profile.v1` | Közös profil, valuták, meta-fejlesztés, petek és rekordok |
| `forintvedo.run.v1` | Ostrom, jelenlegi belső verzió 6 |
| `forintvedo.space.v1` | Űrjárat |
| `riftbramble.cards.v1` | Krónikafutam, belső verzió 1 |

A jutalom futamazonosító alapján egyszer írható jóvá. Import teljes állapotcsere,
nem egyenleg-összeadás. A régi kétmódos exportot is be kell tudni olvasni.
A RESET külön szöveges megerősítést kér. Valós játékosmentést ne commitolj.

## Nyitott kérdések / korlátok

- Fizikai telefonos telepítési, érintési és hosszú futamos próba szükséges.
- Google-belépés/felhő nem aktív. Kiadói projekt, konfiguráció, Gradle-összeállítás
  és kéttelefonos élő teszt hátravan. Addig a fájlos export/import működik.
- Nem történt Play Store-publikálás. Az üzleti modell korábbi ötletként egyszeri
  1–2 EUR körüli reklámmentes feloldást említett; nincs megvalósítva vagy beárazva.
- A RiftBramble névre korábban nem találtunk azonos játékcímet; ez nem jogi
  névvizsgálat és nem névfoglalás. Publikálás előtt újra ellenőrizendő.
- Az automatikus balanszteszt nem helyettesíti az emberi játéktesztet.
- Nincs Gradle wrapper és nincs végleges Play release pipeline.
- A saját kód nyílt forrású licencéről a tulajdonos döntsön. Assetlicencek mellékelve.

Az ellenőrzések aktuális eredménye a VALIDATION.md-ben, a részletes kiadástörténet
a CHANGELOG.md-ben található. Az Emlékőr külön alkalmazás; nem része ennek a repónak.
