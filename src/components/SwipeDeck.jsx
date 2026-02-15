import useAudioPreview from '../hooks/useAudioPreview';

export default function SwipeDeck({ user, samples, likedIds, onToggleLike, onDeleteSample }) {
  const { isPlaying, activeUrl, playOrPause } = useAudioPreview();
  const activeSample = samples.find((sample) => sample.audioUrl === activeUrl);
  const handleDelete = async (sampleId) => {
    try {
      await onDeleteSample(sampleId);
    } catch (error) {
      alert(error.message);
    }
  };

  if (!samples.length) {
    return <p className="empty-state">No samples yet. Upload one in the Upload tab.</p>;
  }

  return (
    <>
      <section className="feed" aria-label="Sample feed">
        {samples.map((sample) => {
          const isLiked = likedIds.includes(sample.id);
          const isActive = activeUrl === sample.audioUrl && isPlaying;
          const canDelete = sample.userId === user.uid;

          return (
            <article key={sample.id} className="clip-card">
              <span className="genre">{sample.genre}</span>
              <h2>{sample.title}</h2>
              <p>By @{sample.producer}</p>
              <p>BPM: {sample.bpm}</p>
              <p>Highlight: {sample.highlight}</p>
              {sample.tags?.length ? <p className="tags">#{sample.tags.join(' #')}</p> : null}

              <button
                className="primary"
                onClick={() => playOrPause(sample.audioUrl)}
                disabled={!sample.audioUrl}
              >
                {!sample.audioUrl ? 'Preview Unavailable' : isActive ? 'Pause Preview' : 'Play Preview'}
              </button>

              {sample.missingMedia ? <p className="info">Original media is unavailable in this browser profile.</p> : null}

              <div className="row">
                <button className={isLiked ? 'selected' : ''} onClick={() => onToggleLike(sample.id)}>
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                {sample.downloadUrl || sample.audioUrl ? (
                  <a className="download" href={sample.downloadUrl || sample.audioUrl} download={sample.originalFileName || true}>
                    Download
                  </a>
                ) : (
                  <span className="download disabled">Download unavailable</span>
                )}
              </div>

              {canDelete ? (
                <button className="danger" onClick={() => handleDelete(sample.id)}>
                  Delete My Sample
                </button>
              ) : null}
            </article>
          );
        })}
      </section>

      <aside className="playbar" aria-label="Now playing bar">
        <div>
          <strong>{activeSample ? activeSample.title : 'No sample selected'}</strong>
          <p>{activeSample ? `by @${activeSample.producer}` : 'Tap Play Preview on any card'}</p>
        </div>
        <button
          className="tab"
          onClick={() => (activeSample?.audioUrl ? playOrPause(activeSample.audioUrl) : null)}
          disabled={!activeSample?.audioUrl}
        >
          {activeSample && isPlaying ? 'Pause' : 'Play'}
        </button>
      </aside>
    </>
  );
}
