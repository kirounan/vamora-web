import { cloneElement, isValidElement, useContext, useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import { adminApi, message, personName } from './api';
import type { Person } from './api';
import { CompetitionRevision } from './revision';

export function Status({ value }: { value: string }) {
  return <span className={'admin-status status-' + value.toLowerCase()}>{value.toLowerCase().replaceAll('_', ' ')}</span>;
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={'admin-notice' + (error ? ' is-error' : '')} role={error ? 'alert' : 'status'}>{children}</div>;
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="admin-empty"><h3>{title}</h3>{children && <p>{children}</p>}</div>;
}
export function Loading() { return <div className="admin-loading" role="status" aria-label="Loading"><div /><div /><div /></div>; }
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  const id = useId();
  const control = isValidElement(children) ? cloneElement(children as ReactElement<{ id?: string; 'aria-describedby'?: string }>,
    { id, ...(hint ? { 'aria-describedby': id + '-hint' } : {}) }) : children;
  return <div className="admin-field"><label htmlFor={id}>{label}</label>{control}{hint && <small id={id + '-hint'}>{hint}</small>}</div>;
}
export function Reason() { return <Field label="Reason for this change"><input name="reason" required maxLength={1000} placeholder="e.g. Late arrival approved by the organizer" /></Field>; }
export function Submit({ busy, children = 'Save changes', danger = false }: { busy: boolean; children?: ReactNode; danger?: boolean }) {
  return <button className={danger ? 'admin-button danger' : 'admin-button primary'} type="submit" disabled={busy}>{busy ? 'Saving…' : children}</button>;
}
export function Operation({ title, children, onSubmit, button = 'Save changes', danger = false, description, revision: explicitRevision, recordRevision = '' }: {
  title: string; children?: ReactNode; onSubmit: (form: FormData) => Promise<unknown>; button?: string; danger?: boolean; description?: string; revision?: string; recordRevision?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const contextRevision = useContext(CompetitionRevision);
  const currentRevision = explicitRevision ?? contextRevision;
  const [revision, setRevision] = useState(currentRevision);
  const [recordSnapshot, setRecordSnapshot] = useState(recordRevision);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    setBusy(true); setError(''); setSuccess('');
    try { const updatedRevision = await onSubmit(new FormData(form));
      if (typeof updatedRevision === 'string') setRevision(updatedRevision);
      setSuccess('Changes saved.'); setRequestId(crypto.randomUUID()); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  return <details className="admin-operation" onToggle={(e) => { if (e.currentTarget.open) { setRevision(currentRevision); setRecordSnapshot(recordRevision); setRequestId(crypto.randomUUID()); } }}><summary>{title}</summary><form onSubmit={submit} onChange={() => setRequestId(crypto.randomUUID())}>
    <input type="hidden" name="requestId" value={requestId} />
    <input type="hidden" name="expectedUpdatedAt" value={revision} />
    {recordRevision && <input type="hidden" name="recordUpdatedAt" value={recordSnapshot} />}
    {description && <p className="admin-muted">{description}</p>}
    <fieldset disabled={busy}>{children}<Reason /></fieldset>
    {(revision && currentRevision !== revision || recordSnapshot !== recordRevision) && <Notice>Data changed since this form opened. Review your inputs before saving.
      <button type="button" className="admin-button" disabled={busy} onClick={() => { setRevision(currentRevision); setRecordSnapshot(recordRevision); setRequestId(crypto.randomUUID()); setError(''); }}>Use latest data</button>
    </Notice>}
    {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
    <Submit busy={busy} danger={danger}>{button}</Submit>
  </form></details>;
}
export function PersonPicker({ onChoose, virtual = false, selected }: { onChoose: (person: Person | null) => void; virtual?: boolean; selected: Person | null }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Person[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);
  useEffect(() => {
    const counter = latest;
    const version = ++latest.current;
    if ((!virtual && query.trim().length < 2) || selected) return;
    const timer = setTimeout(() => {
      setLoading(true);
      adminApi<{ items: Person[] }>('/users?q=' + encodeURIComponent(query) + '&virtual=' + virtual)
        .then((result) => { if (latest.current === version) { setItems(result.items); setError(''); } })
        .catch((error) => { if (latest.current === version) setError(message(error)); })
        .finally(() => { if (latest.current === version) setLoading(false); });
    }, 250);
    return () => { clearTimeout(timer); counter.current++; };
  }, [query, selected, virtual]);
  return <div className="admin-person-picker">
    {selected ? <div className="admin-selected-person"><span><strong>{personName(selected)}</strong><small>{selected.id}</small></span>
      <button className="admin-button" type="button" onClick={() => { onChoose(null); setQuery(''); setItems([]); }}>Change player</button></div>
      : <><Field label={virtual ? 'Find a virtual player' : 'Find a registered player'} hint={virtual ? 'Search by name, or choose from the directory.' : 'Enter at least two characters of their name or nickname.'}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" maxLength={100} /></Field>
        {loading && <p className="admin-muted" role="status">Searching…</p>}
        {error && <Notice error>{error}</Notice>}
        {!loading && (virtual || query.trim().length >= 2) && <div className="admin-person-results">
          {items.map((person) => <button type="button" key={person.id} onClick={() => onChoose(person)}>
            <strong>{personName(person)}</strong><small>{person.nickname ? '@' + person.nickname + ' · ' : ''}{person.id}</small>
          </button>)}{!items.length && <p className="admin-muted">No matching players.</p>}
        </div>}</>}
  </div>;
}
