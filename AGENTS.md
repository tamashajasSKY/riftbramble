# RiftBramble fejlesztési szabályok

- Az Android csomagnév `hu.forintvedo.survival`. A meglévő projektkulcsot őrizd meg.
- Minden kiadásnál növeld a manifest verziókódját és frissítsd a verziónevet.
- Minden kiadáskor frissítsd a `generate_changelog.py` RELEASES adatait, és futtasd
  a generátort. A `CHANGELOG.md`, a verziónkénti naplók és a játékbeli Újdonságok
  ugyanebből a forrásból készüljenek.
- A korábbi feloldásokat, valutákat, rekordokat és mentéseket migráld; ne töröld.
- Mindhárom mód külön futammentést, közös, egyszeri kifizetéssel védett
  gyöngytárat használjon.
- A kész APK-t csak teljes kiírás és ellenőrzött aláírás után tedd a dist mappába.
- A feladatnak megfelelő játékmenet-, migrációs és offline ellenőrzéseket futtasd.
  Ne állíts fizikai telefonos tesztet, ha ilyen nem történt.
- A tesztképernyőképek a `qa` mappában maradjanak; ne kerüljenek a forráscsomagba.

- Folytatás előtt olvasd el a `PROJECT_HANDOFF.md` és `BUILDING.md` fájlokat.
- Az aláírókulcs, jelszavak és helyi profil-/futammentések nem kerülhetnek gitbe,
  a forrás ZIP-be vagy nyilvános issue-ba. A kulcsot külön privát csatornán add át.
- Az eredeti kulcs hiányában ne állíts frissíthetőséget; a build ilyenkor álljon meg.
- Az Ostrom HUD maradjon kompakt, a skillek egysoros ikonként, görgethetően
  jelenjenek meg. A részletek megnyitása állítsa meg a harcot; ne aktiváljon skillt.
- A mobok és a már elfogadott hős-/petrajzok módosítása külön feladat legyen.
