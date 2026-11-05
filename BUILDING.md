# Build és ellenőrzés

## Helyi játékpróba

Nyisd meg az `app/src/main/assets/index.html` fájlt böngészőben. A játék offline,
helyi fájlként is működik. A böngészős profil különálló az Android telefon profiljától.

## Ajánlott APK-build: build.py

Kell: Python 3, JDK 17 (`java`, `javac`, `keytool` a PATH-on), Android SDK Platform 35
és Build Tools 35.0.0. Nem kell Gradle, npm vagy hálózati kapcsolat a buildhez,
ha ezek az eszközök már telepítve vannak.

1. Az eredeti kulcsot a külön privát mentésből helyezd `signing/forintvedo.jks` alá,
   vagy add meg a helyét a `FORINTVEDO_KEYSTORE` változóval.
2. Állítsd be az `ANDROID_HOME` SDK-útvonalat és a `FORINTVEDO_KEY_PASSWORD` változót.
   A jelszót ne tedd parancsfájlba, dokumentációba vagy gitbe. Bash interaktív példa:

   ```bash
   export ANDROID_HOME=/path/to/android-sdk
   read -rsp 'Keystore password: ' FORINTVEDO_KEY_PASSWORD
   export FORINTVEDO_KEY_PASSWORD
   python3 build.py
   unset FORINTVEDO_KEY_PASSWORD
   ```

   PowerShell alatt ugyanezek a környezeti változók szükségesek. Windowsos helyi
   fordításhoz jelenleg WSL/Linux ajánlott: a buildszkript Linuxon lett ellenőrizve.
3. Kimenet: `dist/RiftBramble-1.6.1.apk`. Az írás csak ellenőrzött aláírás és ZIP
   sértetlenségi ellenőrzés után válik véglegessé.
4. Tanúsítvány összevetése az előző APK-val:

   ```bash
   "$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --print-certs OLD.apk
   "$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --print-certs dist/RiftBramble-1.6.1.apk
   ```

A tanúsítvány SHA-256 lenyomatának egyeznie kell a frissíthetőséghez.
A csomagnév változatlan, a verziókód jelenleg 10. Javac hiányában a build
`ECJ_JAR=/path/to/ecj.jar` beállítással is futtatható; ezt használtuk az aktuális környezetben.

**Csak új, különálló tesztidentitáshoz:** `ALLOW_NEW_SIGNING_KEY=1` engedi az új
kulcs létrehozását, ha a megadott kulcs még nem létezik. Ez az APK nem frissíti a régi
aláírással telepített játékot. Emiatt a meglévő játékot ne töröld a telefonról.

## Böngészős tesztek

```bash
npm install
npx playwright install chromium
npm test
```

A `package.json` a környezetben kipróbált Playwright-verziót rögzíti. Külső Chromium
használatához: `CHROME_PATH=/absolute/path/to/chrome npm test`.
A headless tesztek `--no-sandbox` kapcsolóval indulnak; megbízható projektkódhoz,
izolált fejlesztői környezetben futtasd őket.

A `run_tests.py` a jelenlegi regressziós teszteket és a 12 futamos kártyakampányt indítja.
A `test-hud.cjs` öt kijelzőméreten ellenőrzi a sáv magasságát, az átfedéseket és a valódi
koppintásokat. A QA képek `qa/` alá kerülnek. A JSON-jelentések újraíródnak.
A régi `test-v1.3`–`test-v1.5.1` tesztek történeti ellenőrzések, egyes régi
elvárásaik az új felülettel nem feltétlenül érvényesek.

## Gradle / Android Studio

Van Gradle-konfiguráció (Android Gradle Plugin 8.9.2), de Gradle wrapper nincs a
csomagban. A hitelesített offline APK-t a `build.py` állítja elő. Android Studio/
Gradle használatakor a kompatibilis Gradle-környezetet és a release signingConfigot
külön kell beállítani; az utóbbit soha ne égesd be a repositoryba.
A Play Games út külön konfigurációt igényel, és teljesen összeszerelt release-ének
élő fiókos tesztje hátravan. Lásd `GOOGLE_SAVE_SETUP.md`.

## Új kiadás

- Verzió: `app/build.gradle`, mindhárom manifest, `build.py`, `package_release.py`,
  `package.json`, README és a játék kiadásjelzései. A verziókódot növeld.
- `generate_changelog.py` RELEASES → `python3 generate_changelog.py`.
- Tesztek → APK-build → régi/új tanúsítvány és csomagolt assetek összevetése.
- `python3 package_release.py` elkészíti az APK-t, a kulcsmentes forrás ZIP-et,
  az átadási leírást és a változásnaplót a szülő `deliverables/` mappában.
- A privát kulcsmentés külön kezelendő; nem git és nem GitHub Release-melléklet.
