import assert from 'node:assert/strict';
import { before,after,beforeEach,afterEach,test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { createElement,act } from 'react';
import { MemoryRouter,Route,Routes,useLocation,useNavigate } from 'react-router-dom';
let vite,AdminApp,Chart,root,dom,createRoot,calls;
const originals={window:globalThis.window,document:globalThis.document,FormData:globalThis.FormData,Event:globalThis.Event,HTMLElement:globalThis.HTMLElement,fetch:globalThis.fetch};
const columns=[{key:'id',label:'ID',type:'text',primary:true},{key:'player',label:'Player',type:'text',primary:true},{key:'mu',label:'Rating',type:'number',primary:true}];
const catalogue=['users','ratings','competitions','matches','participants','teams','activity','enrollments'].map(resource=>({resource,title:resource,columns,filters:['userId','competitionId','userKind','verified'],notes:[]}));
const competition={id:'c1',name:'Route verification',uniqueCode:'ROUTE',type:'GAMEDAY',status:'ONGOING',updatedAt:'2026-10-29T12:00:00Z',location:'Pitch',additionalLocations:[],players:[],teams:[],matches:[],rounds:[],admins:[],groups:[],tournamentSlots:[],captainRequests:[],resultPhotos:[],creator:{id:'owner',name:'Organizer'},maxPlayersPerTeam:6,playersInMatch:5};
before(async()=>{
  const initial=new JSDOM('<div></div>');globalThis.window=initial.window;globalThis.document=initial.window.document;({createRoot}=await import('react-dom/client'));Object.assign(globalThis,originals);initial.window.close();
  vite=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});AdminApp=(await vite.ssrLoadModule('/src/admin/AdminApp.tsx')).default;Chart=(await vite.ssrLoadModule('/src/admin/AnalyticsChart.tsx')).default;
});
after(async()=>{await vite?.close();});
beforeEach(()=>{
  dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/admin'});Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,Event:dom.window.Event,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});calls=[];
  globalThis.fetch=async(url,options={})=>{
    calls.push({url,options});const u=new URL(url),path=u.pathname;
    if(path.endsWith('/auth/session')||path.endsWith('/auth/login'))return Response.json({username:'verification',csrfToken:'csrf'});
    if(path.endsWith('/analytics/catalogue'))return Response.json(catalogue);
    if(path==='/api/v1/admin/competitions/c1')return Response.json(competition);
    if(/\/analytics\/(users|competitions)\/(u1|c1)$/.test(path))return Response.json({resource:path.includes('/users/')?'users':'competitions',item:{id:path.includes('/users/')?'u1':'c1',name:'Verification player',imageUrl:'/uploads/profiles/avatar.webp',birthday:'2000-03-04T00:00:00Z',gender:'MALE'},columns,generatedAt:'2026-10-29T12:00:00Z',notes:[],relatedCounts:{playerParticipations:7}});
    const resource=path.split('/').at(-1);return Response.json({resource,title:'Recorded '+resource,columns,filters:catalogue.find(c=>c.resource===resource)?.filters||[],items:[{id:'row-1',player:'Verification player',mu:30}],total:65,page:Number(u.searchParams.get('page')||1),pageSize:Number(u.searchParams.get('pageSize')||30),generatedAt:'2026-10-29T12:00:00Z',timezone:'Africa/Cairo',applied:Object.fromEntries(u.searchParams),charts:[],notes:[]});
  };
  root=createRoot(document.getElementById('root'));
});
afterEach(async()=>{await act(async()=>root.unmount());dom.window.close();Object.assign(globalThis,originals);delete globalThis.IS_REACT_ACT_ENVIRONMENT;});
function Location(){const location=useLocation(),navigate=useNavigate();return createElement('div',null,createElement('output',{'data-location':true},location.pathname+location.search),createElement('button',{'data-back':true,onClick:()=>navigate(-1)},'Browser back'));}
async function open(path){await act(async()=>root.render(createElement(MemoryRouter,{initialEntries:[path]},createElement(Location),createElement(Routes,null,createElement(Route,{path:'/admin/*',element:createElement(AdminApp)})))));await settle();}
async function settle(){for(let i=0;i<5;i++)await act(async()=>new Promise(r=>setTimeout(r,70)));}
const location=()=>document.querySelector('[data-location]').textContent;
const click=async(element)=>{assert.ok(element);await act(async()=>element.click());await settle();};
test('directory filters and server sorting survive URLs and reset pagination',async()=>{
  await open('/admin/users?range=all&userKind=virtual&page=2');
  assert.ok(calls.some(c=>c.url.includes('/analytics/users?')&&new URL(c.url).searchParams.get('userKind')==='virtual'&&new URL(c.url).searchParams.get('page')==='2'));
  await click([...document.querySelectorAll('th button')].find(b=>b.textContent==='Rating'));
  assert.match(location(),/sort=mu/);assert.ok(!location().includes('page=2'));assert.match(location(),/userKind=virtual/);
  await click([...document.querySelectorAll('button')].find(b=>b.textContent==='Next'));assert.match(location(),/page=2/);
  assert.ok(calls.every(c=>new URL(c.url).hostname==='api.vamora.net'));
});
test('competition subtabs are deep links and browser Back restores their filters',async()=>{
  await open('/admin/competitions/c1/ratings?range=all&userId=u1');
  assert.match(location(),/\/ratings/);assert.ok(calls.some(c=>c.url.includes('/analytics/ratings?')&&new URL(c.url).searchParams.get('competitionId')==='c1'&&new URL(c.url).searchParams.get('userId')==='u1'));
  await click([...document.querySelectorAll('nav[aria-label="Report sections"] a')].find(a=>a.textContent==='Players'));assert.match(location(),/\/players/);
  await click(document.querySelector('[data-back]'));assert.match(location(),/\/ratings\?range=all&userId=u1/);
});
test('existing competition links redirect to live without losing the selected match',async()=>{
  await open('/admin/competitions/c1?matchId=m1');assert.equal(location(),'/admin/competitions/c1/live?matchId=m1');assert.match(document.body.textContent,/No matches yet/);
});
test('session expiry and sign-in preserve a directly opened profile subtab',async()=>{
  await open('/admin/users/u1/ratings?range=all');
  assert.ok(calls.some(c=>c.url.includes('/analytics/ratings?')&&new URL(c.url).searchParams.get('userId')==='u1'));
  await act(async()=>window.dispatchEvent(new Event('admin-session-expired')));
  document.querySelector('input[name=username]').value='verification';document.querySelector('input[name=password]').value='local-only';
  await act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await settle();
  assert.equal(location(),'/admin/users/u1/ratings?range=all');assert.match(document.body.textContent,/Verification player/);
});
test('invalid competition sections show the private 404',async()=>{await open('/admin/competitions/c1/not-a-section');assert.match(document.body.textContent,/Page not found/);});
test('charts include keyboard values, a data table and complete export context',async()=>{
  const context='User IDs: '+Array.from({length:4},(_,i)=>'player-'+i+'-'.repeat(30)).join(',')+' · Format: GROUP_KNOCKOUT';
  await act(async()=>root.render(createElement(Chart,{chart:{title:'Rating progression',kind:'line',points:[{label:'2026-10-28',value:59},{label:'2026-10-29',value:61}]},context,generatedAt:'2026-10-29T12:00:00Z'})));
  assert.equal(document.querySelectorAll('circle[tabindex="0"]').length,2);assert.match(document.querySelector('svg').textContent,/GROUP_KNOCKOUT/);assert.match(document.body.textContent,/View exact chart values/);assert.equal(document.querySelectorAll('tbody tr').length,2);assert.match(document.querySelector('svg').textContent,/Africa\/Cairo/);
});
test('users opens all registered accounts newest first and provides explicit registration order',async()=>{
  await open('/admin/users');const call=calls.find(c=>c.url.includes('/analytics/users?'));assert.ok(call);
  const query=new URL(call.url).searchParams;assert.equal(query.get('range'),'all');assert.equal(query.get('sort'),'createdAt');assert.equal(query.get('dir'),'desc');
  const select=[...document.querySelectorAll('select')].find(e=>e.querySelector('option[value=custom]'));assert.equal(select.value,'desc');
  await act(async()=>{select.value='asc';select.dispatchEvent(new Event('change',{bubbles:true}));});await settle();assert.match(location(),/dir=asc/);assert.ok(calls.some(c=>c.url.includes('/analytics/users?')&&new URL(c.url).searchParams.get('dir')==='asc'));
});
test('profile shows its image, account records, and paginated joined-competition preview',async()=>{
  await open('/admin/users/u1/overview');const image=document.querySelector('img[alt="Profile photo of Verification player"]');assert.ok(image);assert.equal(image.src,'https://api.vamora.net/uploads/profiles/avatar.webp');
  assert.match(document.body.textContent,/Account records and history/);assert.match(document.body.textContent,/Recently joined competitions/);
  const preview=calls.find(c=>c.url.includes('/analytics/enrollments?'));assert.ok(preview);const query=new URL(preview.url).searchParams;assert.equal(query.get('userId'),'u1');assert.equal(query.get('sort'),'joinedAt');assert.equal(query.get('dir'),'desc');assert.equal(query.get('range'),'all');
  await click([...document.querySelectorAll('nav[aria-label="Report sections"] a')].find(a=>a.textContent==='Joined competitions'));assert.equal(location(),'/admin/users/u1/competitions');
});
