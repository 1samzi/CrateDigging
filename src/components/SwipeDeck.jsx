import useAudioPreview from '../hooks/useAudioPreview';

export default function SwipeDeck({ samples, likedIds, onToggleLike }) {
  const { isPlaying, activeUrl, playOrPause } = useAudioPreview();

  if (!samples.length) {
    return <p className="empty-state">No samples yet. Upload one in the Upload tab.</p>;
  }

  return (
    <section className="feed" aria-label="Sample feed">
      {samples.map((sample) => {
        const isLiked = likedIds.includes(sample.id);
        const isActive = activeUrl === sample.audioUrl && isPlaying;

        return (
          <article key={sample.id} className="clip-card">
            <span className="genre">{sample.genre}</span>
            <h2>{sample.title}</h2>
            <p>By {sample.producer}</p>
            <p>BPM: {sample.bpm}</p>
            <p>Highlight: {sample.highlight}</p>
            {sample.tags?.length ? <p className="tags">#{sample.tags.join(' #')}</p> : null}

            <button className="primary" onClick={() => playOrPause(sample.audioUrl)}>
              {isActive ? 'Pause Preview' : 'Play Preview'}
            </button>

            <div className="row">
              <button className={isLiked ? 'selected' : ''} onClick={() => onToggleLike(sample.id)}>
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <a className="download" href={sample.downloadUrl || sample.audioUrl} download>
                Download
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}
