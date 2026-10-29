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
import { AnalyticsOverview, AnalyticsReport, AnalyticsSectionPage, AnalyticsEntityPage, AnalyticsRecordPage, AdminIndexRedirect, AdminCompetitionRedirect, AdminNotFound } from './AnalyticsViews';
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
  const [navigationOpen,setNavigationOpen]=useState(false);
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
          <button className="admin-button admin-navigation-toggle" aria-expanded={navigationOpen} aria-controls="admin-navigation" onClick={()=>setNavigationOpen(!navigationOpen)}><Icon name="menu" size={18}/>Browse administration</button>
          <nav id="admin-navigation" className={navigationOpen?'is-open':''} aria-label="Administration">{[['overview','Overview'],['competitions','Competitions'],['users','Users'],['matches','Matches'],['ratings','Ratings'],['fantasy','Fantasy'],['teams','Teams'],['community','Community'],['operations','Operations'],['virtual-players','Virtual players']].map(([path,title])=><NavLink key={path} to={'/admin/'+path} onClick={()=>{setNavigationOpen(false);document.getElementById('admin-content')?.focus();}}><Icon name={path==='competitions'?'trophy':path==='matches'?'ball':'people'} size={20}/>{title}</NavLink>)}</nav>
          <div className="admin-sidebar-bottom"><span>Signed in as <strong>{session}</strong></span><button className="admin-button" onClick={logout}>Sign out</button></div>
        </aside>
        <main id="admin-content" tabIndex={-1} className="admin-content">{error && <Notice error>{error}</Notice>}
          <Routes><Route index element={<AdminIndexRedirect />} /><Route path="overview" element={<AnalyticsOverview/>}/>
            <Route path="competitions" element={<AdminCompetitions/>}/><Route path="competitions/:id" element={<AdminCompetitionRedirect/>}/><Route path="competitions/:id/:section" element={<AdminCompetition />} />
            <Route path="users" element={<AnalyticsReport resource="users"/>}/><Route path="users/:userId/:section?" element={<AnalyticsEntityPage kind="users"/>}/>
            <Route path="matches" element={<AnalyticsReport resource="matches"/>}/><Route path="matches/:matchId/:section?" element={<AnalyticsEntityPage kind="matches"/>}/>
            <Route path="teams" element={<AnalyticsReport resource="teams"/>}/><Route path="teams/:teamId/:section?" element={<AnalyticsEntityPage kind="teams"/>}/>
            <Route path="ratings/changes/:recordId" element={<AnalyticsRecordPage resource="ratings"/>}/><Route path="ratings/:section?" element={<AnalyticsSectionPage area="ratings"/>}/>
            <Route path="fantasy/managers/:participantId/:section?" element={<AnalyticsEntityPage kind="participants"/>}/><Route path="fantasy/markets/:marketId" element={<AnalyticsRecordPage resource="markets"/>}/><Route path="fantasy/:section?" element={<AnalyticsSectionPage area="fantasy"/>}/>
            <Route path="community/:section?" element={<AnalyticsSectionPage area="community"/>}/><Route path="operations/:section?" element={<AnalyticsSectionPage area="operations"/>}/>
            <Route path="records/:resource/:recordId" element={<AnalyticsRecordPage/>}/>
            <Route path="virtual-players" element={<AdminVirtualPlayers />} />
            <Route path="*" element={<AdminNotFound/>} /></Routes>
        </main></>}
  </div>;
}
