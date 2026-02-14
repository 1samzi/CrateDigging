# CrateDigger (React Web App)

A web-first sample discovery app for producers.

## What this version does

- **Home tab** with a vertical, Shorts-style scrolling feed
- **Likes tab** that only shows samples you've liked
- Audio preview playback (play/pause)
- Download button on every sample card
- Genre/BPM/highlight metadata per sample

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

## App layout

- `src/App.jsx` - home + likes tabs and like state
- `src/components/SwipeDeck.js` - scrolling feed cards (web-first, no swipe gestures)
- `src/hooks/useAudioPreview.js` - browser `Audio` hook for previews
- `src/data/sampleClips.js` - sample data
- `src/styles.css` - styling including scroll container

## Why this approach is best for web

On web, vertical scrolling is more natural than touch swipe cards. This feed behaves more like YouTube Shorts/Reels:

- easier on desktop and mobile browsers
- no fragile swipe gesture handling
- cleaner discoverability with quick scroll + preview + download

## Next steps

- Replace static sample data with backend data (Firebase/Firestore)
- Persist likes per user account
- Add upload flow + tags + server-side downloadable files
