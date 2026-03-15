# Seranet Mobile

Customer-facing Expo app for the Seranet storefront flow.

## Main documentation

Use the project handoff doc for the full mobile setup, LAN configuration, UI overhaul summary, troubleshooting, and next steps:

- [Project Documentation](../docs/PROJECT_DOCUMENTATION.md)

## Quick setup

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_BASE_URL` to a backend URL reachable from the phone or simulator.
3. Set `EXPO_PUBLIC_DEFAULT_STORE_SLUG` to the store slug you want to open.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start Expo:
   ```bash
   npm run start
   ```

## Important note

If you are testing on a physical phone, `EXPO_PUBLIC_API_BASE_URL` must use the computer's current LAN IP address, not `localhost`.
