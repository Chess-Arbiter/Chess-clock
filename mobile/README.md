# Chess Clock — mobile

Native React Native (Expo) chess clock for Android. It works fully offline: no WebView and no network access.

Privacy policy: https://chessarbiter.info/privacy/chess-clock

## Run

```bash
npm i
npm start              # starts Expo — scan the QR code with Expo Go
```

## Structure

- `App.tsx` — switches between the setup and clock screens; handles the system bars and keeps the screen awake
- `src/screens/SetupScreen.tsx` — presets, custom times per player, "Increment after move" rule
- `src/screens/ClockScreen.tsx` — the two timers and the restart / play / settings buttons
- `src/useChessClock.ts` — game logic: countdown, moves, increments
- `src/storage.ts` — saves the last settings on the device (`expo-sqlite/kv-store`)

## Checks

```bash
npm run typecheck
npx expo-doctor
```

## Deploy to Google Play

The app is linked to the EAS project `@chess_arbiter/chess-clock` (package `com.chess_arbiter.chessclock`).

```bash
npm run build:android    # production .aab on EAS; versionCode is auto-incremented
npm run submit:android   # uploads the latest build to Google Play (internal track)
```

First release only:

1. On the first `build:android`, let EAS generate and store the Android keystore.
2. Create the app in Google Play Console and upload that first `.aab` manually — Google doesn't allow API uploads for a brand-new app.
3. For `submit:android`, add a Google service account key in the EAS dashboard
   (Project → Credentials → Android → Google Service Account Key). See https://docs.expo.dev/submit/android/.

Bump `version` in `app.json` for each new store release.
