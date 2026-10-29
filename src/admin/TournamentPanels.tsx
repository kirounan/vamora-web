import { formNumber, formString } from './form';
import { useEffect, useState } from 'react';
import { adminApi, adminUpload, apiOrigin, dateTime, message, personName, readable } from './api';
import type { Competition } from './api';
import type { RunAction } from './AdminCompetition';
import { Empty, Field, Loading, Notice, Operation, Status } from './components';
import RecoveryPanel from './RecoveryPanel';
import { matchSideName } from './api';
export function TeamsPanel({ competition: c, run, editable }: { competition: Competition; run: RunAction; editable: boolean }) {
  const [selected, setSelected] = useState('');
  const team = c.teams.find((t) => t.id === selected);
  return <section><h2>Teams & rosters</h2>
    {editable && ['DRAFT', 'OPEN'].includes(c.status) && <Operation title="Create team" button="Create team" onSubmit={(form) => run('CREATE_TEAM', { name: formString(form, 'name') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
      <Field label="Team name"><input name="name" required maxLength={100} /></Field></Operation>}
    {!c.teams.length ? <Empty title="No teams yet">Create teams, then assign players from the Players tab.</Empty> : <div className="admin-team-grid">{c.teams.map((t) => <article className="admin-team" key={t.id}>
      <div className="admin-section-heading"><h3>{t.name}</h3><Status value={t.approvalStatus} /></div>
      <p className="admin-muted">{t.members.length}/{c.maxPlayersPerTeam} players · {c.groups.find((g) => g.id === t.groupId)?.name || 'No group'}</p>
      <ul className="admin-roster">{t.members.map((m) => <li key={m.userId}><span>{personName(m.user)}</span><small>{t.captainId === m.userId ? 'Captain' : m.isStarter ? 'Starter' : 'Squad'}</small></li>)}</ul>
      {!t.members.length && <p className="admin-muted">No players assigned.</p>}
      {editable && <button className="admin-button" onClick={() => setSelected(selected === t.id ? '' : t.id)}>Manage team</button>}
    </article>)}</div>}
    {team && editable && <section className="admin-edit-panel" key={team.id}><div className="admin-section-heading"><h2>{team.name}</h2><button className="admin-button" onClick={() => setSelected('')}>Close</button></div>
      <Operation title="Rename team" onSubmit={(form) => run('RENAME_TEAM', { teamId: team.id, name: formString(form, 'name') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Team name"><input name="name" defaultValue={team.name} required maxLength={100} /></Field></Operation>
      <Operation title="Change captain" onSubmit={(form) => run('CHANGE_CAPTAIN', { teamId: team.id, userId: formString(form, 'userId') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Captain"><select name="userId" required defaultValue={team.captainId || ''}><option value="">Choose registered member</option>{team.members.filter((m) => !c.players.find((p) => p.userId === m.userId)?.isVirtual).map((m) => <option key={m.userId} value={m.userId}>{personName(m.user)}</option>)}</select></Field></Operation>
      <Operation title="Remove member" button="Remove from team" danger onSubmit={(form) => run('REMOVE_TEAM_MEMBER', { teamId: team.id, userId: formString(form, 'userId') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Player"><select name="userId" required><option value="">Choose member</option>{team.members.map((m) => <option key={m.userId} value={m.userId}>{personName(m.user)}</option>)}</select></Field></Operation>
      <Operation title="Update player availability" onSubmit={(form) => run('PLAYER_STATE', { userId: formString(form, 'userId'), state: formString(form, 'state') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <div className="admin-form-grid"><Field label="Player"><select name="userId" required><option value="">Choose member</option>{team.members.map((m) => <option key={m.userId} value={m.userId}>{personName(m.user)}</option>)}</select></Field>
          <Field label="Availability"><select name="state">{['AVAILABLE', 'INJURED', 'SUSPENDED'].map((s) => <option key={s}>{s}</option>)}</select></Field></div></Operation>
      {team.approvalStatus === 'PENDING' && <Operation title="Review team approval" onSubmit={(form) => run('TEAM_DECISION', { teamId: team.id, status: formString(form, 'status') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Decision"><select name="status"><option value="APPROVED">Approve team</option><option value="CANCELLED">Decline team</option></select></Field></Operation>}
      {['DRAFT', 'OPEN'].includes(c.status) && <Operation title="Delete unstarted team" button="Delete team" danger description="Existing fixture and setup restrictions still apply. Remove generated fixtures first when required."
        onSubmit={async (form) => { await run('DELETE_TEAM', { teamId: team.id }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt')); setSelected(''); }} />}
    </section>}
    {editable && c.captainRequests?.filter((r) => r.status === 'PENDING' || r.status === 'APPROVED').map((request) =>
      <Operation key={request.id} title={'Captain request · ' + personName(request.applicant) + ' · ' + readable(request.status)} onSubmit={(form) =>
        run('CAPTAIN_REQUEST', { requestId: request.id, decision: formString(form, 'decision') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Decision"><select name="decision">{request.status === 'PENDING' ? <><option value="approve">Approve</option><option value="decline">Decline</option></> : <option value="release">Release unused reservation</option>}</select></Field>
      </Operation>)}
  </section>;
}
export function FixturesPanel({ competition: c, run, editable }: { competition: Competition; run: RunAction; editable: boolean }) {
  const [mode, setMode] = useState('RANDOM');
  const approved = c.teams.filter((t) => t.approvalStatus === 'APPROVED');
  return <section><h2>Fixtures & bracket</h2>
    {editable && c.type === 'GAMEDAY' && <Operation title="Create match" button="Create match" onSubmit={(form) => run('CREATE_MATCH', {
      homeTeamId: formString(form, 'homeTeamId'), awayTeamId: formString(form, 'awayTeamId'),
      duration: formNumber(form, 'duration'), ...(formString(form, 'scheduledTime') ? { scheduledTime: new Date(formString(form, 'scheduledTime')).toISOString() } : {}),
    }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
      <div className="admin-form-grid">{['homeTeamId', 'awayTeamId'].map((key) => <Field key={key} label={key === 'homeTeamId' ? 'Home team' : 'Away team'}><select name={key} required><option value="">Choose team</option>{approved.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>)}
        <Field label="Duration in minutes"><input name="duration" type="number" min={1} max={180} defaultValue={15} required /></Field>
        <Field label="Scheduled time"><input name="scheduledTime" type="datetime-local" /></Field></div>
    </Operation>}
    {editable && c.type === 'GROUP_KNOCKOUT' && ['DRAFT', 'OPEN'].includes(c.status) && <>
      <Operation title="Assign teams to groups" onSubmit={(form) => run('ASSIGN_GROUPS', {
        assignmentMode: mode, ...(mode === 'MANUAL' ? { groups: Array.from({ length: c.groupKnockoutSettings?.numberOfGroups || 2 }, (_, index) => ({
          name: 'Group ' + String.fromCharCode(65 + index), teamIds: approved.filter((t) => formString(form, t.id) === String(index)).map((t) => t.id),
        })) } : {}),
      }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Assignment"><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="RANDOM">Random draw</option><option value="MANUAL">Assign each team</option></select></Field>
        {mode === 'MANUAL' && <div className="admin-form-grid">{approved.map((t) => <Field key={t.id} label={t.name}><select name={t.id} required><option value="">Choose group</option>{Array.from({ length: c.groupKnockoutSettings?.numberOfGroups || 2 }, (_, index) => <option key={index} value={index}>Group {String.fromCharCode(65 + index)}</option>)}</select></Field>)}</div>}
      </Operation>
      <Operation title="Confirm group assignment" onSubmit={(form) => run('CONFIRM_GROUPS', {}, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))} />
      <Operation title="Generate fixtures" onSubmit={(form) => run('GENERATE_FIXTURES', {
        defaultMatchDuration: formNumber(form, 'duration'), roundIntervalDays: formNumber(form, 'interval'),
        ...(formString(form, 'start') ? { firstRoundStartTime: new Date(formString(form, 'start')).toISOString() } : {}),
      }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}><div className="admin-form-grid">
        <Field label="First matchday"><input name="start" type="datetime-local" /></Field>
        <Field label="Days between matchdays"><input name="interval" type="number" min={0} max={365} defaultValue={0} required /></Field>
        <Field label="Match duration in minutes"><input name="duration" type="number" min={1} max={Math.min(c.duration, 180)} defaultValue={c.groupKnockoutSettings?.defaultMatchDuration || 15} required /></Field></div></Operation>
      <Operation title="Delete unstarted fixtures" danger button="Delete fixtures" onSubmit={(form) => run('DELETE_FIXTURES', {}, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))} description="Only available before matches have started. Teams and group assignments are retained." />
    </>}
    {c.groups.length > 0 && <div className="admin-group-grid">{c.groups.map((g) => <article key={g.id}><h3>{g.name}</h3><ul className="admin-roster">{c.teams.filter((t) => t.groupId === g.id).map((t) => <li key={t.id}>{t.name}</li>)}</ul></article>)}</div>}
    {c.rounds.map((round) => <section className="admin-round" key={round.id}><div className="admin-section-heading"><h3>{round.name}</h3><Status value={round.status} /></div>
      {c.matches.filter((m) => m.roundId === round.id).map((m) => <div className="admin-fixture" key={m.id}><span>{matchSideName(c, m, 'home')} <strong>{m.homeScore ?? '–'} : {m.awayScore ?? '–'}</strong> {matchSideName(c, m, 'away')}</span><Status value={m.status} /><small>{dateTime(m.scheduledTime)}</small></div>)}
      {editable && ['OPEN', 'LOCKED'].includes(round.status) && <Operation title={'Manage ' + round.name} onSubmit={(form) => run(formString(form, 'operation'), { roundId: round.id }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Round action"><select name="operation"><option value="LOCK_ROUND">Lock fantasy selections</option><option value="FINALIZE_ROUND">Finalize completed matches and advance</option></select></Field></Operation>}
    </section>)}
    {c.tournamentSlots.length > 0 && <section className="admin-bracket"><h2>Knockout bracket</h2>{[...new Set(c.tournamentSlots.map((s) => s.bracketRound))].map((round) =>
      <div key={round}><h3>Knockout round {round}</h3>{c.tournamentSlots.filter((s) => s.bracketRound === round).map((s) => <div className="admin-fixture" key={s.id}>
        <span>{s.isThirdPlace && 'Third place · '}{c.teams.find((t) => t.id === s.homeTeamId)?.name || 'To be qualified'} vs {c.teams.find((t) => t.id === s.awayTeamId)?.name || 'To be qualified'}</span>
        <Status value={s.status} />{s.winnerTeamId && <small>Winner: {c.teams.find((t) => t.id === s.winnerTeamId)?.name}</small>}
      </div>)}</div>)}</section>}
    {editable && c.type === 'GROUP_KNOCKOUT' && c.status === 'ONGOING' && <HybridDecisions competition={c} run={run} />}
    {!c.matches.length && !c.rounds.length && <Empty title="No fixtures yet">Prepare teams and groups before generating the schedule.</Empty>}
  </section>;
}
function HybridDecisions({ competition: c, run }: { competition: Competition; run: RunAction }) {
  const [overview, setOverview] = useState<{ pendingTieBreaks: { scopeKey: string; tieKey: string; teamIds: string[] }[] } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; adminApi<typeof overview>('/competitions/' + c.id + '/overview').then((r) => { if (active) setOverview(r); }).catch((e) => { if (active) setError(message(e)); }); return () => { active = false; }; }, [c.id, c.updatedAt]);
  const slots = c.tournamentSlots.filter((s) => s.bracketRound === 1 && !s.isThirdPlace);
  return <>{error && <Notice error>{error}</Notice>}{overview?.pendingTieBreaks.map((tie) =>
    <Operation key={tie.tieKey} title="Resolve qualification tie" onSubmit={(form) => {
      const orderedTeamIds = tie.teamIds.map((_, i) => formString(form, 'rank-' + i));
      if (new Set(orderedTeamIds).size !== orderedTeamIds.length) return Promise.reject(new Error('Choose each tied team exactly once.'));
      return run('RESOLVE_TIE', { scopeKey: tie.scopeKey, orderedTeamIds, reason: formString(form, 'reason') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'));
    }}><div className="admin-form-grid">{tie.teamIds.map((_, i) => <Field key={i} label={'Position ' + (i + 1)}><select name={'rank-' + i} required><option value="">Choose tied team</option>{tie.teamIds.map((id) => <option key={id} value={id}>{c.teams.find((t) => t.id === id)?.name}</option>)}</select></Field>)}</div></Operation>)}
    {c.groupKnockoutSettings?.knockoutSeedingMode === 'MANUAL' && slots.length > 0 && <Operation title="Set manual knockout draw" onSubmit={(form) => run('MANUAL_BRACKET', { assignments: slots.map((slot) => ({
      slotId: slot.id, homeTeamId: formString(form, slot.id + '-home'), awayTeamId: formString(form, slot.id + '-away'),
    })) }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
      {slots.map((slot, index) => <div key={slot.id} className="admin-form-grid">{['home', 'away'].map((side) => <Field key={side} label={'Match ' + (index + 1) + ' · ' + side}><select name={slot.id + '-' + side} required><option value="">Choose qualified team</option>{c.teams.filter((t) => t.approvalStatus === 'APPROVED').map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>)}</div>)}
    </Operation>}
  </>;
}
export function ResultsPanel({ competition: c, editable, saved }: { competition: Competition; editable: boolean; saved: () => Promise<void> }) {
  return <section><h2>Results & fantasy</h2><div className="admin-group-grid">{c.groups.map((g) => <article key={g.id}><h3>{g.name}</h3><table className="admin-table"><thead><tr><th>Team</th><th>Played</th><th>GD</th><th>Pts</th></tr></thead><tbody>
    {[...g.standings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference).map((s) => <tr key={s.teamId}><td>{c.teams.find((t) => t.id === s.teamId)?.name}</td><td>{s.played}</td><td>{s.goalDifference}</td><td>{s.points}</td></tr>)}
  </tbody></table></article>)}</div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Player</th><th>Matches</th><th>Goals</th><th>Assists</th><th>Performance pts</th><th>Manager pts</th></tr></thead><tbody>
    {[...c.players].sort((a, b) => b.fantasyPoints - a.fantasyPoints).map((p) => <tr key={p.id}><td>{personName(p.user)}</td><td>{p.matchesPlayed}</td><td>{p.goals}</td><td>{p.assists}</td><td>{p.fantasyPoints}</td><td>{p.fantasyManagerPoints}</td></tr>)}
  </tbody></table></div>{editable && c.status === 'COMPLETED' && <ResultPhotos competition={c} saved={saved} />}</section>;
}
function ResultPhotos({ competition: c, saved }: { competition: Competition; saved: () => Promise<void> }) {
  const [summary, setSummary] = useState<{ winner?: { id: string; name: string }; runnerUp?: { id: string; name: string }; thirdPlace?: { id: string; name: string }; fantasyAwardSubjectId?: string; fantasyWinner?: { userId: string } } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; adminApi<typeof summary>('/competitions/' + c.id + '/results').then((result) => { if (active) setSummary(result); }).catch((e) => { if (active) setError(message(e)); }); return () => { active = false; }; }, [c.id, c.updatedAt]);
  const slots = [
    { slot: 'WINNER', label: 'Winning team', subjectId: summary?.winner?.id },
    { slot: 'RUNNER_UP', label: 'Runner-up', subjectId: summary?.runnerUp?.id },
    { slot: 'THIRD_PLACE', label: 'Third place', subjectId: summary?.thirdPlace?.id },
    { slot: 'FANTASY_WINNER', label: 'Fantasy winner', subjectId: summary?.fantasyAwardSubjectId || summary?.fantasyWinner?.userId },
  ];
  return <section><h2 className="admin-subheading">Result photos</h2>{error && <Notice error>{error}</Notice>}
    {slots.filter((s) => s.subjectId).map((slot) => {
      const photo = c.resultPhotos.find((p) => p.slot === slot.slot);
      return <Operation key={slot.slot} title={slot.label + ' photo'} button="Save photo" onSubmit={async (form) => {
        const request = new FormData();
        for (const [key, value] of form) if (!['image', 'operation'].includes(key)) request.append(key, value);
        request.append('version', String(photo?.version || 0)); request.append('subjectId', slot.subjectId!);
        if (formString(form, 'operation') === 'remove') {
          await adminApi('/competitions/' + c.id + '/result-photos/' + slot.slot + '/remove', 'POST', Object.fromEntries(request));
        } else {
          const file = form.get('image');
          if (!(file instanceof File) || !file.size) throw new Error('Choose a JPG, PNG, or WebP photo.');
          if (file.size > 2 * 1024 * 1024) throw new Error('Choose a photo smaller than 2 MB.');
          request.append('image', file); await adminUpload('/competitions/' + c.id + '/result-photos/' + slot.slot, request);
        }
        await saved();
      }}>
        {photo?.imageUrl && <img className="admin-result-photo" src={photo.imageUrl.startsWith('/') ? apiOrigin + photo.imageUrl : photo.imageUrl} alt={slot.label + ' result photo'} />}
        <Field label="Photo action"><select name="operation"><option value="upload">Upload or replace photo</option>{photo?.imageUrl && <option value="remove">Remove photo</option>}</select></Field>
        <Field label="Photo" hint="JPG, PNG, or WebP, up to 2 MB."><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></Field>
      </Operation>;
    })}</section>;
}
export function SettingsPanel({ competition: c, run, editable, saved }: { competition: Competition; run: RunAction; editable: boolean; saved: () => Promise<void> }) {
  return <section><h2>Competition settings</h2><dl className="admin-impact"><div><dt>Organizer</dt><dd>{personName(c.creator)}</dd></div><div><dt>Start</dt><dd>{dateTime(c.startTime)}</dd></div><div><dt>Team capacity</dt><dd>{c.maxPlayersPerTeam} players</dd></div><div><dt>Format</dt><dd>{c.playersInMatch} a side · {c.hasFantasy ? 'Fantasy enabled' : 'Fantasy disabled'}</dd></div></dl>
    {editable && <><Operation title="Edit competition details" onSubmit={(form) => run('UPDATE_SETTINGS', {
      name: formString(form, 'name'), description: formString(form, 'description'), location: formString(form, 'location'),
      additionalLocations: formString(form, 'venues').split('\n').map((s) => s.trim()).filter(Boolean), maxPlayersPerTeam: formNumber(form, 'capacity'),
      currency: formString(form, 'currency'), fees: formNumber(form, 'fees'),
      ...Object.fromEntries(['firstPrize', 'secondPrize', 'thirdPrize'].map((key) => [key, formString(form, key) ? formNumber(form, key) : null])),
    }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
      <div className="admin-form-grid"><Field label="Name"><input name="name" required minLength={3} maxLength={100} defaultValue={c.name} /></Field><Field label="Venue"><input name="location" required maxLength={200} defaultValue={c.location} /></Field>
        <Field label="Roster capacity"><input name="capacity" type="number" min={c.playersInMatch} max={20} required defaultValue={c.maxPlayersPerTeam} /></Field>
        <Field label="Currency"><input name="currency" required defaultValue={c.currency} maxLength={3} /></Field><Field label="Entry fee"><input name="fees" type="number" min={0} step="0.01" defaultValue={c.fees} /></Field>
        {(['firstPrize', 'secondPrize', 'thirdPrize'] as const).map((key, i) => <Field key={key} label={['First prize', 'Second prize', 'Third prize'][i]}><input name={key} type="number" min={0} step="0.0001" defaultValue={c[key] || ''} /></Field>)}</div>
      <Field label="Description"><textarea name="description" maxLength={500} defaultValue={c.description || ''} /></Field><Field label="Additional venues, one per line"><textarea name="venues" defaultValue={c.additionalLocations.join('\n')} /></Field>
    </Operation>
      <Operation title="Competition lifecycle" onSubmit={(form) => run(formString(form, 'action'), {}, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
        <Field label="Action"><select name="action" required><option value="">Choose action</option>{c.status === 'DRAFT' && <option value="OPEN_REGISTRATION">Open team and fantasy preparation</option>}{c.status === 'OPEN' && <option value="START_COMPETITION">Start competition</option>}{c.status === 'ONGOING' && <option value="COMPLETE_COMPETITION">Complete competition</option>}{!['CANCELLED', 'COMPLETED'].includes(c.status) && <option value="CANCEL_COMPETITION">Cancel competition</option>}</select></Field></Operation>
      {['COMPLETED', 'CANCELLED'].includes(c.status) && <RecoveryPanel competition={c} saved={saved} />}
      <OrganizerPanel competition={c} run={run} />
      {c.type === 'GROUP_KNOCKOUT' && ['DRAFT', 'OPEN'].includes(c.status) && <Operation title="Hybrid format settings" onSubmit={(form) => run('GROUP_SETTINGS', {
        numberOfGroups: formNumber(form, 'groups'), qualifiersPerGroup: formNumber(form, 'qualifiers'), bestPlacedCount: formNumber(form, 'bestPlaced'),
        knockoutSeedingMode: formString(form, 'seeding'), thirdPlaceMatch: form.get('thirdPlace') === 'on',
      }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}><div className="admin-form-grid">
        <Field label="Groups"><input name="groups" type="number" min={1} max={16} defaultValue={c.groupKnockoutSettings?.numberOfGroups || 2} required /></Field>
        <Field label="Qualifiers per group"><input name="qualifiers" type="number" min={1} max={4} defaultValue={c.groupKnockoutSettings?.qualifiersPerGroup || 2} required /></Field>
        <Field label="Extra best-placed qualifiers"><input name="bestPlaced" type="number" min={0} max={16} defaultValue={c.groupKnockoutSettings?.bestPlacedCount || 0} required /></Field>
        <Field label="Knockout draw"><select name="seeding" defaultValue={c.groupKnockoutSettings?.knockoutSeedingMode}><option value="CROSS_GROUP">Cross-group</option><option value="RANDOM_DRAW">Random draw</option><option value="MANUAL">Manual draw</option></select></Field>
        <label className="admin-checkbox"><input type="checkbox" name="thirdPlace" defaultChecked={c.groupKnockoutSettings?.thirdPlaceMatch} />Third-place match</label></div></Operation>}
    </>}
  </section>;
}
function OrganizerPanel({ competition: c, run }: { competition: Competition; run: RunAction }) {
  const [person, setPerson] = useState<import('./api').Person | null>(null);
  return <><h3 className="admin-subheading">Competition admins</h3><ul className="admin-roster">{c.admins.map((a) => <li key={a.userId}>{personName(a.user)}</li>)}</ul>
    <Operation title="Add competition admin" onSubmit={(form) => {
      if (!person) return Promise.reject(new Error('Choose a registered person.'));
      return run('ADD_ADMIN', { userId: person.id }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'));
    }}><PersonPicker selected={person} onChoose={setPerson} /></Operation>
    {c.admins.length > 0 && <Operation title="Remove competition admin" danger onSubmit={(form) => run('REMOVE_ADMIN', { userId: formString(form, 'userId') }, formString(form, 'reason'), formString(form, 'requestId'), formString(form, 'expectedUpdatedAt'))}>
      <Field label="Admin"><select name="userId" required>{c.admins.map((a) => <option key={a.userId} value={a.userId}>{personName(a.user)}</option>)}</select></Field></Operation>}
  </>;
}
import { PersonPicker } from './components';
export function ActivityPanel({ competitionId }: { competitionId: string }) {
  const [items, setItems] = useState<{ id: string; actor: string; action: string; createdAt: string; status: string; before: { reason?: string } | null }[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true; adminApi<{ items: NonNullable<typeof items> }>('/activity?competitionId=' + encodeURIComponent(competitionId))
      .then((result) => { if (active) setItems(result.items); }).catch((error) => { if (active) setError(message(error)); }); return () => { active = false; };
  }, [competitionId]);
  return <section><h2>Activity</h2><p className="admin-muted">The latest 100 admin operations. Recovery previews retain the full archived state on the backend.</p>{error && <Notice error>{error}</Notice>}
    {!items ? <Loading /> : !items.length ? <Empty title="No admin activity yet">Changes made from this dashboard will appear here.</Empty> : <ol className="admin-activity">{items.map((a) => <li key={a.id}><div><strong>{readable(a.action)}</strong><Status value={a.status} /></div><p>{a.before?.reason}</p><small>{a.actor} · {dateTime(a.createdAt)}</small></li>)}</ol>}</section>;
}
