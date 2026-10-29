import { formNumber, formString } from './form';
import { AnalyticsReport } from './AnalyticsViews';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, changeRequest } from './api';
import type { Person } from './api';
import { Field, Operation, PersonPicker } from './components';
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
  return <><header className="admin-page-heading"><div><h1>Competitions</h1><p>Find your tournament. Take control of matchday.</p></div></header>
    <AnalyticsReport resource="competitions" heading={false} /><CreateCompetition />
  </>;
}
