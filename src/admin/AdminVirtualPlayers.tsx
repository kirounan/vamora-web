import { formString } from './form';
import { useCallback, useEffect, useState } from 'react';
import { adminApi, changeRequest, dateTime, message, personName } from './api';
import type { VirtualPlayer } from './api';
import { Empty, Field, Loading, Notice, Operation, Status } from './components';
export default function AdminVirtualPlayers() {
  const [query, setQuery] = useState(''); const [archived, setArchived] = useState(false);
  const [items, setItems] = useState<VirtualPlayer[] | null>(null); const [error, setError] = useState('');
  const [selected, setSelected] = useState<VirtualPlayer | null>(null);
  const load = useCallback(async () => {
    try { const result = await adminApi<{ items: VirtualPlayer[] }>('/virtual-players?' + new URLSearchParams({ q: query, archived: String(archived) })); setItems(result.items); setError(''); }
    catch (error) { setError(message(error)); }
  }, [query, archived]);
  useEffect(() => { const timer = setTimeout(() => { void load(); }, 200); return () => clearTimeout(timer); }, [load]);
  return <><header className="admin-page-heading"><div><h1>Virtual players</h1><p>Real people on the pitch. No app account required.</p></div></header>
    <div className="admin-filters"><Field label="Search by name"><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></Field>
      <label className="admin-checkbox"><input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />Include archived players</label></div>
    {error && <Notice error>{error}</Notice>}
    <Operation title="Create a virtual player" button="Create player" onSubmit={async (form) => {
      await adminApi('/virtual-players', 'POST', { ...changeRequest(formString(form, 'reason'), formString(form, 'requestId')), name: formString(form, 'name') }); await load();
    }}><Field label="Player name"><input name="name" required maxLength={100} /></Field><p className="admin-muted">To create and enroll a player in one step, use Add player inside a competition.</p></Operation>
    {selected && <section className="admin-edit-panel" key={selected.userId}><div className="admin-section-heading"><h2>{personName(selected.user)}</h2><button className="admin-button" onClick={() => setSelected(null)}>Close</button></div>
      <Operation title="Rename player" onSubmit={async (form) => {
        await adminApi('/virtual-players/' + selected.userId, 'PATCH', { ...changeRequest(formString(form, 'reason'), formString(form, 'requestId')), name: formString(form, 'name') }); setSelected(null); await load();
      }}><Field label="Player name"><input name="name" required maxLength={100} defaultValue={selected.user.name || ''} /></Field><p className="admin-muted">The updated name is used across this player’s competitions. Their statistics remain attached to the same player.</p></Operation>
      <Operation title={selected.archivedAt ? 'Restore player' : 'Archive player'} button={selected.archivedAt ? 'Restore player' : 'Archive player'} danger={!selected.archivedAt} onSubmit={async (form) => {
        await adminApi('/virtual-players/' + selected.userId, 'PATCH', { ...changeRequest(formString(form, 'reason'), formString(form, 'requestId')), archived: !selected.archivedAt }); setSelected(null); await load();
      }} description="Archiving keeps existing competition records and statistics. Archived players cannot be added to another competition." />
    </section>}
    {!items ? <Loading /> : !items.length ? <Empty title="No virtual players found">Create a player here, or add one directly to a competition.</Empty>
      : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Player</th><th>Competitions</th><th>Created</th><th>Status</th><th>Manage</th></tr></thead><tbody>
        {items.map((p) => <tr key={p.userId}><td><strong>{personName(p.user)}</strong><small className="admin-code">{p.userId}</small></td>
          <td>{p.user._count.playerParticipations}</td><td>{dateTime(p.createdAt)}</td><td><Status value={p.archivedAt ? 'ARCHIVED' : 'AVAILABLE'} /></td>
          <td><button className="admin-button" onClick={() => setSelected(p)}>Manage<span className="admin-sr"> {personName(p.user)}</span></button></td></tr>)}
      </tbody></table></div>}
  </>;
}
