import { useMemo, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import SwipeDeck from './components/SwipeDeck';
import UploadForm from './components/UploadForm';
import useAuth from './hooks/useAuth';
import useLikes from './hooks/useLikes';
import useSamples from './hooks/useSamples';
import { deleteSample } from './lib/backend';

const TABS = {
  HOME: 'home',
  LIKES: 'likes',
  UPLOAD: 'upload',
};

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const { user, loading: authLoading, login, signup, logout } = useAuth();
  const { samples, loading: samplesLoading } = useSamples();
  const { likedIds, toggleLike } = useLikes(user);

  const likedSamples = useMemo(
    () => samples.filter((sample) => likedIds.includes(sample.id)),
    [likedIds, samples]
  );

  if (authLoading) {
    return <main className="app">Checking session...</main>;
  }

  if (!user) {
    return (
      <main className="app">
        <header className="top-bar">
          <h1>CrateDigger</h1>
          <p>Sign in to discover, like, and upload producer-ready MP3 samples.</p>
        </header>
        <AuthPanel onLogin={login} onSignup={signup} />
      </main>
    );
  }

  const visibleSamples = activeTab === TABS.HOME ? samples : likedSamples;

  return (
    <main className="app">
      <header className="top-bar">
        <h1>CrateDigger</h1>
        <p>Welcome @{user.username || user.email?.split('@')[0]}</p>
        <button className="tab signout" onClick={logout}>
          Sign out
        </button>
      </header>

      <nav className="tabs" aria-label="Main navigation tabs">
        <button className={activeTab === TABS.HOME ? 'tab active' : 'tab'} onClick={() => setActiveTab(TABS.HOME)}>
          Home
        </button>
        <button className={activeTab === TABS.LIKES ? 'tab active' : 'tab'} onClick={() => setActiveTab(TABS.LIKES)}>
          Likes ({likedIds.length})
        </button>
        <button className={activeTab === TABS.UPLOAD ? 'tab active' : 'tab'} onClick={() => setActiveTab(TABS.UPLOAD)}>
          Upload
        </button>
      </nav>

      {activeTab === TABS.UPLOAD ? (
        <UploadForm user={user} />
      ) : samplesLoading ? (
        <p className="empty-state">Loading samples...</p>
      ) : (
        <SwipeDeck
          user={user}
          samples={visibleSamples}
          likedIds={likedIds}
          onToggleLike={toggleLike}
          onDeleteSample={(sampleId) => deleteSample(user, sampleId)}
        />
      )}
    </main>
  );
}
