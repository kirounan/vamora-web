import { useId, useRef, useState } from 'react';
import type { ChartData } from './analytics-types';
import { number } from './analytics-types';
import { message } from './api';

const palette=['#c5f62f','#f4f3ec','#8acbd0','#efbf8a'];
export default function AnalyticsChart({ chart, generatedAt, context }: { chart: ChartData; generatedAt: string; context: string }) {
  const ref=useRef<SVGSVGElement>(null), id=useId(); const [error,setError]=useState('');
  const points=chart.points.filter(p=>Number.isFinite(p.value)), series=[...new Set(points.map(p=>p.series||'Total'))];
  const labels=[...new Set(points.map(p=>p.label))];
  const contextLines=Array.from({length:Math.max(1,Math.ceil(context.length/110))},(_,i)=>context.slice(i*110,(i+1)*110));
  const height=410+contextLines.length*16;
  const low=Math.min(0,...points.map(p=>p.value)), high=Math.max(1,...points.map(p=>p.value)), span=high-low||1;
  const x=(key:string)=>72+(labels.indexOf(key)/Math.max(1,labels.length-1))*768;
  const y=(value:number)=>270-((value-low)/span)*170;
  async function download() {
    try {
      setError(''); if(!ref.current) return;
      const clone=ref.current.cloneNode(true) as SVGSVGElement; clone.setAttribute('width','1800');clone.setAttribute('height',String(height*2));
      const uri=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}));
      try {
        const img=new Image();img.src=uri; await img.decode();
        const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=height*2;
        const ctx=canvas.getContext('2d');if(!ctx) throw new Error('Chart export is unavailable.');ctx.drawImage(img,0,0);
        const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG could not be created.')),'image/png'));
        const url=URL.createObjectURL(png), a=document.createElement('a');a.href=url;a.download='vamora-'+chart.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      } finally { URL.revokeObjectURL(uri); }
    } catch(e) { setError(message(e)); }
  }
  return <section className="analytics-chart" aria-labelledby={id}>
    <div className="admin-section-heading"><h2 id={id}>{chart.title}</h2><button className="admin-button" onClick={()=>void download()} disabled={!points.length}>Download PNG</button></div>
    {!points.length ? <p className="admin-muted">No recorded data for these filters.</p> : <>
      <svg ref={ref} viewBox={'0 0 900 '+height} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={chart.title+'. '+points.length+' data points. Exact values are in the table below.'}>
        <rect width="900" height={height} fill="#1b201e" />
        <text x="22" y="29" fill="#f4f3ec" fontFamily="sans-serif" fontSize="17" fontWeight="700">{chart.title.slice(0,90)}</text>
        {[0,0.25,0.5,0.75,1].map(t=><g key={t}><line x1="72" x2="850" y1={100+t*170} y2={100+t*170} stroke="#3e4540" strokeDasharray="3 5"/><text x="62" y={105+t*170} textAnchor="end" fill="#b7bdb7" fontFamily="sans-serif" fontSize="12">{number(high-t*span)}</text></g>)}
        <line x1="72" x2="850" y1={y(0)} y2={y(0)} stroke="#b7bdb7" />
        {chart.kind==='line' ? series.map((s,i)=>{
          const data=points.filter(p=>(p.series||'Total')===s);
          return <g key={s}><polyline points={data.map(p=>`${x(p.label)},${y(p.value)}`).join(' ')} fill="none" stroke={palette[i%palette.length]} strokeWidth="2.5" strokeDasharray={i===1?'8 4':i===2?'2 4':undefined}/>
            {data.map((p,j)=><circle key={j} cx={x(p.label)} cy={y(p.value)} r="4" fill={palette[i%palette.length]} tabIndex={0} role="img" aria-label={`${p.label}, ${s}: ${number(p.value)}`}><title>{p.label} · {s}: {number(p.value)}</title></circle>)}</g>;
        }) : points.map((p,i)=>{
          const width=720/Math.max(1,points.length), xpos=76+i*width;
          return <g key={i} tabIndex={0} role="img" aria-label={`${p.label}: ${number(p.value)}`}><title>{p.label}: {number(p.value)}</title><rect x={xpos} y={Math.min(y(p.value),y(0))} width={Math.max(3,width-14)} height={Math.max(2,Math.abs(y(p.value)-y(0)))} fill={p.value<0?'#ffd1cb':'#c5f62f'}/><text x={xpos} y="294" fill="#b7bdb7" fontFamily="sans-serif" fontSize="10">{p.label.slice(0,12)}</text></g>;
        })}
        {chart.kind==='line' && labels.filter((_,i)=>i===0||i===labels.length-1||i===Math.floor(labels.length/2)).map(k=><text key={k} x={x(k)} y="294" fill="#b7bdb7" fontFamily="sans-serif" fontSize="12" textAnchor="middle">{k}</text>)}
        {series.map((s,i)=><g key={s}><line x1={22+i*215} x2={42+i*215} y1="325" y2="325" stroke={palette[i%palette.length]} strokeWidth="3" strokeDasharray={i===1?'8 4':i===2?'2 4':undefined}/><text x={48+i*215} y="329" fill="#f4f3ec" fontSize="11" fontFamily="sans-serif">{s.slice(0,28)}</text></g>)}
        {contextLines.map((line,i)=><text key={i} x="22" y={366+i*16} fill="#b7bdb7" fontFamily="sans-serif" fontSize="11">{line}</text>)}
        <text x="22" y={height-20} fill="#b7bdb7" fontFamily="sans-serif" fontSize="11">Africa/Cairo · Generated {generatedAt} · Vamora administration</text>
      </svg>
      <details className="analytics-data"><summary>View exact chart values ({points.length})</summary><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Period / category</th><th>Series</th><th>Value</th></tr></thead><tbody>{points.map((p,i)=><tr key={i}><td>{p.label}</td><td>{p.series||'Total'}</td><td>{number(p.value)}</td></tr>)}</tbody></table></div></details>
    </>}{error && <p role="alert">{error}</p>}
  </section>;
}
