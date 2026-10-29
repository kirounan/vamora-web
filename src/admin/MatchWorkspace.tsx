import { matchSideName } from './api';
import { formNumber, formString } from './form';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi, changeRequest, dateTime, message, personName, readable } from './api';
import type { Competition, Match, MatchEvent } from './api';
import type { RunAction } from './AdminCompetition';
import { Empty, Field, Operation, Status } from './components';
import RecoveryPanel from './RecoveryPanel';

function eventLabel(competition: Competition, event: MatchEvent) {
  const player = competition.players.find((p) => p.userId === event.playerId)?.user;
  const substitute = competition.players.find((p) => p.userId === event.substitutePlayerId)?.user;
  return readable(event.eventType) + ' · ' + personName(player) + (substitute ? ' → ' + personName(substitute) : '');
}
function MatchClock({ match }: { match: Match }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  if (!match.actualStartTime) return <span>{match.duration ? match.duration + ' minute match' : 'Duration not set'}</span>;
  const end = match.actualEndTime ? new Date(match.actualEndTime).getTime() : now;
  const seconds = Math.max(0, Math.floor((end - new Date(match.actualStartTime).getTime()) / 1000));
  return <span className="admin-clock">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')} <small>elapsed{match.duration ? ' / ' + match.duration + ' min' : ''}</small></span>;
}
function EventForm({ competition, match, run, existing }: { competition: Competition; match: Match; run: RunAction; existing?: MatchEvent }) {
  const [side, setSide] = useState(existing?.teamType || 'HOME'); const [eventType, setEventType] = useState(existing?.eventType || (match.status === 'PENALTIES' ? 'PENALTY_SCORED' : 'GOAL'));
  const teamId = side === 'HOME' ? match.homeTeamId : match.awayTeamId;
  const rosterIds = competition.teams.find((t) => t.id === teamId)?.members.map((m) => m.userId) || (side === 'HOME' ? match.homePlayers : match.awayPlayers);
  const players = competition.players.filter((p) => rosterIds.includes(p.userId));
  const types = match.status === 'PENALTIES' ? ['PENALTY_SCORED', 'PENALTY_MISSED']
    : ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SAVE', 'OWN_GOAL', 'PENALTY_SCORED', 'PENALTY_MISSED', 'SUBSTITUTION', 'GOALKEEPER_CHANGE'];
  const options = players.map((p) => <option key={p.userId} value={p.userId}>{personName(p.user)}</option>);
  return <Operation title={existing ? 'Correct event' : 'Record a match event'} button={existing ? 'Save correction' : 'Record event'} onSubmit={async (form) => {
    const payload = { playerId: formString(form, 'playerId'), teamType: side, eventType,
      ...(formString(form, 'minute') ? { minute: formNumber(form, 'minute') } : {}),
      ...(formString(form, 'addedTime') ? { addedTime: formNumber(form, 'addedTime') } : {}),
      ...(eventType === 'GOAL' && formString(form, 'assistPlayerId') ? { assistPlayerId: formString(form, 'assistPlayerId') } : {}),
      ...(eventType === 'SUBSTITUTION' ? { substitutePlayerId: formString(form, 'substitutePlayerId') } : {}),
      ...(formString(form, 'description') ? { description: formString(form, 'description') } : {}),
    };
    return run(existing ? 'EDIT_EVENT' : 'ADD_EVENT', { matchId: match.id, ...(existing ? { eventId: existing.id } : {}), payload }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'));
  }}>
    <div className="admin-form-grid"><Field label="Side"><select value={side} onChange={(e) => setSide(e.target.value)}><option value="HOME">{matchSideName(competition, match, 'home')}</option><option value="AWAY">{matchSideName(competition, match, 'away')}</option></select></Field>
      <Field label="Event"><select value={eventType} onChange={(e) => setEventType(e.target.value)}>{types.map((t) => <option key={t} value={t}>{readable(t)}</option>)}</select></Field>
      <Field label={eventType === 'SUBSTITUTION' ? 'Player coming off' : 'Player'}><select name="playerId" key={side} defaultValue={existing?.playerId || ''} required><option value="">Choose player</option>{options}</select></Field>
      <Field label="Minute" hint={existing ? undefined : 'Leave blank to use the current match minute.'}><input name="minute" type="number" min={1} max={120} required={Boolean(existing)} defaultValue={existing?.minute || ''} /></Field>
      <Field label="Added time" hint="Optional, e.g. 45 + 2."><input name="addedTime" type="number" min={1} max={15} defaultValue={existing?.addedTime || ''} /></Field>
      {eventType === 'GOAL' && <Field label="Assist"><select name="assistPlayerId" defaultValue={existing?.assistPlayerId || ''}><option value="">No assist</option>{options}</select></Field>}
      {eventType === 'SUBSTITUTION' && <Field label="Player coming on"><select name="substitutePlayerId" defaultValue={existing?.substitutePlayerId || ''} required><option value="">Choose substitute</option>{options}</select></Field>}
      <Field label="Description" hint="Optional."><input name="description" maxLength={500} defaultValue={existing?.description || ''} /></Field>
    </div>
  </Operation>;
}
function Lineups({ competition, match, run }: { competition: Competition; match: Match; run: RunAction }) {
  return <Operation title="Edit starting lineups" button="Save lineups" recordRevision={match.updatedAt} description={'Select exactly ' + competition.playersInMatch + ' starters on each side and choose a goalkeeper.'} onSubmit={async (form) => {
    const home = form.getAll('home').map(String); const away = form.getAll('away').map(String);
    if (home.length !== competition.playersInMatch || away.length !== competition.playersInMatch) throw new Error('Select exactly ' + competition.playersInMatch + ' starters for each side.');
    return run('MATCH_LINEUPS', { matchId: match.id, payload: { expectedUpdatedAt: formString(form, 'recordUpdatedAt'),
      homePlayerIds: home, awayPlayerIds: away, homeGoalkeeperId: formString(form, 'homeGoalkeeperId'), awayGoalkeeperId: formString(form, 'awayGoalkeeperId') } },
      formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'));
  }}>
    <div className="admin-form-grid">{(['home', 'away'] as const).map((side) => {
      const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
      const starters = side === 'home' ? match.homePlayers : match.awayPlayers;
      const ids = competition.teams.find((t) => t.id === teamId)?.members.map((m) => m.userId) || starters;
      const players = competition.players.filter((p) => ids.includes(p.userId));
      return <div key={side}><h3>{matchSideName(competition, match, side)}</h3><div className="admin-lineup-list">{players.map((p) =>
        <label key={p.userId} className="admin-checkbox"><input type="checkbox" name={side} value={p.userId} defaultChecked={starters.includes(p.userId)} />{personName(p.user)}</label>)}</div>
        <Field label="Starting goalkeeper"><select name={side + 'GoalkeeperId'} required defaultValue={(side === 'home' ? match.homeGoalkeeperId : match.awayGoalkeeperId) || ''}><option value="">Choose goalkeeper</option>{players.map((p) => <option key={p.userId} value={p.userId}>{personName(p.user)}</option>)}</select></Field></div>;
    })}</div>
  </Operation>;
}
export default function MatchWorkspace({ competition, run, saved, editable }: { competition: Competition; run: RunAction; saved: () => Promise<void>; editable: boolean }) {
  const [params,setParams]=useSearchParams(); const selectedId=params.get('matchId')||'', filter=params.get('matchStatus')||'ALL';
  const setSelectedId=(id:string)=>setParams(old=>{const next=new URLSearchParams(old);next.set('matchId',id);return next;});
  const setFilter=(value:string)=>setParams(old=>{const next=new URLSearchParams(old);if(value==='ALL')next.delete('matchStatus');else next.set('matchStatus',value);return next;});
  const [editEvent, setEditEvent] = useState<MatchEvent | null>(null);
  const [timingError, setTimingError] = useState('');
  const matches = [...competition.matches].sort((a, b) => Number(['LIVE', 'PENALTIES'].includes(b.status)) - Number(['LIVE', 'PENALTIES'].includes(a.status)));
  const match = matches.find((m) => m.id === selectedId) || matches[0];
  if (!match) return <Empty title="No matches yet">{competition.type === 'GAMEDAY' ? 'Create a match in Fixtures & bracket when the teams are ready.' : 'Assign groups and generate fixtures to prepare the tournament.'}</Empty>;
  const running = ['LIVE', 'PENALTIES'].includes(match.status);
  const operation = (action: string, form: FormData, extra: Record<string, unknown> = {}) =>
    run(action, { matchId: match.id, ...extra }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'));
  return <div className="admin-match-workspace"><aside className="admin-match-list" aria-label="Choose match">
    <Field label="Match status"><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="ALL">All matches</option>{['SCHEDULED', 'LIVE', 'PENALTIES', 'COMPLETED', 'CANCELLED'].map((s) => <option key={s}>{s}</option>)}</select></Field>
    {matches.filter((m) => filter === 'ALL' || m.status === filter).map((m) => <button key={m.id} className={m.id === match.id ? 'is-selected' : ''} onClick={() => { setSelectedId(m.id); setEditEvent(null); }}>
      <span className="admin-match-list-top"><Status value={m.status} /><span>{competition.rounds.find((r) => r.id === m.roundId)?.name || 'Gameday'}</span></span>
      <span>{matchSideName(competition, m, 'home')}<strong>{m.homeScore ?? '–'}</strong></span><span>{matchSideName(competition, m, 'away')}<strong>{m.awayScore ?? '–'}</strong></span>
      <small>{dateTime(m.scheduledTime)}</small>
    </button>)}
  </aside><section className="admin-match-detail" key={match.id}>
    <div className="admin-scoreboard"><div className="admin-scoreboard-status"><Status value={match.status} /><MatchClock match={match} /></div>
      <div className="admin-score"><h2>{matchSideName(competition, match, 'home')}</h2><strong>{match.homeScore ?? '–'}<span>:</span>{match.awayScore ?? '–'}</strong><h2>{matchSideName(competition, match, 'away')}</h2></div>
      {match.homePenaltyScore !== null && <p>Penalties: {match.homePenaltyScore} – {match.awayPenaltyScore}</p>}
      <p className="admin-muted">{match.venue || competition.location} · {dateTime(match.scheduledTime)}</p>
    </div>
    <div className="admin-event-heading"><h2>Match events</h2><span>{match.events.length} recorded</span></div>
    {!match.events.length ? <Empty title="No events recorded">Events appear here as the match unfolds.</Empty> : <ol className="admin-event-list">{[...match.events].reverse().map((e) =>
      <li key={e.id}><time>{e.minute}{e.addedTime ? '+' + e.addedTime : ''}′</time><div><strong>{eventLabel(competition, e)}</strong><small>{e.teamType === 'HOME' ? matchSideName(competition, match, 'home') : matchSideName(competition, match, 'away')}{e.isShootout ? ' · Shootout' : ''}</small></div>
        {editable && match.status === 'LIVE' && <button className="admin-button" onClick={() => setEditEvent(editEvent?.id === e.id ? null : e)}>Correct<span className="admin-sr"> event at minute {e.minute}</span></button>}</li>)}</ol>}
    {editable && <div className="admin-match-controls">
      {running && <><EventForm key={match.id + match.status} competition={competition} match={match} run={run} />
        <Operation title="Set player of the match" onSubmit={(form) => operation('PLAYER_OF_MATCH', form, { userId: formString(form, 'userId'), teamType: formString(form, 'teamType') })}>
          <div className="admin-form-grid"><Field label="Player"><select name="userId" required><option value="">Choose player</option>{competition.players.filter((p) =>
            [...match.homePlayers, ...match.awayPlayers].includes(p.userId) || match.events.some((e) => e.substitutePlayerId === p.userId)).map((p) => <option key={p.userId} value={p.userId}>{personName(p.user)}</option>)}</select></Field>
            <Field label="Side"><select name="teamType"><option value="HOME">{matchSideName(competition, match, 'home')}</option><option value="AWAY">{matchSideName(competition, match, 'away')}</option></select></Field></div>
        </Operation>
        {editEvent && <div className="admin-edit-panel"><EventForm key={editEvent.id} existing={editEvent} competition={competition} match={match} run={run} />
          <Operation title="Delete this event" danger button="Delete event" onSubmit={async (form) => { await operation('DELETE_EVENT', form, { eventId: editEvent.id }); setEditEvent(null); }} /></div>}
        <Operation title="Undo the last event" button="Undo last event" danger onSubmit={(form) => operation('UNDO_EVENT', form)} />
        {match.status === 'LIVE' && <Operation title="Finish match" button="Finish match" onSubmit={(form) => operation('FINISH_MATCH', form)} />}
        {match.status === 'LIVE' && !match.groupId && competition.type === 'GROUP_KNOCKOUT' && <Operation title="Start penalty shootout" onSubmit={(form) => operation('START_SHOOTOUT', form)} />}
        <Operation title="Take over match operation" onSubmit={(form) => operation('TAKEOVER_MATCH', form)} />
      </>}
      {match.status === 'SCHEDULED' && <><Lineups competition={competition} match={match} run={run} /><Operation title="Start match" button="Start match" onSubmit={(form) => operation('START_MATCH', form)} /></>}
      {!['COMPLETED', 'CANCELLED'].includes(match.status) && <Operation title="Adjust time or venue" revision={match.updatedAt} onSubmit={async (form) => {
        setTimingError('');
        try { const updated = await adminApi<{ updatedAt: string }>('/matches/' + match.id + '/timing', 'PATCH', {
          ...changeRequest(formString(form, 'reason'), formString(form, 'requestId')), expectedUpdatedAt: formString(form, 'expectedUpdatedAt'),
          ...(formString(form, 'scheduledTime') ? { scheduledTime: new Date(formString(form, 'scheduledTime')).toISOString() } : {}),
          ...(formString(form, 'duration') ? { duration: formNumber(form, 'duration') } : {}),
          ...(formString(form, 'elapsed') ? { elapsedSeconds: Math.round(formNumber(form, 'elapsed') * 60) } : {}),
          ...(formString(form, 'venue') ? { venue: formString(form, 'venue') } : {}),
        }); await saved(); return updated.updatedAt; } catch (error) { setTimingError(message(error)); throw error; }
      }}>
        <div className="admin-form-grid"><Field label="Scheduled time"><input name="scheduledTime" type="datetime-local" /></Field>
          <Field label="Duration in minutes"><input name="duration" type="number" min={1} max={180} defaultValue={match.duration || ''} /></Field>
          {match.actualStartTime && <Field label="Set elapsed minutes" hint="Adjusts kickoff to keep the existing app clock in sync after refresh."><input name="elapsed" type="number" min={0} max={240} step="0.1" /></Field>}
          <Field label="Venue"><select name="venue" defaultValue={match.venue || competition.location}>{[competition.location, ...competition.additionalLocations].map((v) => <option key={v}>{v}</option>)}</select></Field>
        </div>{timingError && <p className="admin-sr">{timingError}</p>}
      </Operation>}
      {match.status === 'COMPLETED' && !match.groupId && competition.type === 'GROUP_KNOCKOUT' && <Operation title={match.winnerTeamId ? 'Correct confirmed winner' : 'Confirm knockout winner'} onSubmit={(form) => operation(match.winnerTeamId ? 'CORRECT_WINNER' : 'CONFIRM_WINNER', form, { payload: {
        winnerTeamId: formString(form, 'winnerTeamId'), ...(formString(form, 'homePenaltyScore') ? { homePenaltyScore: formNumber(form, 'homePenaltyScore'), awayPenaltyScore: formNumber(form, 'awayPenaltyScore') } : {}),
      } })}><Field label="Winner"><select name="winnerTeamId" required><option value="">Choose winner</option>{[match.homeTeamId, match.awayTeamId].filter(Boolean).map((id) => <option key={id} value={id!}>{competition.teams.find((t) => t.id === id)?.name}</option>)}</select></Field>
        <div className="admin-form-grid"><Field label="Home shootout score, if tied"><input name="homePenaltyScore" type="number" min={0} max={50} /></Field><Field label="Away shootout score, if tied"><input name="awayPenaltyScore" type="number" min={0} max={50} /></Field></div></Operation>}
      {match.groupId && ['SCHEDULED', 'LIVE', 'COMPLETED'].includes(match.status) && <Operation title="Resolve a withdrawal" button="Confirm withdrawal" onSubmit={(form) => operation('GROUP_RESOLUTION', form, { payload: { resolution: 'WITHDRAWAL', winnerTeamId: formString(form, 'winnerTeamId') } })}>
        <Field label="Award the match to"><select name="winnerTeamId" required><option value="">Choose team</option>{[match.homeTeamId, match.awayTeamId].map((id) => <option key={id} value={id!}>{competition.teams.find((t) => t.id === id)?.name}</option>)}</select></Field></Operation>}
      <RecoveryPanel competition={competition} match={match} saved={saved} />
    </div>}
  </section></div>;
}
