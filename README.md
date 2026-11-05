# RiftBramble 1.6.1

**[Android APK letöltése – 1.6.1](https://github.com/tamashajasSKY/riftbramble/raw/refs/heads/main/docs/downloads/RiftBramble-1.6.1.apk)** · Android 7.0+ · 2,56 MiB

A letöltőoldal forrása a [`docs/`](docs/) mappában található. A mellékelt APK eredeti, aláírt kiadás; nem újrafordított változat.

Offline Android-játék három móddal: **Ostrom**, **Űrjárat**, **Hasadékkrónikák**.
Android 7.0+ (API 24), cél-API 35. Csomagnév: `hu.forintvedo.survival`.
A kezelőfelület magyar. Java Android WebView-burok, helyi HTML/CSS/JavaScript és Canvas.
Nincs webszerver, fiók vagy futás közbeni külső függőség az alapkiadásban.

Az 1.6.1 az Ostrom felületét karcsúsítja: egysoros skill- és buffikonok szintjelzéssel,
kompakt állapotsáv, külön részletgomb, kisebb minimap és alsó vezérlők.
A korábbi mentéseket és a három mód játékszabályait megtartja.

## Kezdés a Codexben

1. Olvasd el a [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) projektátadást.
2. Kövesd az [AGENTS.md](AGENTS.md) szabályait.
3. Build és teszt: [BUILDING.md](BUILDING.md).
4. Az elvégzett ellenőrzéseket és korlátaikat a [VALIDATION.md](VALIDATION.md) tartalmazza.
5. Az új fejlesztésekhez a [CHANGELOG.md](CHANGELOG.md) mutatja az előzményeket.

**A forráscsomag GitHubra előkészített. Az eredeti aláírókulcs nincs benne.**
A régi APK-ra telepíthető frissítéshez a külön, privát kulcsmentés szükséges.
A `build.py` hiányzó kulcsnál vagy jelszónál leáll, új tesztkulcs csak kifejezett
`ALLOW_NEW_SIGNING_KEY=1` beállítással készülhet.

## Játékmódok

- **Ostrom:** végtelen hullámok vagy külön 15 hullámos expedíció; négy kaszt,
  pályaesemények, önkéntes oltárok, három skill-evolúció, társak és bossok.
- **Űrjárat:** három hajóosztály, külön kozmetikai skinek, modul- és útvonalválasztás,
  mentőkapszulák, konvojvédelem, külön kilőhető bossalkatrészek.
- **Hasadékkrónikák:** négy kaszt, 34 lap, nyolcállomásos pakliépítő kaland,
  kereskedő, pihenő, események, boss és öt feloldható nehézség.

Három külön futammentés; közös gyöngytár és emlékgyűjtemény. Fájlos export/import,
megerősítést kérő RESET. A Google-felhő nincs aktiválva; külön konfigurációt és
élő tesztet igényel: [GOOGLE_SAVE_SETUP.md](GOOGLE_SAVE_SETUP.md).

## Felhasználási jogok

Az assetek forrásai és CC0 licencei az `app/src/main/assets/art/` mappában vannak.
A projekt saját kódjához nincs külön nyílt forráskódú licenc kijelölve; GitHubra
feltöltés önmagában nem helyettesíti a tulajdonos licencdöntését.
