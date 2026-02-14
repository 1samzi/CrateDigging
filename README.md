# CrateDigger (React + Firebase)

CrateDigger is a web app for producers to discover and share sample clips.

## Features

- Email/password user accounts with Firebase Auth
- Home feed loaded from Firestore (no static sample seed)
- Likes tab persisted per user in Firestore
- Upload tab for MP3 files + genre + vibe tags + highlight + BPM
- Files stored in Firebase Storage with downloadable file URLs
- Shorts-style vertical feed with preview, like, and download actions

## 1) Install

```bash
npm install
```

## 2) Add Firebase environment variables

Create `.env` in the project root:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3) Run

```bash
npm run dev
```

## Firestore structure

- `samples/{sampleId}`
  - `title`, `genre`, `tags[]`, `highlight`, `bpm`
  - `producer`, `audioUrl`, `downloadUrl`, `storagePath`
  - `userId`, `createdAt`
- `users/{uid}/likes/{sampleId}`
  - `createdAt`

## Suggested Firebase Security Rules (starter)

Use strict rules before production. Starter example:

- allow signed-in users to read samples
- allow signed-in users to write only their own samples
- allow users to manage only their own likes
- allow storage write/read under authenticated constraints

## App files

- `src/lib/firebase.jsx` - Firebase app/auth/firestore/storage setup
- `src/hooks/useAuth.jsx` - auth session listener
- `src/hooks/useSamples.jsx` - realtime Firestore samples feed
- `src/hooks/useLikes.jsx` - per-user likes persistence
- `src/components/AuthPanel.jsx` - login/signup UI
- `src/components/UploadForm.jsx` - MP3 upload flow + metadata
- `src/components/SwipeDeck.jsx` - vertical feed cards
- `src/App.jsx` - tab shell and app state wiring
