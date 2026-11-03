const $=s=>document.querySelector(s),el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const TABS=[['counter','⚔️','Counter'],['maps','🗺️','Maps'],['heroes','🦸','Heroes'],['sens','🎯','Sens'],['xh','➕','Crosshair'],['pc','🖥️','PC']];
let tab='counter';TABS.forEach(([id,i,l])=>{const b=el('button',id==tab?'on':'',`<span>${i}</span>${l}`);b.onclick=()=>show(id);b.dataset.t=id;$('#nav').append(b)});
function show(id){tab=id;document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id==id));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==id));scrollTo(0,0);render()}
const q=()=>$('#q').value.trim().toLowerCase();$('#q').oninput=()=>{if(tab=='counter'||tab=='sens'||tab=='pc'||tab=='xh'){const m=MAPS.some(m=>m[0].toLowerCase().includes(q()));show(m&&!HEROES.some(h=>h.name.toLowerCase().includes(q()))?'maps':'heroes')}else render()};
const ALIAS={'Ball':'Wrecking Ball','Rein':'Reinhardt','JQ':'Junker Queen','Brig':'Brigitte','Widow':'Widowmaker'};
const slug=n=>(ALIAS[n]||n).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.:]/g,'').replace(/\s+/g,'-');
const RC={T:'#4ea3ff',D:'#ff5a5a',S:'#4fd18b'};
function ic(n){const h=HEROES.find(x=>x.name==(ALIAS[n]||n));const r=h?h.role:'D';const ini=(ALIAS[n]||n).replace(/[^A-Za-z ]/g,'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
return `<span class="hi"><img src="icons/${slug(n)}.webp" alt="" loading="lazy" width="28" height="28" onerror="this.outerHTML='<span class=&quot;fb&quot; style=&quot;background:${RC[r]}&quot;>${ini}</span>'"></span>`}
const nm=n=>n=='—'?n:`<span class="hn">${ic(n)}${n}</span>`;
const names=a=>a.map(nm).join(' ');
const HRX=new RegExp('\\b('+[...HEROES.map(h=>h.name),...Object.keys(ALIAS)].sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\w])','g');
const deco=t=>t.replace(HRX,m=>nm(m));
const H=n=>HEROES.find(h=>h.name==n);
// Counter
let enemies=new Set(),myRole='D';
function renderEnemy(){const w=$('#enemy');w.innerHTML='';['T','D','S'].forEach(r=>{const d=el('div','chips');d.style.margin='8px 0';HEROES.filter(h=>h.role==r).forEach(h=>{const c=el('button','chip r'+r+(enemies.has(h.name)?' sel':''),ic(h.name)+h.name);c.onclick=()=>{enemies.has(h.name)?enemies.delete(h.name):enemies.size<5&&enemies.add(h.name);renderEnemy();renderSugg()};d.append(c)});w.append(d)})}
const mr=$('#myrole');[['T','Tank'],['D','Damage'],['S','Support']].forEach(([r,l])=>{const c=el('button','chip'+(r==myRole?' sel':''),l);c.onclick=()=>{myRole=r;[...mr.children].forEach(x=>x.classList.remove('sel'));c.classList.add('sel');renderSugg()};mr.append(c)});
$('#clr').onclick=()=>{enemies.clear();renderEnemy();renderSugg()};
function renderSugg(){const s=$('#sugg');if(!enemies.size){s.innerHTML='<div class="card mu">Select up to 5 enemies.</div>';return}
const sc={},why={};HEROES.filter(h=>h.role==myRole).forEach(h=>{sc[h.name]=0;why[h.name]=[]});
enemies.forEach(e=>{const eh=H(e);eh.cby.forEach((c,i)=>{const n=c=='Ball'?'Wrecking Ball':c;if(n in sc){sc[n]+=4-i*0.5;why[n].push(`vs ${nm(e)}: ${WHY[n]||'strong matchup'}`)}});
HEROES.forEach(h=>{if(h.name in sc&&h.ctr.includes(e)){sc[h.name]+=1;}});
HEROES.forEach(h=>{if(h.name in sc&&eh.ctr.includes(h.name)){sc[h.name]-=2;why[h.name].push(`weak vs ${nm(e)}`)}})});
const list=Object.entries(sc).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,6);
s.innerHTML='<h2>Suggestions</h2>'+(list.length?list.map(([n,v],i)=>`<div class="card r${myRole}"><b>${i+1}. ${nm(n)}</b>${H(n).newish?'<span class="tag">limited data</span>':''} <span class="mu">score ${v.toFixed(1)}</span><div class="mu">${why[n].filter(w=>!w.startsWith('weak')).slice(0,2).join(' · ')||'Good overall into this comp'}${why[n].some(w=>w.startsWith('weak'))?' · ⚠ '+why[n].filter(w=>w.startsWith('weak')).join(', '):''}</div></div>`).join(''):'<div class="card mu">No clear counter in this role — play your comfort pick.</div>')}
// Maps
let mf='All';const modes=['All','Control','Escort','Hybrid','Push','Flashpoint'];modes.forEach(m=>{const c=el('button','chip'+(m==mf?' sel':''),m);c.onclick=()=>{mf=m;[...$('#mf').children].forEach(x=>x.classList.toggle('sel',x==c));render()};$('#mf').append(c)});
function renderMaps(){$('#maplist').innerHTML=MAPS.filter(m=>(mf=='All'||m[1]==mf)&&m[0].toLowerCase().includes(q())).map(m=>`<div class="card"><b>${m[0]}</b> <span class="tag">${m[1]}</span><div><span class="mu">Comps:</span> ${deco(m[2])}</div><div class="mu">${deco(m[3])}</div></div>`).join('')}
// Heroes
let hf='All';['All','Tank','Damage','Support'].forEach(m=>{const c=el('button','chip'+(m==hf?' sel':''),m);c.onclick=()=>{hf=m;[...$('#hf').children].forEach(x=>x.classList.toggle('sel',x==c));render()};$('#hf').append(c)});
function renderHeroes(){$('#herolist').innerHTML=HEROES.filter(h=>(hf=='All'||R[h.role]==hf)&&h.name.toLowerCase().includes(q())).map(h=>`<div class="card r${h.role}"><b>${nm(h.name)}</b> <span class="tag">${R[h.role]}${h.sub!='—'?' · '+h.sub:''}</span>${h.newish?'<span class="tag">limited data</span>':''}<ul>${h.tips.map(t=>`<li>${t}</li>`).join('')}</ul><div><span class="mu">Countered by:</span> ${names(h.cby)}</div><div><span class="mu">Good into:</span> ${names(h.ctr)}</div><div><span class="mu">Settings:</span> ${h.set} Aim assist: n/a on PC mouse.</div></div>`).join('')}
// Sens
const SCOPED=[['Widowmaker',30,1],['Ana',30,1],['Ashe',30,1],['Freja',null,0],['Emre',null,0]];
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
function renderSens(){const s=+$('#hs').value||0,d=+$('#dpi').value||0,f=+$('#fov').value||103,p=$('#mdm').value;
$('#edpi').textContent=(s*d).toFixed(0);$('#cm').textContent=s&&d?(360/(s*0.0066*d)*2.54).toFixed(2):'—';
const bv=2*Math.atan(Math.tan(rad(f)/2)*9/16);
$('#scoped').innerHTML='<table><tr><th>Hero</th><th>Zoomed %</th><th>Scoped cm/360</th></tr>'+SCOPED.map(([n,zv,ok])=>{if(!zv)return `<tr><td>${nm(n)}</td><td colspan=2 class="mu">Zoom FOV not verified — start at ${p=='360'?'100':'37.89'} and test in Practice Range</td></tr>`;
let v;const z=rad(zv);if(p=='360')v=100;else if(p=='0')v=100*Math.tan(z/2)/Math.tan(bv/2);else{const k=+p,zh=2*Math.atan(Math.tan(z/2)*16/9),bh=rad(f);v=100*Math.atan(k*Math.tan(zh/2))/Math.atan(k*Math.tan(bh/2))}
const cm=s&&d?(360/(s*0.0066*d*v/100)*2.54).toFixed(1):'—';return `<tr><td>${nm(n)}</td><td class="big">${v.toFixed(2)}</td><td>${cm}</td></tr>`}).join('')+'</table>'}
['hs','dpi','fov','mdm'].forEach(i=>$('#'+i).oninput=renderSens);
// Crosshair
function drawXH(cv,o,type){const c=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H/2,S=3;c.clearRect(0,0,W,H);c.globalAlpha=o.op/100;
const rect=(x,y,w,h)=>{if(o.outline){c.fillStyle='#000';c.fillRect(x-S,y-S,w+2*S,h+2*S)}c.fillStyle=o.color;c.fillRect(x,y,w,h)};
const t=o.thick*S,l=o.len*S,g=o.gap*S;if(type=='Crosshair'&&l>0){rect(cx-t/2,cy-g-l,t,l);rect(cx-t/2,cy+g,t,l);rect(cx-g-l,cy-t/2,l,t);rect(cx+g,cy-t/2,l,t)}
if(o.dot){const r=o.dot*S/2;if(o.outline){c.fillStyle='#000';c.beginPath();c.arc(cx,cy,r+S,0,7);c.fill()}c.fillStyle=o.color;c.beginPath();c.arc(cx,cy,r,0,7);c.fill()}}
function renderXH(){const g=$('#xgrid');g.innerHTML='';XH.forEach(([n,type,o])=>{const txt=`Type: ${type}\nColor: ${o.color.toUpperCase()}\nThickness: ${o.thick}\nCrosshair length: ${o.len}\nCenter gap: ${o.gap}\nOpacity: ${o.op}%\nOutline opacity: ${o.outline?100:0}%\nDot size: ${o.dot}\nDot opacity: ${o.dot?100:0}%`;
const d=el('div','card',`<b>${n}</b> <span class="tag">popular style</span>`);const cv=el('canvas');cv.width=160;cv.height=110;d.prepend(cv);drawXH(cv,o,type);d.append(el('pre','',txt));const b=el('button','cp','Copy');b.onclick=()=>navigator.clipboard?.writeText(txt).then(()=>b.textContent='Copied');d.append(b);g.append(d)})}
// PC
const PC=[['Video (max FPS, low latency)',['Display Mode: Fullscreen (exclusive)','Resolution: native; Render Scale 100% (or lower if CPU/GPU bound)','Field of View: 103','Frame Rate: Custom; cap ≈ refresh × ~2 or a stable value (e.g. 237 on 240Hz with G-Sync, or uncapped minus 10% headroom if no VRR)','NVIDIA Reflex: Enabled + Boost (if GPU-bound)','V-Sync, Triple Buffering: Off','Reduce Buffering: On (if no Reflex option)','Graphics Quality: Low; Texture Quality: Medium/High if VRAM allows (little FPS cost)','Texture Filtering: 8x–16x (cheap)','Local Fog, Dynamic Reflections, Shadows, Ambient Occlusion, Local Reflections, Damage FX: Low/Off','Model Detail: Low; Effects Detail: Low (clearer visuals)','High Precision Mouse Input: On','Show performance stats: FPS, latency (Options → Video → Performance stats)']],
['Game options',['Controls → General: disable mouse acceleration (game has none by default)','Reticle: Advanced, see Crosshair tab','Waypoint/Friendly outlines: default','Sound: Dolby Atmos for Headphones / Windows Sonic on (if available)','Enable “Show Hero Portrait” / kill feed for awareness','Hit marker: on; Critical hit sound on']],
['Windows checklist',['Windows Game Mode: On','Hardware-accelerated GPU scheduling: test on/off (usually On)','Power plan: High/Ultimate Performance','Disable “Enhance pointer precision”','Disable Xbox Game Bar captures/overlays you don\'t use','Disable fullscreen optimizations only if you see stutter','Close browsers/launchers running in background','Keep chipset & GPU drivers updated']],
['NVIDIA / GPU',['Low Latency Mode: Off (Reflex in-game handles it)','Power management: Prefer maximum performance','G-Sync on (fullscreen) + in-game cap 3 FPS under refresh','Texture filtering quality: High performance','AMD: Anti-Lag on, Radeon Chill off']],
['Monitor / mouse',['Refresh rate set correctly in Windows display settings','Mouse polling 1000Hz+; DPI 400–1600','Overdrive: medium (avoid inverse ghosting)']]];
$('#pcs').innerHTML=PC.map(([t,l])=>`<div class="card"><b>${t}</b><ul>${l.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
function render(){renderMaps();renderHeroes()}
renderEnemy();renderSugg();renderSens();renderXH();render();
