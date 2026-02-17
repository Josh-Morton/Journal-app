# Implementation Plan - Journal App Architecture

This document outlines the proposed architecture for the cross-platform Journal and Recipe application. The goal is to provide a modern, scalable, and cost-effective solution that works seamlessly on both Mobile (iOS/Android) and Desktop (macOS/Web).

## Proposed Architecture

## Updated Architecture: Offline-First & Privacy-Focused

### 1. Frontend: React Native (Expo)
- **Core**: standard Expo workflow.
- **Styling**: NativeWind (Tailwind).

### 2. Offline-First Data Layer: WatermelonDB (or Expo SQLite)
- **Goal**: The app must work 100% offline.
- **Solution**: **WatermelonDB**.
  - It uses a local SQLite database on the device (very fast).
  - It is "Reflexive": UI updates automatically when data changes.
  - **Sync**: We will implement a sync mechanism to push/pull changes to Supabase when online.
- **Why**: This is the industry "Best Practice" for robust offline apps, ensuring your journal entries are never lost even if you lose signal.

### 3. Backend: Supabase
- **Role**: Functions as the "Cloud Backup" and sync point.
- **Auth**: Handles user sessions across devices.

### 4. Offline AI: On-Device Transcription
- **Solution**: **Whisper.cpp (via `react-native-whisper`)**.
- **Capability**: Runs OpenAI's Whisper model *locally* on your phone/computer.
  - **Pros**: Totally free, works offline, private.
  - **Cons**: Adds some size to the app bundle; requires downloading the model (~50MB-100MB) once.

## Accounts You Will Need
You will need to create these accounts yourself (I can't do it for you), but I will guide you through every step!

1.  **GitHub** (You have this): To host the code.
2.  **Expo** (Optional but Recommended): For easy building and viewing builds on your phone.
    - *Action*: You can create one at `expo.dev` later.
3.  **Supabase** (Required): For the database/backend.
    - *Action*: Go to `supabase.com` and sign up (Free Plan).

## Next Steps
1.  Initialize **Expo** project.
2.  Install **NativeWind** (Styling).
3.  Set up **WatermelonDB** (Local Database).
