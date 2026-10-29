import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { adminApi, changeRequest, formatName, message, personName } from './api';
import type { Competition, Person } from './api';
import { Empty, Field, Loading, Notice, Operation, Status } from './components';
import { formString } from './form';
import { CompetitionRevision } from './revision';
import PlayerEnrollment from './PlayerEnrollment';
import MatchWorkspace from './MatchWorkspace';
import { ActivityPanel, FixturesPanel, ResultsPanel, SettingsPanel, TeamsPanel } from './TournamentPanels';
import { AdminNotFound, AnalyticsTabs, AnalyticsReport, CompetitionAnalytics } from './AnalyticsViews';
export type RunAction = (action: string, data: Record<string, unknown>, reason: string, requestId?: string, revision?: string) => Promise<string>;
export default function AdminCompetition() {
  const { id, section } = useParams(); const [data, setData] = useState<Competition | null>(null);
  const navigate = useNavigate(), location = useLocation(); const [searchParams, setSearchParams] = useSearchParams();
  const names:Record<string,string>={live:'Live matches',overview:'Overview',players:'Players',teams:'Teams',fixtures:'Fixtures & bracket',results:'Results',fantasy:'Fantasy',ratings:'Ratings',settings:'Settings',activity:'Activity'};
  const tab=names[section||'live'];
  const setTab=(name:string)=>{const key=Object.keys(names).find(k=>names[k]===name)||'live';navigate('/admin/competitions/'+id+'/'+key+location.search);};
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollment, setEnrollment] = useState<{ person: Person | null; key: number } | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null); const playerSearch=searchParams.get('playerSearch')||'';
  const setPlayerSearch=(value:string)=>setSearchParams(old=>{const next=new URLSearchParams(old);if(value)next.set('playerSearch',value);else next.delete('playerSearch');next.delete('page');return next;});
  const latest = useRef(0); const enrollmentRef = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    const version = ++latest.current;
    try { const result = await adminApi<Competition>('/competitions/' + id); if (version === latest.current) { setData(result); setError(''); setUpdated(new Date()); } return result; }
    catch (error) { if (version === latest.current) setError(message(error)); }
  }, [id]);
  useEffect(() => { const counter = latest; const first = setTimeout(() => { void load(); }, 0);
    const timer = setInterval(() => { if (!document.hidden) void load(); }, 5000);
    return () => { clearTimeout(first); clearInterval(timer); counter.current++; }; }, [load]);
  useEffect(() => { if (enrollment) enrollmentRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, [enrollment]);
  async function run(action: string, payload: Record<string, unknown>, reason: string, requestId?: string, revision?: string) {
    if (!data) return '';
    await adminApi('/competitions/' + data.id + '/actions', 'POST', {
      ...changeRequest(reason, requestId), expectedUpdatedAt: revision || data.updatedAt, action, data: payload,
    }); const refreshed = await load(); return refreshed?.updatedAt || data.updatedAt;
  }
  if(!tab)return <AdminNotFound/>;
  if (!data) return <><Link className="admin-back" to="/admin/competitions">Back to competitions</Link>{error ? <Notice error>{error}<button className="admin-button" onClick={() => void load()}>Retry</button></Notice> : <Loading />}</>;
  const editable = ['GAMEDAY', 'GROUP_KNOCKOUT'].includes(data.type);
  const canEnroll = editable && ['DRAFT', 'OPEN', 'ONGOING'].includes(data.status);
  const live = data.matches.filter((m) => ['LIVE', 'HALFTIME', 'PENALTIES'].includes(m.status));
  const unassigned = data.players.filter((p) => p.participationType === 'ACTUAL_PLAYER' && !data.teams.some((t) => t.members.some((m) => m.userId === p.userId)));
  return <CompetitionRevision.Provider value={data.updatedAt}><Link className="admin-back" to="/admin">Back to competitions</Link>
    <header className="admin-page-heading"><div><div className="admin-title-line"><h1>{data.name}</h1><Status value={data.status} /></div>
      <p>{formatName(data.type)} · <span className="admin-code">{data.uniqueCode}</span> · {data.location}</p></div>
      {canEnroll && <button className="admin-button primary" onClick={() => setEnrollment({ person: null, key: Date.now() })}><Icon name="plus" size={18} />Add player</button>}
    </header>
    <div className="admin-context-line"><span>{data.players.length} participants · {data.teams.length} teams · {live.length} live</span>
      <span>{updated ? 'Updated ' + updated.toLocaleTimeString('en-GB') : 'Refreshing…'}<button className="admin-text-button" onClick={() => void load()}>Refresh</button></span></div>
    {error && <Notice error>{error} Existing data is shown. Refresh before making another change.</Notice>}
    {!editable && <Notice>This format is read-only. Full administration is available for Gameday and Hybrid.</Notice>}
    {canEnroll && unassigned.length > 0 && data.teams.length > 0 && <div className="admin-attention"><span>{unassigned.length} actual {unassigned.length === 1 ? 'player needs' : 'players need'} a team.</span><button className="admin-text-button" onClick={() => setTab('Players')}>Review players</button></div>}
    {success && <Notice>{success} <button className="admin-text-button" onClick={() => { setTab('Players'); setSuccess(''); }}>View players</button></Notice>}
    <div ref={enrollmentRef}>{enrollment && <PlayerEnrollment key={enrollment.key} competition={data} initialPlayer={enrollment.person} close={() => setEnrollment(null)} saved={async (result) => {
      await load(); const team = data.teams.find((t) => t.id === result.teamId);
      setSuccess(personName(result.user) + (team ? ' was added to ' + team.name + ' as a substitute.' : ' was enrolled without a team.'));
    }} />}</div>
    <AnalyticsTabs base={'/admin/competitions/'+id} tabs={Object.entries(names)}/>
    {['overview','fantasy','ratings'].includes(section||'')&&<CompetitionAnalytics id={data.id} section={section!}/>}
    {tab === 'Live matches' && <MatchWorkspace competition={data} run={run} saved={async () => { await load(); }} editable={editable} />}
    {tab === 'Players' && <section><div className="admin-section-heading"><h2>Players</h2><FieldSearch value={playerSearch} set={setPlayerSearch} /></div>
      {!data.players.length ? <Empty title="No players yet">Use Add player to enroll a registered player or a virtual guest.</Empty> : <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Player</th><th>Participation</th><th>Team</th><th>Availability</th><th>Assign</th></tr></thead><tbody>
          {data.players.filter((p) => (personName(p.user) + ' ' + (p.user.nickname || '')).toLowerCase().includes(playerSearch.toLowerCase())).map((p) => {
            const team = data.teams.find((t) => t.members.some((m) => m.userId === p.userId));
            return <tr key={p.id}><td><strong>{personName(p.user)}</strong><small>{p.isVirtual ? 'Virtual player' : 'Registered player'} · <span className="admin-code">{p.userId.slice(-8)}</span></small></td>
              <td>{p.participationType.toLowerCase().replaceAll('_', ' ')}</td><td>{team?.name || 'Unassigned'}</td><td><Status value={p.state} /></td>
              <td>{canEnroll && !team && <button className="admin-button" onClick={() => setEnrollment({ person: p.user, key: Date.now() })}>Assign team</button>}</td></tr>;
          })}</tbody></table></div>}
      {editable && <Operation title="Change participation or availability" onSubmit={(form) => {
        const field = formString(form, 'kind') === 'state' ? 'state' : 'participationType';
        return run(field === 'state' ? 'PLAYER_STATE' : 'PARTICIPATION_TYPE', { userId: formString(form, 'userId'), [field]: formString(form, field) },
          formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'));
      }}>
        <div className="admin-form-grid"><Field label="Participant"><select name="userId" required><option value="">Choose participant</option>{data.players.map((p) => <option key={p.userId} value={p.userId}>{personName(p.user)}</option>)}</select></Field>
          <Field label="Change"><select name="kind"><option value="state">Availability</option><option value="type">Participation type</option></select></Field>
          <Field label="Availability"><select name="state">{['AVAILABLE', 'INJURED', 'SUSPENDED'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Participation type"><select name="participationType">{['ACTUAL_PLAYER', 'FANTASY_ONLY', 'SPECTATOR'].map((s) => <option key={s} value={s}>{s.toLowerCase().replaceAll('_', ' ')}</option>)}</select></Field>
        </div><p className="admin-muted">Players with match history keep their actual-player participation. Availability can still be updated.</p>
      </Operation>}
    </section>}
    {tab === 'Teams' && <TeamsPanel competition={data} run={run} editable={editable} />}
    {tab === 'Fixtures & bracket' && <FixturesPanel competition={data} run={run} editable={editable} />}
    {tab === 'Results' && <ResultsPanel competition={data} editable={editable} saved={async () => { await load(); }} />}
    {tab === 'Settings' && <SettingsPanel competition={data} run={run} editable={editable} saved={async () => { await load(); }} />}
    {tab === 'Activity' && <><AnalyticsReport resource="activity" scope={{competitionId:data.id}} heading={false}/><ActivityPanel competitionId={data.id} /></>}
  </CompetitionRevision.Provider>;
}
function FieldSearch({ value, set }: { value: string; set: (value: string) => void }) {
  return <label className="admin-inline-search"><span className="admin-sr">Search players</span><input type="search" placeholder="Search players" value={value} onChange={(e) => set(e.target.value)} /></label>;
}
