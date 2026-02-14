import { useState } from 'react';

export default function AuthPanel({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onSignup(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-panel">
      <h2>{mode === 'login' ? 'Login' : 'Create account'}</h2>
      <form onSubmit={submit} className="stack">
        <input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input
          type="password"
          placeholder="At least 6 characters"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" className="primary">
          {mode === 'login' ? 'Login' : 'Sign up'}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <button className="tab" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
      </button>
    </section>
  );
}
