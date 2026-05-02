# Fiton Room

Fiton Room is an iOS-first React Native app for virtual clothing try-on. The first version is intentionally lightweight: no login, device-based history, photo upload, product input, and generated try-on results.

## Tech Stack

- React Native with Expo
- TypeScript
- Expo Router
- HeroUI Native
- Expo SecureStore for anonymous device install ID storage
- Expo Image Picker for body photos and clothing screenshots
- Expo Notifications for future try-on completion alerts
- Expo File System for future upload/file handling
- Uniwind + Tailwind CSS for HeroUI Native styling

## Requirements

- Node.js 22+
- npm 10+
- Xcode installed for iOS Simulator
- Expo Go on a physical iPhone, or an iOS Simulator from Xcode

## Install

```sh
npm install
```

If npm has cache problems, use a clean temporary cache:

```sh
npm install --cache /private/tmp/fitonroom-npm-cache
```

## Run The App

Start the Expo dev server:

```sh
npm start
```

Run on iOS Simulator:

```sh
npm run ios
```

Run on Android:

```sh
npm run android
```

Run in a browser:

```sh
npm run web
```

HeroUI Native is primarily focused on iOS and Android. Web is useful for quick layout checks, but the production target for this app is iOS first.

## Useful Commands

Check TypeScript:

```sh
npm run typecheck
```

Run Expo lint:

```sh
npm run lint
```

## Current MVP Direction

Version 1 does not require user login. On first launch, the app creates a secure random device install ID and stores it locally with Expo SecureStore. The backend will use that device profile to keep upload history, try-on jobs, and generated results for the same device.

Later, Fiton Room can add account login and migrate device history into a user account for cross-device sync.

The initial app tabs are:

- Fiton: quick body photo upload access and product URL input
- Setup: guided body photo selection and configuration
- History: previous generated fitons for this device
- Settings: light, dark, and system appearance modes

## Next Development Steps

1. Build the photo upload screen.
2. Add image picker permissions and photo selection state.
3. Add product URL and screenshot input screens.
4. Connect to the backend for pre-signed S3 upload URLs.
5. Create try-on jobs and poll job status.
6. Add device history/gallery screen.
7. Add iOS Share Extension with Swift after the core mobile flow is stable.
