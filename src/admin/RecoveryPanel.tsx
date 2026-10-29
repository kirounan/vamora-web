import { formString } from './form';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { adminApi, changeRequest, message, readable } from './api';
import type { Competition, Match } from './api';
import { Field, Notice, Reason, Submit } from './components';
interface Preview {
  id: string; action: string; confirmation: string; expiresAt: string;
  impact: { matches: { id: string; homeTeamId: string | null; awayTeamId: string | null; status: string }[];
    invalidatedRounds: { id: string; name: string }[]; ratingMatches: number; ratingPlayers: number;
    ratingCompetitionIds: string[]; archivedFantasySquads: number; walletChanges: unknown[];
    achievementsToRecheck: number; blockers: string[] };
}
export default function RecoveryPanel({ competition, match, saved }: { competition: Competition; match?: Match; saved: () => Promise<void> }) {
  const [action, setAction] = useState(match ? 'RESET_MATCH' : 'REOPEN_COMPETITION');
  const [preview, setPreview] = useState<Preview | null>(null); const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  async function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try { setPreview(await adminApi<Preview>('/competitions/' + competition.id + '/recovery/preview', 'POST', {
      ...changeRequest(formString(new FormData(event.currentTarget), 'reason')), action, ...(match ? { matchId: match.id } : {}),
    })); setConfirmation(''); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!preview) return; setBusy(true); setError('');
    try { await adminApi('/recovery/' + preview.id + '/apply', 'POST', { confirmation }); setPreview(null); setSuccess('Recovery completed. Review the updated tournament before continuing.'); await saved(); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  const team = (id: string | null) => competition.teams.find((t) => t.id === id)?.name || 'Unassigned';
  return <details className="admin-operation admin-recovery"><summary>{match ? 'Match recovery' : 'Reopen completed competition'}</summary>
    {!preview ? <form onSubmit={inspect}><fieldset disabled={busy}>
      {match && <Field label="Recovery action"><select value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="RESET_MATCH">Reset match · clear play and return to scheduled</option>
        <option value="REOPEN_MATCH">Reopen match · keep events for correction</option>
        <option value="REPLAY_MATCH">Replay match · create a linked replacement</option>
      </select></Field>}
      <p className="admin-muted">Review the exact impact before applying. Dependent matches, qualification, fantasy results, ratings, and awards may change.</p><Reason />
    </fieldset><Submit busy={busy}>Preview impact</Submit></form>
      : <div className="admin-recovery-preview"><h3>{readable(preview.action)} · impact review</h3>
        <dl className="admin-impact"><div><dt>Matches affected</dt><dd>{preview.impact.matches.length}</dd></div>
          <div><dt>Ratings recalculated</dt><dd>{preview.impact.ratingPlayers} players · {preview.impact.ratingMatches} matches</dd></div>
          <div><dt>Fantasy squads archived</dt><dd>{preview.impact.archivedFantasySquads}</dd></div>
          <div><dt>Wallets restored</dt><dd>{preview.impact.walletChanges.length}</dd></div>
          <div><dt>Achievements reviewed</dt><dd>{preview.impact.achievementsToRecheck}</dd></div></dl>
        {preview.impact.matches.length > 0 && <ul className="admin-impact-matches">{preview.impact.matches.map((m) => <li key={m.id}>{team(m.homeTeamId)} vs {team(m.awayTeamId)} <span>{readable(m.status)}</span></li>)}</ul>}
        {preview.impact.invalidatedRounds.length > 0 && <p>Rounds invalidated: {preview.impact.invalidatedRounds.map((r) => r.name).join(', ')}</p>}
        {preview.impact.ratingCompetitionIds.some((id) => id !== competition.id) && <Notice>Rating changes also affect later competitions involving these players.</Notice>}
        <p className="admin-muted">Published winners and result photos are cleared. The existing mobile app may need a refresh or reopening to show repairs.</p>
        {preview.impact.blockers.map((b) => <Notice key={b} error>{b}</Notice>)}
        <form onSubmit={apply}><Field label={'Enter ' + preview.confirmation + ' to confirm'}><input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" required /></Field>
          <p className="admin-muted">Preview expires at {new Date(preview.expiresAt).toLocaleTimeString('en-GB')}. Changes after this preview require another review.</p>
          {preview.impact.blockers.length ? null : <button className="admin-button danger" disabled={busy || confirmation !== preview.confirmation} type="submit">{busy ? 'Applying recovery…' : 'Apply recovery'}</button>}
          <button className="admin-button" type="button" disabled={busy} onClick={() => setPreview(null)}>Back to preview</button>
        </form>
      </div>}
    {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
  </details>;
}
