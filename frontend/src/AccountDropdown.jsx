import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import './AccountDropdown.css';

export default function AccountDropdown({ user, loginInline, signupInline, logout }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginInline(email, password);
      } else {
        await signupInline(email, password, displayName);
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      console.error('Inline auth failed:', err);
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  }

  function handleLogout() {
    logout();
    setOpen(false);
  }

  const initial = user ? (user.displayName || user.email)[0].toUpperCase() : null;
  const avatarUrl = user && user.avatar ? `https://accounts.meduseld.io/avatars/${user.avatar}.png` : null;

  return (
    <div className="account-wrapper" ref={wrapperRef}>
      <button
        className={`header-btn account-btn${user ? ' logged-in' : ''}`}
        onClick={() => setOpen(!open)}
        title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in to sync across devices'}
      >
        {user ? (avatarUrl ? <img src={avatarUrl} alt="" className="account-avatar-img" /> : initial) : <User size={16} />}
      </button>
      {open && (
        <div className="account-dropdown">
          {user ? (
            <>
              <div className="account-info">
                <span className="account-name">{user.displayName || user.email}</span>
                <span className="account-email">{user.email}</span>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Sign out</button>
              <a className="account-manage" href="https://accounts.meduseld.io" target="_blank" rel="noreferrer">Manage account</a>
            </>
          ) : (
            <>
              <h3>{mode === 'login' ? 'Sign in' : 'Create account'}</h3>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <label>
                    Display name
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Optional" maxLength={64} autoComplete="name" />
                  </label>
                )}
                <label>
                  Email
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                </label>
                <div className="dropdown-actions">
                  <button type="submit" className="btn-dropdown-submit" disabled={loading}>
                    {loading ? (mode === 'login' ? 'Signing in...' : 'Creating...') : (mode === 'login' ? 'Sign in' : 'Create account')}
                  </button>
                </div>
              </form>
              <div className="auth-switch">
                {mode === 'login' ? (
                  <>No account? <button type="button" onClick={() => { setMode('signup'); setError(''); }}>Create one</button></>
                ) : (
                  <>Have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
