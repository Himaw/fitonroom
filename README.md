# Fiton Room

Fiton Room is an iOS-first React Native app for virtual clothing try-on. The current version uses Supabase Auth for account-based history, photo upload, product input, and generated try-on results.

## Tech Stack

- React Native with Expo
- TypeScript
- Expo Router
- HeroUI Native
- Supabase Auth for email, Google, and Apple sign-in
- Expo SecureStore for auth session and device install ID storage
- Expo AuthSession / WebBrowser for OAuth redirects
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

## Environment

Create a local env file:

```sh
cp .env.example .env
```

Fill in the public Supabase values:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-supabase-anon-or-publishable-key
```

These are safe for the mobile app. Do not put backend-only values such as `DATABASE_URL`, `SUPABASE_JWT_SECRET`, or `service_role` keys in this frontend repo.

## Supabase Auth Setup

In Supabase, enable:

- Email provider
- Google provider
- Apple provider

Add this app scheme to Supabase Auth redirect URLs:

```text
fitonroom://**
```

When testing with Expo Go, also add the local Expo redirect URL printed by the app or terminal, which usually looks like:

```text
exp://localhost:8081/--/**
```

For a production build, configure the final universal link or app scheme redirect before release.

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

Version 1 requires user login. Users can sign in or create an account with email/password, Google, or Apple. On first authenticated launch, the app still creates a secure random device install ID and stores it locally with Expo SecureStore. The backend can link that device profile to the signed-in Supabase user.

The initial app tabs are:

- Fiton: quick body photo upload access and product URL input
- Setup: guided body photo selection and configuration
- History: previous generated fitons for this account
- Settings: light, dark, and system appearance modes

## Next Development Steps

1. Build the photo upload screen.
2. Add image picker permissions and photo selection state.
3. Add product URL and screenshot input screens.
4. Connect to the backend for pre-signed S3 upload URLs.
5. Create try-on jobs and poll job status.
6. Connect authenticated frontend requests to the backend with the Supabase access token.
7. Add account history/gallery screen.
8. Add iOS Share Extension with Swift after the core mobile flow is stable.
