# Google-fiókos mentés - 1.3.0

## Jelenlegi állapot

A letölthető APK helyben működik, a Google-belépés és felhőmentés nincs benne
aktiválva. A felület ezt egyértelműen jelzi; a gombok le vannak tiltva.
A hiányzó saját Google-projektazonosítót nem helyettesítettük próbaazonosítóval.
A fájlos export/import már működő alternatíva a teljes profil és mindkét
futam telefonok közötti átvitelére.

Az opcionális `cloud` modul valódi Google Play Games Services v2 API-t használ:
belépés, Snapshots felhőmentés, betöltés, kézi ütközésfeloldás. A Java-adaptert
az eredeti Google SDK 21.0.0 könyvtáraival sikeresen lefordítottuk. Ez nem
helyettesíti a konfigurált, aláírt alkalmazás valódi Google-fiókos tesztjét.
A Gradle kiadás teljes összeszerelése és az élő fiókos teszt még hátravan.

## A kiadótól szükséges beállítások

1. Play Console-ban hozd létre a játékot és a hozzá kapcsolódó Google Play
   Games Services projektet. Kapcsold be a Saved Games funkciót.
2. Kapcsold össze a Google Cloud-projektet, állítsd be az OAuth-hozzájárulási
   képernyőt és a szükséges tesztfelhasználókat.
3. A csomagnév `hu.forintvedo.survival`. Hozd létre az Android-hitelesítő
   adatokat ehhez és a tényleges alkalmazásaláíró tanúsítvány SHA-1-éhez.
   Play App Signing esetén a Play által kiadott alkalmazás tanúsítványa kell;
   a kézzel telepített APK tesztjéhez annak külön tanúsítványa szükséges.
4. Add meg a Games Services numerikus játékazonosítóját a projekt helyi
   `gradle.properties` fájljában: `PGS_APP_ID=SAJAT_AZONOSITO`.
   Ne OAuth-kliensazonosítót vagy projektnevet adj meg. A játékazonosító
   nyilvános konfigurációs adat; privát kulcs vagy klienssecret nem kerül az APK-ba.
5. Nyisd meg a projektet Android Studióban, telepítsd a build által kért
   Android/Gradle-eszközöket. A konfiguráció a `cloud` modul forrását és a
   Google SDK-t csak megadott `PGS_APP_ID` mellett veszi be a buildbe.
6. Az éles/frissítő aláírást külön állítsd be, és a kulcsot őrizd meg.
   A tesztfiókokat a Play Games-projektben is engedélyezd.
7. Ellenőrizd két valódi telefonon az alábbi folyamatokat, majd publikáld
   a Games Services-beállításokat a tervezett kiadási folyamat szerint.

## Játékos használata

- Régi telefon: Fiók / mentés > Google Play Games belépés > Mentés a felhőbe.
- Új telefon: ugyanaz a Play Games-fiók > Betöltés a felhőből > előnézet és
  a helyi profil lecserélésének megerősítése.
- A mentés a profilt, feloldásokat, valutákat, rekordokat és mindhárom futamot viszi.
- Nincs automatikus felülírás vagy két egyenleg összeadása. A felhőbe mentés
  előtt megerősítés jelenik meg. Egyszerre egy telefonon folytasd a futamot.
- Ütköző Google-pillanatképek esetén a natív választóban a mentések időbélyeges
  leírása alapján választhatsz. Megszakításkor a helyi állás nem változik.
- A helyi reset nem törli a Google-fiókot vagy a felhőmentést. Ha ott is az
  újrakezdett állást szeretnéd, ezt külön, megerősítve mentsd a felhőbe.

## Kötelező élő ellenőrzés a bekapcsolás előtt

Belépés/megadás elutasítása; nincs hálózat; üres felhőtár; két telefon közötti
mentés/betöltés; régi és új futam; helyi és felhőállás eltérése; mentésütközés;
alkalmazás háttérbe kerülése; azonos telefonon másik Play Games-fiók;
helyi reset után régi felhőmentés kézi visszaállítása.

## Hivatalos dokumentáció

- https://developer.android.com/games/pgs/android/android-signin
- https://developer.android.com/games/pgs/android/saved-games
- https://developers.google.com/android/reference/com/google/android/gms/games/SnapshotsClient

A mostani offline kiadás API 35-öt céloz. A Play Store-ba történő éles
beküldéshez az aktuális cél-API és bolti követelmények külön
ellenőrzése szükséges; ez a csomag továbbra is közvetlen telepítésre készült.
