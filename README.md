# CrateDigger (React Web)

CrateDigger is a web app for producers to discover and share sample clips.

## Features

- Email/password-style user accounts (local demo auth)
- Home feed loaded from app storage (no static hardcoded sample seed)
- Likes tab persisted per user account
- Upload tab for MP3 files + genre + vibe tags + highlight + BPM
- Download button per sample
- Shorts-style vertical feed with preview, like, and download actions

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Notes about backend

This starter now runs without Firebase so it works immediately after install.
Data is persisted in browser `localStorage`.

If you want cloud sync across devices, you can swap `src/lib/backend.jsx` to a Firebase/Firestore implementation later.

## App files

- `src/lib/backend.jsx` - local data layer (auth, samples, likes, uploads)
- `src/hooks/useAuth.jsx` - auth session listener + actions
- `src/hooks/useSamples.jsx` - realtime-like samples subscription
- `src/hooks/useLikes.jsx` - per-user likes persistence
- `src/components/AuthPanel.jsx` - login/signup UI
- `src/components/UploadForm.jsx` - MP3 upload flow + metadata
- `src/components/SwipeDeck.jsx` - vertical feed cards
- `src/App.jsx` - tab shell and app state wiring
