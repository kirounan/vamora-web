import { formNumber, formString } from './form';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { adminApi, message, personName } from './api';
import type { Competition, Person } from './api';
import { Field, Notice, PersonPicker, Reason, Submit } from './components';

export default function PlayerEnrollment({ competition, initialPlayer = null, close, saved }: {
  competition: Competition; initialPlayer?: Person | null; close: () => void; saved: (result: { user: Person; teamId: string | null }) => Promise<void>;
}) {
  const [source, setSource] = useState(initialPlayer ? 'registered' : 'new');
  const [selected, setSelected] = useState<Person | null>(initialPlayer);
  const [capacity, setCapacity] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(competition.updatedAt);
  const requestId = useRef(crypto.randomUUID());
  const heading = useRef<HTMLHeadingElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    if (source !== 'new' && !selected) { setError('Choose a player from the search results.'); setBusy(false); return; }
    try {
      const result = await adminApi<{ user: Person; teamId: string | null }>('/competitions/' + competition.id + '/players', 'POST', {
        reason: formString(form, 'reason'), requestId: requestId.current, expectedUpdatedAt: revision,
        ...(source === 'new' ? { name: formString(form, 'name') } : { userId: selected!.id }),
        ...(formString(form, 'teamId') ? { teamId: formString(form, 'teamId') } : {}),
        ...(capacity ? { maxPlayersPerTeam: formNumber(form, 'capacity') } : {}),
      });
      await saved(result); close();
    } catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  return <section className="admin-enrollment" aria-labelledby="enrollment-heading">
    <div className="admin-section-heading"><div><h2 id="enrollment-heading" ref={heading}>Add player</h2><p>Enroll a late arrival and assign their team in one step.</p></div>
      <button className="admin-button" type="button" onClick={close}>Close</button></div>
    <form onSubmit={submit} onChange={() => { requestId.current = crypto.randomUUID(); }}><fieldset disabled={busy}>
      <fieldset className="admin-source"><legend>Player source</legend>{[['new', 'Create virtual player'], ['virtual', 'Existing virtual player'], ['registered', 'Registered player']].map(([value, label]) =>
        <label key={value} className={source === value ? 'is-selected' : ''}><input type="radio" name="source" value={value} checked={source === value} onChange={() => { setSource(value); setSelected(null); }} />{label}</label>)}</fieldset>
      {source === 'new' ? <Field label="Player name" hint="Only a name is needed. The player can be reused in future competitions."><input name="name" required maxLength={100} autoFocus /></Field>
        : <PersonPicker key={source} selected={selected} virtual={source === 'virtual'} onChoose={(p) => { setSelected(p); requestId.current = crypto.randomUUID(); }} />}
      <div className="admin-form-grid"><Field label="Team"><select name="teamId" defaultValue="">
        <option value="">Enroll without a team</option>{competition.teams.filter((t) => t.approvalStatus === 'APPROVED').map((t) =>
          <option key={t.id} value={t.id}>{t.name} · {t.members.length}/{competition.maxPlayersPerTeam} players</option>)}
      </select></Field>
        <div className="admin-capacity"><label className="admin-checkbox"><input type="checkbox" checked={capacity} onChange={(e) => setCapacity(e.target.checked)} />Adjust roster capacity</label>
          {capacity && <Field label="New maximum players per team" hint="Applies to every team in this competition."><input name="capacity" type="number" min={competition.playersInMatch} max={20} defaultValue={competition.maxPlayersPerTeam + 1} required /></Field>}</div>
      </div>
      <p className="admin-muted">Team additions join the bench. Use a substitution to bring them into a running match. Earlier events and starting lineups stay intact.</p>
      {selected && <p className="admin-muted">Selected: <strong>{personName(selected)}</strong> · <span className="admin-code">{selected.id}</span></p>}
      <Reason />
    </fieldset>
      {revision !== competition.updatedAt && <Notice>The competition changed while this form was open. Your inputs are saved.
        <button type="button" className="admin-button" onClick={() => { setRevision(competition.updatedAt); requestId.current = crypto.randomUUID(); }}>Review using latest data</button></Notice>}
      {error && <Notice error>{error}</Notice>}
      <div className="admin-form-actions"><Submit busy={busy}>Add player to competition</Submit><button type="button" className="admin-button" onClick={close} disabled={busy}>Cancel</button></div>
    </form>
  </section>;
}
