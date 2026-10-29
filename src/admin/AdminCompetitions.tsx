import { formNumber, formString } from './form';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, changeRequest, dateTime, formatName, message } from './api';
import type { Competition, Person } from './api';
import { Empty, Field, Loading, Notice, Operation, PersonPicker, Status } from './components';
type Row = Pick<Competition, 'id' | 'name' | 'uniqueCode' | 'type' | 'status' | 'startTime' | 'location'> & { _count: { players: number; teams: number; matches: number } };
interface Country { id: string; name: string; cities: { id: string; name: string }[] }
function CreateCompetition() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState(''); const [type, setType] = useState('GAMEDAY');
  const [organizer, setOrganizer] = useState<Person | null>(null);
  const navigate = useNavigate();
  useEffect(() => { adminApi<Country[]>('/locations').then(setCountries).catch(() => {}); }, []);
  return <Operation title="Create a competition" button="Create competition" onSubmit={async (form) => {
    if (!organizer) throw new Error('Choose a registered organizer.');
    const competition = {
      name: formString(form, 'name'), type, countryId: country, ...(formString(form, 'cityId') ? { cityId: formString(form, 'cityId') } : {}),
      location: formString(form, 'location'), additionalLocations: formString(form, 'additionalLocations').split('\n').map((s) => s.trim()).filter(Boolean),
      startTime: new Date(formString(form, 'startTime')).toISOString(), duration: formNumber(form, 'duration'),
      maxTeams: formNumber(form, 'maxTeams'), maxPlayersPerTeam: formNumber(form, 'maxPlayersPerTeam'),
      playersInMatch: formNumber(form, 'playersInMatch'), hasFantasy: form.get('hasFantasy') === 'on',
      ...(type === 'GROUP_KNOCKOUT' ? { groupKnockoutSettings: { numberOfGroups: formNumber(form, 'numberOfGroups'),
        qualifiersPerGroup: formNumber(form, 'qualifiersPerGroup'), thirdPlaceMatch: form.get('thirdPlace') === 'on' } } : {}),
    };
    const result = await adminApi<{ id: string }>('/competitions', 'POST', { ...changeRequest(formString(form, 'reason'), formString(form, 'requestId')), organizerId: organizer.id, competition });
    navigate('/admin/competitions/' + result.id);
  }}>
    <div className="admin-form-grid"><Field label="Competition name"><input name="name" required minLength={3} maxLength={100} /></Field>
      <Field label="Format"><select value={type} onChange={(e) => setType(e.target.value)}><option value="GAMEDAY">Gameday</option><option value="GROUP_KNOCKOUT">Hybrid · groups + knockout</option></select></Field>
      <Field label="Country"><select value={country} onChange={(e) => setCountry(e.target.value)} required><option value="">Choose country</option>{countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="City"><select name="cityId" key={country}><option value="">No specific city</option>{countries.find((c) => c.id === country)?.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Venue"><input name="location" required maxLength={200} /></Field>
      <Field label="Start time"><input name="startTime" type="datetime-local" required /></Field>
      <Field label="Duration in minutes"><input name="duration" type="number" min={1} max={480} defaultValue={90} required /></Field>
      <Field label="Maximum teams"><input name="maxTeams" type="number" min={2} max={32} defaultValue={4} required /></Field>
      <Field label="Players on the pitch, per team"><select name="playersInMatch"><option value="5">5</option><option value="7">7</option><option value="11">11</option></select></Field>
      <Field label="Roster capacity, per team"><input name="maxPlayersPerTeam" type="number" min={5} max={20} defaultValue={8} required /></Field>
      {type === 'GROUP_KNOCKOUT' && <><Field label="Number of groups"><input name="numberOfGroups" type="number" min={1} max={16} defaultValue={2} required /></Field>
        <Field label="Qualifiers per group"><input name="qualifiersPerGroup" type="number" min={1} max={4} defaultValue={2} required /></Field>
        <label className="admin-checkbox"><input type="checkbox" name="thirdPlace" />Play a third-place match</label></>}
      <label className="admin-checkbox"><input type="checkbox" name="hasFantasy" defaultChecked />Enable fantasy</label>
    </div>
    <Field label="Additional venues" hint="One venue per line."><textarea name="additionalLocations" rows={2} /></Field>
    <PersonPicker selected={organizer} onChoose={setOrganizer} />
    <p className="admin-muted">The selected organizer owns this competition in the app. Web administration remains separate.</p>
  </Operation>;
}
export default function AdminCompetitions() {
  const [query, setQuery] = useState(''); const [type, setType] = useState(''); const [status, setStatus] = useState('');
  const [page, setPage] = useState(1); const [data, setData] = useState<{ items: Row[]; total: number } | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      adminApi<{ items: Row[]; total: number }>('/competitions?' + new URLSearchParams({ q: query, type, status, page: String(page) }))
        .then((result) => { if (active) { setData(result); setError(''); } })
        .catch((error) => { if (active) setError(message(error)); })
        .finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [query, type, status, page]);
  return <><header className="admin-page-heading"><div><h1>Competitions</h1><p>Find your tournament. Take control of matchday.</p></div></header>
    <div className="admin-filters"><Field label="Search competitions"><input type="search" placeholder="Competition name or code" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} /></Field>
      <Field label="Format"><select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="">All formats</option>{['GAMEDAY', 'GROUP_KNOCKOUT', 'LEAGUE', 'TOURNAMENT'].map((t) => <option key={t} value={t}>{formatName(t)}</option>)}</select></Field>
      <Field label="Status"><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{['DRAFT', 'OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((s) => <option key={s}>{s}</option>)}</select></Field>
    </div>
    {error && <Notice error>{error}</Notice>}
    {loading ? <Loading /> : !data?.items.length ? <Empty title="No competitions found">Try a different name, code, or filter.</Empty>
      : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Competition</th><th>Status</th><th>Players / teams</th><th>Start time</th><th><span className="admin-sr">Open</span></th></tr></thead>
        <tbody>{data.items.map((c) => <tr key={c.id}><td><Link className="admin-record-link" to={'/admin/competitions/' + c.id}>{c.name}</Link><small>{formatName(c.type)} · <span className="admin-code">{c.uniqueCode}</span> · {c.location}</small></td>
          <td><Status value={c.status} /></td><td>{c._count.players} players<small>{c._count.teams} teams · {c._count.matches} matches</small></td>
          <td>{dateTime(c.startTime)}</td><td><Link className="admin-button" to={'/admin/competitions/' + c.id}>Open</Link></td></tr>)}</tbody></table></div>}
    {data && data.total > 30 && <div className="admin-pagination"><button className="admin-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {Math.ceil(data.total / 30)}</span><button className="admin-button" disabled={page * 30 >= data.total} onClick={() => setPage(page + 1)}>Next</button></div>}
    <CreateCompetition />
  </>;
}
