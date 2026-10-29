import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, NavLink, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { adminApi, apiOrigin, message } from './api';
import { Empty, Field, Loading, Notice } from './components';
import AnalyticsChart from './AnalyticsChart';
import type { ChartData, RecordReport, Report, ReportColumn } from './analytics-types';
import { cairoToday, date, label, number, recordUrl, tabSearch } from './analytics-types';
import './analytics.css';

interface Catalogue { resource: string; title: string; columns: ReportColumn[]; filters: string[]; notes: string[] }
let catalogueRequest: Promise<Catalogue[]> | null = null;
const catalogue = () => catalogueRequest ||= adminApi<Catalogue[]>('/analytics/catalogue').catch(e=>{catalogueRequest=null;throw e;});
const timeline = new Set(['users','ratings','matches','events','statistics','transfers','ledger','awards','notifications','activity','recovery']);
const commonKeys = ['q','range','from','to','bucket','sort','dir','page','pageSize'];
const options:Record<string,string[]> = {
  format:['GAMEDAY','GROUP_KNOCKOUT','LEAGUE','TOURNAMENT'],phase:['DRAFT','OPEN','ONGOING','COMPLETED','CANCELLED'],userKind:['all','registered','virtual'],verified:['true','false'],flagged:['true','false'],needsReview:['true','false'],hasSquad:['true','false'],participationType:['ACTUAL_PLAYER','FANTASY_ONLY','SPECTATOR'],
};
const filterTitles:Record<string,string> = { userIds:'Compare player IDs (up to 4, comma separated)',userKind:'Account kind',verified:'Verified account',formulaVersion:'Rating formula',fantasyRulesVersion:'Fantasy rules',phase:'Competition phase' };
const inputResources:Record<string,string> = {userId:'users',competitionId:'competitions',teamId:'teams',matchId:'matches',roundId:'rounds'};
interface Country {id:string;name:string;cities:{id:string;name:string}[]}
let locationRequest:Promise<Country[]>|null=null;
function LocationFilter({field,value,countryId,set}:{field:string;value:string;countryId:string;set:(key:string,value:string)=>void}) {
  const [countries,setCountries]=useState<Country[]>([]),[error,setError]=useState('');
  useEffect(()=>{let active=true;(locationRequest ||= adminApi<Country[]>('/locations').catch(e=>{locationRequest=null;throw e;})).then(r=>{if(active)setCountries(r);}).catch(e=>{if(active)setError(message(e));});return()=>{active=false;};},[]);
  const choices=field==='countryId'?countries:countries.filter(c=>!countryId||c.id===countryId).flatMap(c=>c.cities);
  return <Field label={field==='countryId'?'Country':'City'}><select value={value} onChange={e=>{set(field,e.target.value);if(field==='countryId')set('cityId','');}}><option value="">All</option>{choices.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{error&&<small role="alert">{error}</small>}</Field>;
}
function encoded(query: Record<string, unknown>) {
  const p=new URLSearchParams(); for(const [k,v] of Object.entries(query)) if(v!==undefined && v!==null && v!=='') p.set(k,String(v));return p.toString();
}
export function AnalyticsTabs({ base, tabs }: { base:string; tabs:[string,string][] }) {
  const location=useLocation();
  return <nav className="admin-tabs analytics-tabs" aria-label="Report sections">{tabs.map(([key,title])=><NavLink key={key} to={base+'/'+key+tabSearch(location.search)} end>{title}</NavLink>)}</nav>;
}
export function AdminNotFound() { return <Empty title="Page not found"><Link to="/admin/competitions">Back to competitions</Link></Empty>; }
export function AdminCompetitionRedirect() { const {id}=useParams();const location=useLocation();return <Navigate replace to={'/admin/competitions/'+id+'/live'+location.search}/>; }
export function AdminIndexRedirect() { const location=useLocation();return <Navigate replace to={'/admin/competitions'+location.search}/>; }
function Lookup({ field,value,onChange,scope }: { field:string;value:string;onChange:(v:string)=>void;scope:Record<string,string> }) {
  const [search,setSearch]=useState(''),[items,setItems]=useState<Record<string,unknown>[]>([]),[error,setError]=useState('');
  useEffect(()=>{
    if(search.length<2) return;
    let active=true;
    const timer=setTimeout(()=>{ const params={q:search,range:'all',pageSize:8,...(field==='userId'?{userKind:'all'}:{}),...(['teamId','matchId','roundId'].includes(field)&&scope.competitionId?{competitionId:scope.competitionId}:{})};
      adminApi<Report>('/analytics/'+inputResources[field]+'?'+encoded(params)).then(r=>{if(active){setItems(r.items);setError('');}}).catch(e=>{if(active)setError(message(e));});
    },300);return()=>{active=false;clearTimeout(timer);};
  },[search,field,scope.competitionId]);
  return <Field label={label(field)}><div className="analytics-lookup"><input aria-label={'Find '+label(field)} value={search} placeholder={value?'Selected: '+value:'Find by name or paste ID'} onChange={e=>{setSearch(e.target.value);setItems([]);}}/>
    {value && <button type="button" className="admin-text-button" onClick={()=>{onChange('');setSearch('');setItems([]);}}>Clear selection</button>}
    {search.length>=2 && <div className="analytics-lookup-results">{items.map(row=><button key={String(row.id)} type="button" onClick={()=>{onChange(String(row.id));setSearch('');setItems([]);}}>{String(row.name||row.player||row.home&&`${row.home} · ${row.away}`||row.id)}<small>{String(row.id)}</small></button>)}
      <button type="button" onClick={()=>{onChange(search.trim());setSearch('');setItems([]);}}>Use exact ID: {search}</button></div>}
    {error && <small role="alert">{error}</small>}</div></Field>;
}
function ComparisonPicker({value,onChange}:{value:string;onChange:(value:string)=>void}) {
  const ids=value.split(',').filter(Boolean);
  return <fieldset className="analytics-comparison"><legend>Compare up to four players</legend>
    {ids.length<4&&<Lookup field="userId" value="" scope={{}} onChange={id=>onChange([...new Set([...ids,id])].join(','))}/>}
    {ids.map(id=><div key={id}><Link className="analytics-link" to={'/admin/users/'+encodeURIComponent(id)+'/ratings'}>Player · {id.slice(-8)}</Link><button type="button" className="admin-text-button" aria-label={'Remove player '+id} onClick={()=>onChange(ids.filter(x=>x!==id).join(','))}>Remove</button></div>)}
    <small className="admin-muted">Search by name above. Each stable player ID identifies one comparison series.</small>
  </fieldset>;
}
function DateFilters({ value,set }: { value:(k:string,fallback?:string)=>string;set:(k:string,v:string)=>void }) {
  return <><Field label="Date range"><select value={value('range','30d')} onChange={e=>set('range',e.target.value)}>{[['7d','Last 7 days'],['30d','Last 30 days'],['90d','Last 90 days'],['365d','Last year'],['all','All time'],['custom','Custom dates']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></Field>
    {value('range')==='custom' && <><Field label="From (Cairo)"><input type="date" value={value('from')} onChange={e=>set('from',e.target.value)}/></Field><Field label="Through (Cairo)"><input type="date" value={value('to')} onChange={e=>set('to',e.target.value)}/></Field></>}
    <Field label="Chart interval"><select value={value('bucket','auto')} onChange={e=>set('bucket',e.target.value)}>{['auto','day','week','month','year'].map(x=><option key={x} value={x}>{label(x)}</option>)}</select></Field></>;
}
function Value({ value,column }: { value:unknown;column:ReportColumn }) {
  if(value===null||value===undefined) return <span className="admin-muted">Not recorded</span>;
  if(column.type==='json') return <details className="analytics-json"><summary>Inspect recorded data</summary><pre>{JSON.stringify(value,null,2)}</pre></details>;
  const text=column.type==='number'?number(value):column.type==='date'?date(value):column.type==='boolean'?(value?'Yes':'No'):String(value);
  return column.link && String(value) ? <Link className="analytics-link" to={column.link.replace('{value}',encodeURIComponent(String(value)))}>{text}</Link>:<span>{text}</span>;
}
async function downloadCsv(resource:string,query:string) {
  const response=await fetch(apiOrigin+'/api/v1/admin/analytics/'+resource+'/export.csv?'+query,{credentials:'include',headers:{Accept:'text/csv'}});
  if(!response.ok) {
    if(response.status===401)window.dispatchEvent(new Event('admin-session-expired'));
    const result=await response.json().catch(()=>null);throw new Error(result?.message||'The export failed. Please retry.');
  }
  const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vamora-'+resource+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function AnalyticsReport({ resource,scope={},heading=true,showCharts=true,defaults={} }: { resource:string;scope?:Record<string,string>;heading?:boolean;showCharts?:boolean;defaults?:Record<string,string> }) {
  const [params,setParams]=useSearchParams(),[metadata,setMetadata]=useState<Catalogue|null>(null),[data,setData]=useState<Report|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[exporting,setExporting]=useState(false),[refresh,setRefresh]=useState(0),[allColumns,setAllColumns]=useState(false);
  const scopeKey=JSON.stringify(scope),search=params.toString();
  useEffect(()=>{let active=true;catalogue().then(rows=>{if(active)setMetadata(rows.find(x=>x.resource===resource)||null);}).catch(e=>{if(active)setError(message(e));});return()=>{active=false;};},[resource,refresh]);
  const meta=metadata?.resource===resource?metadata:null;
  const query:Record<string,string>={range:timeline.has(resource)?'30d':'all',...defaults};
  for(const [k,v] of params) if(commonKeys.includes(k)||meta?.filters.includes(k)) query[k]=v;
  Object.assign(query,scope);
  const queryString=encoded(query);
  useEffect(()=>{
    if(!meta)return;
    let active=true;
    const timer=setTimeout(()=>{setBusy(true);setError('');adminApi<Report>('/analytics/'+resource+'?'+queryString).then(result=>{if(active)setData(result);}).catch(e=>{if(active)setError(message(e));}).finally(()=>{if(active)setBusy(false);});},100);
    return()=>{active=false;clearTimeout(timer);};
  },[resource,meta,queryString,refresh,search,scopeKey]);
  function set(key:string,value:string) { setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);if(key!=='page')next.delete('page');if(key==='userIds')next.delete('userId');if(key==='userId')next.delete('userIds');if(key==='range'&&value!=='custom'){next.delete('from');next.delete('to');}if(key==='range'&&value==='custom'&&!next.get('from')&&!next.get('to'))next.set('from',cairoToday());return next;}); }
  const value=(key:string,fallback='')=>query[key]||fallback;
  const rows=data?.resource===resource?data:null;
  const columns=rows?.columns.filter(c=>allColumns||c.primary)||[];
  const context=Object.entries(rows?.applied||query).filter(([k])=>!['page','pageSize'].includes(k)).map(([k,v])=>label(k)+': '+v).join(' · ')||'All recorded data';
  return <section className="analytics-report">
    {heading && <header className="admin-page-heading"><div><p className="analytics-eyebrow">APPLICATION INTELLIGENCE</p><h1>{meta?.title||label(resource)}</h1><p className="admin-muted">Recorded business data · Africa/Cairo</p></div></header>}
    <div className="analytics-toolbar"><form className="analytics-search" key={resource+params.get('q')} onSubmit={(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();set('q',String(new FormData(event.currentTarget).get('q')||''));}}><label className="admin-sr" htmlFor={'search-'+resource}>Search {meta?.title}</label><input id={'search-'+resource} name="q" type="search" defaultValue={params.get('q')||''} placeholder="Search names, codes, IDs, or recorded values" maxLength={100}/><button className="admin-button">Search</button></form>
      <button className="admin-button" onClick={()=>setRefresh(n=>n+1)} disabled={busy&&!!rows}>Refresh</button>
      <button className="admin-button" disabled={!rows||busy||exporting} onClick={()=>{setExporting(true);downloadCsv(resource,queryString).catch(e=>setError(message(e))).finally(()=>setExporting(false));}}>{exporting?'Preparing CSV…':'Export filtered CSV'}</button>
    </div>
    <details className="analytics-filter-panel"><summary>Filters and date range{params.size>0?' · '+params.size+' URL parameters':''}</summary><div className="admin-form-grid">
      <DateFilters value={value} set={set}/>
      {meta?.filters.filter(key=>!scope[key]&&!(key==='userIds'&&scope.userId)).map(key=>inputResources[key]?<Lookup key={key} field={key} value={value(key)} onChange={v=>set(key,v)} scope={scope}/>:key==='userIds'?<ComparisonPicker key={key} value={value(key)} onChange={v=>set(key,v)}/>:['countryId','cityId'].includes(key)?<LocationFilter key={key} field={key} value={value(key)} countryId={value('countryId')} set={set}/>:<Field key={key} label={filterTitles[key]||label(key)}>{options[key]?<select value={value(key,key==='userKind'&&resource==='users'?'registered':'')} onChange={e=>set(key,e.target.value)}>{key!=='userKind'&&<option value="">All</option>}{options[key].map(v=><option key={v} value={v}>{label(v)}</option>)}</select>:<input value={value(key)} placeholder={key.endsWith('Id')?'Exact ID':'Any'} onChange={e=>set(key,e.target.value)} maxLength={100}/>}</Field>)}
      <Field label="Rows per page"><select value={value('pageSize','30')} onChange={e=>set('pageSize',e.target.value)}>{[15,30,50,100].map(v=><option key={v}>{v}</option>)}</select></Field>
    </div><button className="admin-text-button" onClick={()=>setParams(new URLSearchParams())}>Reset filters</button></details>
    {error && <Notice error>{error}<button className="admin-text-button" onClick={()=>setRefresh(n=>n+1)}>Retry</button></Notice>}
    {busy && <p role="status" className="admin-muted">{rows?'Updating report…':'Loading report…'}</p>}
    {rows && <>
      <div className="analytics-report-meta"><span><strong>{number(rows.total)}</strong> matching records · page {rows.page}</span><span>Updated {date(rows.generatedAt)} · Africa/Cairo</span></div>
      {rows.notes.length>0&&<details className="analytics-notes"><summary>Data definitions and limitations</summary>{rows.notes.map(n=><p key={n}>{n}</p>)}</details>}
      {showCharts&&<div className="analytics-charts">{rows.charts.map((chart,i)=><AnalyticsChart key={resource+i} chart={chart} generatedAt={rows.generatedAt} context={context}/>)}</div>}
      <div className="admin-section-heading"><h2>Records</h2><label className="admin-checkbox"><input type="checkbox" checked={allColumns} onChange={e=>setAllColumns(e.target.checked)}/>Show all fields</label></div>
      {!rows.items.length?<Empty title="No matching records">Change the filters or date range to include more recorded data.</Empty>:<div className="admin-table-wrap analytics-table"><table className="admin-table"><thead><tr>{columns.map(c=><th key={c.key} aria-sort={rows.applied.sort===c.key?(rows.applied.dir==='asc'?'ascending':'descending'):'none'}>{c.type==='json'?c.label:<button className="admin-text-button" onClick={()=>setParams(previous=>{const next=new URLSearchParams(previous);next.set('sort',c.key);next.set('dir',query.sort===c.key&&query.dir==='desc'?'asc':'desc');next.delete('page');return next;})}>{c.label}{query.sort===c.key?(query.dir==='asc'?' ↑':' ↓'):''}</button>}</th>)}<th>Inspect</th></tr></thead><tbody>{rows.items.map((row,i)=><tr key={String(row.id||i)}>{columns.map(c=><td key={c.key}><Value value={row[c.key]} column={c}/></td>)}<td><Link className="analytics-link" to={recordUrl(resource,row.id)}>Details<span className="admin-sr"> for {String(row.name||row.player||row.id)}</span></Link></td></tr>)}</tbody></table></div>}
      <div className="analytics-pagination"><button className="admin-button" disabled={busy||rows.page<=1} onClick={()=>set('page',String(rows.page-1))}>Previous</button><span>{rows.total===0?0:(rows.page-1)*rows.pageSize+1}–{Math.min(rows.total,rows.page*rows.pageSize)} of {number(rows.total)}</span><button className="admin-button" disabled={busy||rows.page*rows.pageSize>=rows.total} onClick={()=>set('page',String(rows.page+1))}>Next</button></div>
    </>}
  </section>;
}
function useRecord(resource:string,id:string) {
  const [data,setData]=useState<RecordReport|null>(null),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;adminApi<RecordReport>('/analytics/'+resource+'/'+encodeURIComponent(id)).then(r=>{if(active){setData(r);setError('');}}).catch(e=>{if(active)setError(message(e));});return()=>{active=false;};},[resource,id,refresh]);
  return { data:data?.resource===resource&&data.item.id===id?data:null,error,retry:()=>setRefresh(n=>n+1) };
}
function RecordFields({ data }: { data:RecordReport }) {
  return <><p className="admin-muted">Recorded state · updated {date(data.generatedAt)} · Africa/Cairo</p>
    {data.breakdown && <><AnalyticsChart chart={{title:'Recorded rating-change components',kind:'bar',points:data.breakdown.components}} generatedAt={data.generatedAt} context={'Formula '+data.item.formulaVersion+' · Player '+data.item.userId}/><Notice>{data.breakdown.evidenceAvailable?'Participation evidence was retained for this change.':'Legacy participation evidence is unavailable.'} Display change: {number(data.breakdown.displayChange)}. Component totals include the final cap adjustment.</Notice></>}
    {data.pointsBreakdown&&<><Notice>{data.pointsBreakdown.source} Recorded points: {number(data.pointsBreakdown.recordedPoints)}.</Notice>{data.pointsBreakdown.components.length>0&&<AnalyticsChart chart={{title:'Fantasy point attribution',kind:'bar',points:data.pointsBreakdown.components}} generatedAt={data.generatedAt} context={'Scoring version '+data.item.scoringVersion+' · Match '+data.item.matchId}/>}</>}
    <dl className="analytics-record-fields">{data.columns.map(c=><div key={c.key}><dt>{c.label}</dt><dd><Value column={c} value={data.item[c.key]}/></dd></div>)}</dl>
    {data.configuration&&<section><h2>Format configuration and organizers</h2>{Object.entries(data.configuration).filter(([k])=>k!=='id').map(([k,v])=><div key={k}><h3>{label(k)}</h3><pre className="analytics-pre">{v===null?'Not configured':JSON.stringify(v,null,2)}</pre></div>)}</section>}
    {data.notes.map(n=><p key={n} className="admin-muted">{n}</p>)}
  </>;
}
export function AnalyticsRecordPage({ resource:givenResource }: { resource?:string }) {
  const p=useParams(),resource=givenResource||p.resource||'',id=p.recordId||p.marketId||'';const {data,error,retry}=useRecord(resource,id);
  return <><Link to="/admin/overview" className="admin-back">Back to overview</Link><header className="admin-page-heading"><h1>{data?.title||'Record detail'}</h1></header>{error?<Notice error>{error}<button className="admin-text-button" onClick={retry}>Retry</button></Notice>:!data?<Loading/>:<RecordFields data={data}/>}</>;
}
type PageKind='users'|'matches'|'teams'|'participants';
const entityTabs:Record<PageKind,[string,string,string][]>={
  users:[['overview','Profile',''],['competitions','Competitions','competitions'],['matches','Matches','matches'],['statistics','Statistics','statistics'],['ratings','Ratings','ratings'],['fantasy','Fantasy','participants'],['squads','Squads','squads'],['transfers','Transfers','transfers'],['wallets','Wallets','wallets'],['ledger','Ledger','ledger'],['social','Friends & requests','friendships'],['achievements','Achievements','awards'],['activity','Recorded events','events']],
  matches:[['overview','Overview & lineups',''],['events','Events','events'],['statistics','Statistics','statistics'],['ratings','Ratings','ratings'],['fantasy','Fantasy points','statistics'],['history','Corrections','corrections'],['recovery','Recovery','recovery']],
  teams:[['overview','Overview',''],['players','Players','members'],['matches','Matches','matches'],['invitations','Invitations','invitations'],['captains','Captain requests','captains'],['links','Join-link statuses','links'],['standings','Standings','standings']],
  participants:[['overview','Manager & current squad',''],['squads','Round squads','squads'],['snapshots','Historical squads','snapshots'],['transfers','Transfers','transfers'],['wallets','Wallet windows','wallets'],['ledger','Ledger','ledger']],
};
export function AnalyticsEntityPage({ kind }: {kind:PageKind}) {
  const p=useParams(),id=p.userId||p.matchId||p.teamId||p.participantId||'',section=p.section||'overview';
  const {data,error,retry}=useRecord(kind,id),base=recordUrl(kind,id).replace(/\/overview$/,''),tabs=entityTabs[kind],selected=tabs.find(t=>t[0]===section);
  if(!selected)return <AdminNotFound/>;
  const scope:Record<string,string>=kind==='users'?{userId:id}:kind==='matches'?{matchId:id}:kind==='teams'?{teamId:id}:data?{userId:String(data.item.userId),competitionId:String(data.item.competitionId)}:{};
  return <><Link className="admin-back" to={kind==='participants'?'/admin/fantasy/managers':'/admin/'+kind}>Back to {kind==='participants'?'fantasy managers':kind}</Link>
    <header className="admin-page-heading"><div><p className="analytics-eyebrow">{kind==='participants'?'FANTASY MANAGER':label(kind).toUpperCase()}</p><h1>{String(data?.item.name||data?.item.player||data?.item.home&&`${data.item.home} · ${data.item.away}`||data?.item.id||'Loading…')}</h1><p className="admin-code">{id}</p></div>
      {kind==='matches'&&data&&<Link className="admin-button primary" to={'/admin/competitions/'+data.item.competitionId+'/live?matchId='+encodeURIComponent(id)}>Open live workspace</Link>}
    </header><AnalyticsTabs base={base} tabs={tabs.map(([k,t])=>[k,t])}/>
    {error?<Notice error>{error}<button className="admin-text-button" onClick={retry}>Retry</button></Notice>:!data?<Loading/>:section==='overview'?<RecordFields data={data}/>:<AnalyticsReport key={kind+id+selected[2]} resource={selected[2]} scope={scope} heading={false}/>}
  </>;
}
const sections:Record<string,[string,string,string][]>={
  ratings:[['overview','Players & current ratings','users'],['changes','Recorded changes','ratings'],['comparison','Player comparison','ratings']],
  fantasy:[['overview','Managers & points','participants'],['managers','Managers','participants'],['squads','Round squads','squads'],['snapshots','Historical squads','snapshots'],['transfers','Transfers','transfers'],['markets','Market prices','markets'],['wallets','Wallet windows','wallets'],['ledger','Money ledger','ledger']],
  community:[['friendships','Friendships & requests','friendships'],['achievements','Award history','awards'],['definitions','Achievement definitions','achievements']],
  operations:[['notifications','Notifications','notifications'],['activity','Admin activity','activity'],['recovery','Recovery history','recovery'],['captains','Captain requests','captains'],['reservations','Captain invitations','reservations'],['invitations','Team invitations','invitations'],['links','Team-link statuses','links']],
};
export function AnalyticsSectionPage({ area }: {area:string}) {
  const {section}=useParams(),tabs=sections[area],selected=tabs.find(x=>x[0]===(section||tabs[0][0]));
  if(!selected)return <AdminNotFound/>;
  return <><header className="admin-page-heading"><div><p className="analytics-eyebrow">APPLICATION INTELLIGENCE</p><h1>{label(area)}</h1><p>Explore recorded outcomes and follow the underlying evidence.</p></div></header><AnalyticsTabs base={'/admin/'+area} tabs={tabs.map(([k,t])=>[k,t])}/>
    {area==='ratings'&&selected[0]==='comparison'&&<Notice>Select up to four player IDs in Filters. The progression chart uses the last recorded rating each Cairo day; gaps are not invented results.</Notice>}
    <AnalyticsReport key={area+selected[0]} resource={selected[2]} heading={false} defaults={area==='ratings'&&selected[0]==='overview'?{range:'all',sort:'displayRating',dir:'desc'}:selected[2]==='participants'?{sort:'fantasyManagerPoints',dir:'desc'}:{}}/></>;
}
interface Overview {generatedAt:string;timezone:string;applied:Record<string,unknown>;current:Record<string,number>;period:Record<string,number>;issues:Record<string,number>;charts:ChartData[];notes:string[]}
export function AnalyticsOverview() {
  const [params,setParams]=useSearchParams(),[data,setData]=useState<Overview|null>(null),[error,setError]=useState(''),[refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false);
  const allowed=['range','from','to','bucket','format','phase','competitionId','countryId','cityId','userKind'],query:Record<string,string>={range:'30d'};
  for(const [k,v]of params)if(allowed.includes(k))query[k]=v;
  const queryString=encoded(query);
  useEffect(()=>{let active=true;const timer=setTimeout(()=>{setBusy(true);adminApi<Overview>('/analytics/overview?'+queryString).then(r=>{if(active){setData(r);setError('');}}).catch(e=>{if(active)setError(message(e));}).finally(()=>{if(active)setBusy(false);});},100);return()=>{active=false;clearTimeout(timer);};},[queryString,refresh]);
  useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setRefresh(n=>n+1);},60000);return()=>clearInterval(timer);},[]);
  const set=(k:string,v:string)=>setParams(old=>{const next=new URLSearchParams(old);if(v)next.set(k,v);else next.delete(k);if(k==='range'&&v!=='custom'){next.delete('from');next.delete('to');}if(k==='range'&&v==='custom'&&!next.get('from')&&!next.get('to'))next.set('from',cairoToday());return next;});
  const cards=(values:Record<string,number>)=><div className="analytics-metrics">{Object.entries(values).filter(([key])=>key!=='span').map(([key,value])=><div key={key}><span>{label(key)}</span><strong>{number(value)}</strong></div>)}</div>;
  return <><header className="admin-page-heading"><div><p className="analytics-eyebrow">APPLICATION INTELLIGENCE</p><h1>Overview</h1><p>Current operations and the growth behind them.</p></div><button className="admin-button" disabled={busy} onClick={()=>setRefresh(n=>n+1)}>{busy?'Refreshing…':'Refresh'}</button></header>
    <div className="analytics-overview-filters"><DateFilters value={(k,f='')=>query[k]||f} set={set}/>{['format','phase','userKind'].map(key=><Field key={key} label={label(key)}><select value={query[key]||''} onChange={e=>set(key,e.target.value)}><option value="">{key==='userKind'?'Registered accounts':'All'}</option>{options[key].map(v=><option key={v} value={v}>{label(v)}</option>)}</select></Field>)}</div>
    {error&&<Notice error>{error}</Notice>}{!data&&!error&&<Loading/>}{data&&<>
      <p className="admin-muted">Updated {date(data.generatedAt)} · Africa/Cairo · visible overview refreshes every minute.</p>
      <h2>Current totals</h2>{cards(data.current)}<h2>Recorded activity in selected period</h2>{cards(data.period)}
      <section className="analytics-issues"><h2>Needs attention</h2>{cards(data.issues)}<div className="analytics-quick-links"><Link to="/admin/operations/captains?status=PENDING&range=all">Review team requests</Link><Link to="/admin/fantasy/squads?range=all&needsReview=true">Review fantasy squads</Link><Link to="/admin/operations/notifications?status=FAILED&range=all">Inspect failed notifications</Link></div></section>
      <div className="analytics-charts">{data.charts.map((chart,i)=><AnalyticsChart key={i} chart={chart} generatedAt={data.generatedAt} context={Object.entries(data.applied).map(([k,v])=>label(k)+': '+v).join(' · ')}/>)}</div>
      <details className="analytics-notes"><summary>How to read these metrics</summary>{data.notes.map(n=><p key={n}>{n}</p>)}</details>
    </>}
  </>;
}
export function CompetitionAnalytics({ id,section }: {id:string;section:string}) {
  const detail=useRecord('competitions',id);
  const [params]=useSearchParams();const resource=params.get('view')||({overview:'matches',fantasy:'participants',ratings:'ratings'}[section]||'matches');
  const allowed=section==='overview'?['matches','participants','events','statistics','rounds','groups','standings','bracket','motm','ties','rating-repairs']:section==='fantasy'?['participants','squads','snapshots','transfers','markets','wallets','ledger']:['ratings'];
  return <>{section==='overview'&&detail.data&&<details className="analytics-filter-panel"><summary>Inspect competition configuration, organizers, and published results</summary><RecordFields data={detail.data}/></details>}<div className="analytics-subnav" aria-label="Analysis datasets">{allowed.map(key=><Link key={key} aria-current={resource===key?'page':undefined} to={'/admin/competitions/'+id+'/'+section+'?view='+key+tabSearch('?'+params).replace('?','&')}>{label(key)}</Link>)}</div>
    {allowed.includes(resource)?<AnalyticsReport key={resource} resource={resource} scope={{competitionId:id}} heading={false}/>:<AdminNotFound/>}</>;
}
