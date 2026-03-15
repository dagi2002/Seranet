# Seranet Mobile

Customer-facing Expo app for the Seranet storefront flow.

## Main documentation

Use the project handoff doc for the full mobile setup, LAN configuration, UI overhaul summary, troubleshooting, and next steps:

- [Project Documentation](../docs/PROJECT_DOCUMENTATION.md)

## Quick setup

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_BASE_URL` to a backend URL reachable from the phone or simulator.
   - Android emulator: `http://10.0.2.2:4000/api`
   - Physical phone on the same Wi-Fi: `http://<your-computer-lan-ip>:4000/api`
3. Set `EXPO_PUBLIC_DEFAULT_STORE_SLUG` to the store slug you want to open.
4. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
5. Choose the target device env:
   ```bash
   npm run use:android
   ```
   or
   ```bash
   npm run use:iphone
   ```
6. Start Expo:
   ```bash
   npm run start
   ```
7. With the backend running on port `4000`, launch Android:
   ```bash
   npm run android
   ```

## Android emulator notes

- If `adb` is not found in the terminal, use the SDK copy from Android Studio:
  ```bash
  ~/Library/Android/sdk/platform-tools/adb devices
  ```
- The first Android launch may spend several minutes downloading and installing Expo Go in the emulator.
- If Expo says port `8081` is already in use, it is safe to accept another port such as `8082`.
- You can also combine env switching and Expo startup with:
  ```bash
  npm run start:android
  ```
  or
  ```bash
  npm run start:iphone
  ```

## Important note

If you are testing on a physical phone, `EXPO_PUBLIC_API_BASE_URL` must use the computer's current LAN IP address, not `localhost`.
