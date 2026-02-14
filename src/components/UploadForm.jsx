import { useState } from 'react';
import { uploadSample } from '../lib/backend';

const GENRES = ['hip hop', 'trap', 'EDM', 'lo-fi', 'drill', 'R&B', 'house'];

export default function UploadForm({ user }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [vibeTags, setVibeTags] = useState('dark, hard, melodic');
  const [highlight, setHighlight] = useState('0:10 drop');
  const [bpm, setBpm] = useState('140');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setStatus('Please choose an MP3 file first.');
      return;
    }

    setStatus('Uploading...');

    const tags = vibeTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await uploadSample(user, { title, genre, tags, highlight, bpm, file });
      setTitle('');
      setVibeTags('');
      setHighlight('');
      setBpm('140');
      setFile(null);
      setStatus('Upload complete. Your sample is live in Home.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="upload-panel">
      <h2>Upload your sample</h2>
      <form className="stack" onSubmit={handleSubmit}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Sample title" required />
        <select value={genre} onChange={(event) => setGenre(event.target.value)}>
          {GENRES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input value={vibeTags} onChange={(event) => setVibeTags(event.target.value)} placeholder="vibe tags, comma separated" />
        <input value={highlight} onChange={(event) => setHighlight(event.target.value)} placeholder="Highlight cue" required />
        <input value={bpm} onChange={(event) => setBpm(event.target.value)} type="number" min={40} max={220} required />
        <input type="file" accept="audio/mpeg,audio/mp3" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
        <p className="info">Demo upload limit: 20MB per MP3.</p>
        <button type="submit" className="primary">
          Upload MP3
        </button>
      </form>
      {status ? <p className="info">{status}</p> : null}
    </section>
  );
}
