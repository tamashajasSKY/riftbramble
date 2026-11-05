# RiftBramble 1.6.1 – ellenőrzés

2026. november 5. A `run_tests.py` összes aktuális tesztje sikeresen lefutott:

| Teszt | Sikeres ellenőrzés |
|---|---:|
| Alap Ostrom-játékmenet (`test-game.cjs`) | 29 |
| Három mód és evolúciók (`test-v1.6.cjs`) | 29 |
| Modulok és kártyamechanikák (`test-mechanics16.cjs`) | 13 |
| Négy kaszt érintése és cooldown (`test-class-button.cjs`) | 15 |
| Kompakt felület (`test-hud.cjs`) | 20 |
| Offline működés (`test-offline.cjs`) | 10 |
| Három mód fájlos mentése, import, reset (`test-backup16.cjs`) | 4 |
| **Összesen** | **120** |

További 12 determinisztikus kártyakampány lefutott: 9 győzelem, 3 vereség.
Ez működési próba, nem játékosok mért győzelmi aránya.

A teljes skillkészlettel, petekkel, három buffal és bossal terhelt HUD öt méreten
(320×568, 360×640, 390×844, 412×915, 844×390) 152 CSS px magas. A skillek és
buffok egyetlen 44 px-es görgethető sorban maradnak. A teszt a tényleges koppintást,
a leírások szüneteltető működését és az alsó vezérlők átfedésmentességét is ellenőrzi.
A játék 390×844-es, animált jelenetét külön képen is átnéztük.

A régi bosslövés-teszt véletlenül a teljes pálya távoli pontjára helyezhette a bosst,
az újabb hatótávszabály mellett így nem mindig adott lövést. A tesztjelenetben most
kifejezetten 200 egységre helyezzük a bosst; a játék harci szabályait nem módosítottuk.

Az APK sikeresen lefordult (ECJ, SDK 35), v2/v3 aláírása érvényes. Csomagnév
`hu.forintvedo.survival`, verziókód 10, verziónév 1.6.1. A tanúsítvány az 1.6.0-val
azonos, a ZIP sértetlen, mind a 22 csomagolt asset bájtra egyezik a forrással.
Részletek: `apk-validation.json`, `test-v1.6.1-results.json` és a részjelentések.

A forrás ZIP nem tartalmaz aláírókulcsot, bináris APK-t, QA-képet vagy buildkönyvtárat.
A kulcs külön privát csomagban van. A build hiányzó kulcs vagy jelszó esetén leáll.

**Fizikai androidos telepítés és játék nem történt.** A Google-felhő továbbra sem
aktív. A Gradle/Play Games release-út teljes összeszerelése és élő tesztje hátravan.

## Korábbi 1.6.0 ellenőrzés

- 49 korábbi ellenőrzés: migráció, régi valuták, petképletek, elfogadott hős- és mobrajzok, spawnok, buffleírás, három fix jutalomlap és telefonméretek (`test-v1.5.cjs`).
- 29 új integrációs ellenőrzés: kártyás harc és fázisok, meteor, választható jutalmak, mentések, feladat, oltár, valódi evolúciós robbanás, modulok, útvonalak, bossrészek, expedíció lezárása és egyszeri kifizetés (`test-v1.6.cjs`).
- 13 mechanikai ellenőrzés: tényleges lövedékkel külön bossrészek kilövése, aszteroida, kapszula és konvoj találata, modulhatások, mentett választás, pakli újrakeverés, ellenséges védelem, három pet-szerep és bossgyőzelmi feloldás (`test-mechanics16.cjs`). Ebben a tesztben a renderelő időzítés kikapcsolt, a fizika lépéseit kézzel vezéreljük.
- 15 érintőgomb-ellenőrzés: mind a négy kaszt tényleges mobilböngészős koppintása, újratöltés, külön információgomb, billentyűzet és érintési célpont álló/fekvő méretben (`test-class-button.cjs`).
- 10 offline ellenőrzés: mindkét akciómód, zene, mentés és újraindítás; külső hálózati kérés és JavaScript-hiba nélkül (`test-offline.cjs`). Az új kártyatesztek szintén helyi file URL-ről futnak.
- 4 export/import/reset ellenőrzés: letöltött fájl harmadik futammal, tényleges RESET, mindhárom futam visszatöltése és hibás lap elutasítása (`test-backup16.cjs`).

Összesen 120 ellenőrzés, plusz 12 teljes, rögzített véletlensorozatú kártyakampány egy egyszerű automatikus stratégiával. Mind a négy kaszt legalább két alkalommal végigért; 9 győzelem és 3 vereség született. Ez működési és durva balanszellenőrzés, nem emberi játékosok mért győzelmi aránya. A későbbi nehézségekhez és a hosszú endless futamokhoz további játékosi visszajelzés szükséges.

Az APK aláírását, ZIP-épségét és minden csomagolt asset egyezését ellenőrizzük; az eredeti kulcs és csomagnév változatlan. Verziókód 9. A menü, kártyás harc és modulválasztó saját böngészős képeit vizuálisan ellenőriztük. QA-képek nem kerülnek a kiadási csomagba.

Fizikai androidos telefonon telepítés és játék nem történt. Google-felhő nincs aktiválva; a fájlos átvitel használható.
