# Közzététel és letöltések

Az eredeti, aláírt **RiftBramble 1.6.1** APK a
`docs/downloads/RiftBramble-1.6.1.apk` fájlban található. A repository README-je
közvetlen GitHub-letöltési hivatkozást tartalmaz. A `docs/` könyvtár önálló,
külső függőség nélküli, magyar nyelvű letöltőoldal.

## GitHub Pages

A repository **Settings → Pages** beállításában:

- Source: **Deploy from a branch**.
- Branch: **main**, mappa: **/docs**.
- Mentés után várd meg a GitHub Pages telepítését.

A várható cím: `https://tamashajassky.github.io/riftbramble/`.
Ez a cím csak sikeres Pages-aktiválás és telepítés után működik.
A repository láthatósága és a GitHub-előfizetés befolyásolhatja a Pages elérhetőségét.
Új APK publikálásakor a fájlt, a letöltési hivatkozásokat, a méretet és a
`SHA256SUMS.txt` ellenőrzőösszeget együtt kell frissíteni.

## Az import ellenőrzése – 2026. november 5.

- Az APK ZIP-sértetlenségi ellenőrzése sikeres.
- Minden csomagolt játékasset bájtra megegyezik az importált forrással.
- A hivatalos Android Build Tools 35 aláírás-ellenőrzője sikeresen ellenőrizte
  az APK v2 és v3 aláírását. A tanúsítvány SHA-256 lenyomata egyezik a kapott
  `apk-validation.json` jelentésével.
- Az APK csomagneve `hu.forintvedo.survival`, verziója 1.6.1, verziókódja 10,
  minimális Android API-szintje 24, cél API-szintje 35.
- A `test-game.cjs` mind a 29 ellenőrzése sikeres volt a rendszer Chromiumjával,
  helyi HTTP-kiszolgálás mellett. Az aktuális futás jelentése: `test-results.json`.
- A teljes `npm test` futás a következő, `test-v1.6.cjs` tesztnél megszakadt:
  a rendszer Chromiumjának házirendje blokkolja a `file://` URL-eket
  (`ERR_BLOCKED_BY_ADMINISTRATOR`). A további tesztek nem futottak le ebben a körben.
  A Playwright saját Chromiumjának telepítését a `cdn.playwright.dev` hálózati
  tiltása akadályozta. A korábbi JSON-jelentések a feltöltött forráscsomagból
  származnak; nem az import során végzett új ellenőrzések eredményei.
- A letöltőoldalt Chromiumban, helyi HTTP-kiszolgálással 320, 390, 768 és 1440
  képpontos szélességen ellenőriztük. Nem volt vízszintes túlcsordulás vagy
  JavaScript-hiba; az ikon megjelent. A letöltőgomb minden méreten az eredeti
  APK-t töltötte le, egyező SHA-256 ellenőrzőösszeggel.
- Nem készült új APK, és nem történt fizikai androidos telepítési próba.
  Az eredeti aláírókulcs és jelszavak nem kerültek a repositoryba.

APK SHA-256:
`228aa4d5678df1aee30f681b1822be189e507102ec53220a85cad25c03c4a9d7`
