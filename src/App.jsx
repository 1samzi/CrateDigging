import { useMemo, useState } from 'react';
import SwipeDeck from './components/SwipeDeck';
import { sampleClips } from './data/sampleClips';

const TABS = {
  HOME: 'home',
  LIKES: 'likes',
};

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [likedIds, setLikedIds] = useState([]);

  const likedSamples = useMemo(
    () => sampleClips.filter((sample) => likedIds.includes(sample.id)),
    [likedIds]
  );

  const toggleLike = (id) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]));
  };

  const visibleSamples = activeTab === TABS.HOME ? sampleClips : likedSamples;

  return (
    <main className="app">
      <header className="top-bar">
        <h1>CrateDigger</h1>
        <p>Scroll like Shorts, preview samples, and download what inspires you.</p>
      </header>

      <nav className="tabs" aria-label="Main navigation tabs">
        <button className={activeTab === TABS.HOME ? 'tab active' : 'tab'} onClick={() => setActiveTab(TABS.HOME)}>
          Home
        </button>
        <button className={activeTab === TABS.LIKES ? 'tab active' : 'tab'} onClick={() => setActiveTab(TABS.LIKES)}>
          Likes ({likedIds.length})
        </button>
      </nav>

      <SwipeDeck samples={visibleSamples} likedIds={likedIds} onToggleLike={toggleLike} />
    </main>
  );
}
