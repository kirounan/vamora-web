export interface ReportColumn { key: string; label: string; type: 'text' | 'number' | 'date' | 'boolean' | 'json'; primary?: boolean; link?: string }
export interface ChartData { title: string; kind: 'line' | 'bar'; points: { label: string; value: number; series?: string }[] }
export interface Report {
  resource: string; title: string; columns: ReportColumn[]; filters: string[]; items: Record<string, unknown>[];
  total: number; page: number; pageSize: number; generatedAt: string; timezone: string;
  applied: Record<string, string | number>; charts: ChartData[]; notes: string[];
}
export interface RecordReport {
  resource: string; title: string; columns: ReportColumn[]; item: Record<string, unknown>;
  generatedAt: string; timezone: string; notes: string[]; configuration?: Record<string, unknown>;
  breakdown?: { components: { label: string; value: number }[]; evidenceAvailable: boolean; displayChange: number };
  pointsBreakdown?: { components: { label:string;value:number }[];recordedPoints:number;source:string;reconciled:boolean };
  relatedCounts?: Record<string,number>;
}
export const number = (value: unknown) => typeof value === 'number' ? value!==0&&Math.abs(value)<0.0001?value.toExponential(3):(Object.is(value,-0)?0:value).toLocaleString('en-GB', { maximumFractionDigits: 6 }) : typeof value==='string'&&/^-?\d+(\.\d+)?$/.test(value)?value:'—';
export const label = (key: string) => key==='GROUP_KNOCKOUT'?'Hybrid':(key===key.toUpperCase()?key.toLowerCase():key.replace(/([A-Z])/g, ' $1')).replaceAll('_',' ').replace(/^./, x => x.toUpperCase());
export const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
export function cairoToday() {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=(key:string)=>parts.find(p=>p.type===key)!.value;
  return get('year')+'-'+get('month')+'-'+get('day');
}
export function tabSearch(search: string) {
  const source = new URLSearchParams(search), result = new URLSearchParams();
  for (const key of ['range','from','to','bucket','q']) if(source.has(key)) result.set(key,source.get(key)!);
  return result.size ? '?' + result : '';
}
export const recordUrl = (resource: string, id: unknown) => {
  const encoded = encodeURIComponent(String(id));
  return ({ users:'/admin/users/',competitions:'/admin/competitions/',matches:'/admin/matches/',teams:'/admin/teams/',ratings:'/admin/ratings/changes/',participants:'/admin/fantasy/managers/',markets:'/admin/fantasy/markets/' }[resource] || '/admin/records/'+resource+'/') + encoded + (['users','competitions','matches','teams','participants'].includes(resource)?'/overview':'');
};
