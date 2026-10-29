import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import PageMetadata from '../components/PageMetadata';
import Icon from '../components/Icon';
import { adminApi, AdminApiError, message } from './api';
import { Field, Loading, Notice, Submit } from './components';
import AdminCompetitions from './AdminCompetitions';
import AdminCompetition from './AdminCompetition';
import AdminVirtualPlayers from './AdminVirtualPlayers';
import './admin.css';

function Login({ signedIn }: { signedIn: (username: string) => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const session = await adminApi<{ username: string }>('/auth/login', 'POST', { username: form.get('username'), password: form.get('password') });
      signedIn(session.username);
    } catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  return <main className="admin-login">
    <div className="admin-login-brand"><img src="/icon-48.png" alt="" width="40" height="40" /><span>VAMORA</span></div>
    <div className="admin-login-panel"><h1>Tournament control</h1><p>Sign in to manage competitions, players, and matchday decisions.</p>
      <form onSubmit={submit}><Field label="Username"><input name="username" autoComplete="username" required maxLength={128} autoFocus /></Field>
        <Field label="Password"><input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></Field>
        {error && <Notice error>{error}</Notice>}<Submit busy={busy}>Sign in</Submit>
      </form>
    </div><p className="admin-login-foot">Private administration · Vamora</p>
  </main>;
}
export default function AdminApp() {
  const [session, setSession] = useState<string | null>(null);
  const [checking, setChecking] = useState(true); const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    adminApi<{ username: string }>('/auth/session').then((result) => { if (active) setSession(result.username); })
      .catch((error) => { if (active && !(error instanceof AdminApiError && error.status === 401)) setError(message(error)); })
      .finally(() => { if (active) setChecking(false); });
    const expired = () => { setSession(null); setChecking(false); };
    window.addEventListener('admin-session-expired', expired);
    return () => { active = false; window.removeEventListener('admin-session-expired', expired); };
  }, []);
  async function logout() {
    try { await adminApi('/auth/logout', 'POST', {}); setSession(null); navigate('/admin', { replace: true }); }
    catch (error) { setError(message(error)); }
  }
  return <div className="admin-app" dir="ltr" lang="en"><PageMetadata />
    {checking ? <div className="admin-starting"><Loading /><p>Checking your admin session…</p></div>
      : !session ? <>{error && <Notice error>{error}</Notice>}<Login signedIn={(user) => { setSession(user); setError(''); }} /></>
      : <><a href="#admin-content" className="admin-skip">Skip to content</a>
        <aside className="admin-sidebar"><Link to="/admin" className="admin-brand"><img src="/icon-48.png" alt="" width="32" height="32" /><span>VAMORA<small>Administration</small></span></Link>
          <nav aria-label="Administration"><NavLink to="/admin" end><Icon name="trophy" size={20} />Competitions</NavLink>
            <NavLink to="/admin/virtual-players"><Icon name="people" size={20} />Virtual players</NavLink></nav>
          <div className="admin-sidebar-bottom"><span>Signed in as <strong>{session}</strong></span><button className="admin-button" onClick={logout}>Sign out</button></div>
        </aside>
        <main id="admin-content" className="admin-content">{error && <Notice error>{error}</Notice>}
          <Routes><Route index element={<AdminCompetitions />} /><Route path="competitions/:id" element={<AdminCompetition />} />
            <Route path="virtual-players" element={<AdminVirtualPlayers />} />
            <Route path="*" element={<div className="admin-empty"><h1>Page not found</h1><Link to="/admin">Back to competitions</Link></div>} /></Routes>
        </main></>}
  </div>;
}
