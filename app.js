const $=s=>document.querySelector(s);
HEROES.forEach(h=>{h.cbyE=EDGES.filter(e=>e[1]==h.name);h.ctrE=EDGES.filter(e=>e[0]==h.name);h.cby=h.cbyE.map(e=>e[0]);h.ctr=h.ctrE.map(e=>e[1]);h.newish=LIMITED.includes(h.name)});
const ALIAS={'Ball':'Wrecking Ball','Rein':'Reinhardt','JQ':'Junker Queen','Brig':'Brigitte','Widow':'Widowmaker'};
const full=n=>ALIAS[n]||n,H=n=>HEROES.find(h=>h.name==full(n));
const slug=n=>full(n).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.:]/g,'').replace(/\s+/g,'-');
const RC={T:'Tank',D:'Damage',S:'Support'};
const av=n=>{const h=H(n),r=h?h.role:'D',ini=full(n).replace(/[^A-Za-z ]/g,'').split(' ').map(w=>w[0]).join('').slice(0,2);
 return `<span class="av r${r}" style="background:var(--${r})"><img src="icons/${slug(n)}.webp?v=4" alt="" loading="lazy" onerror="this.replaceWith('${ini}')" onload="this.parentNode.style.background=''"></span>`};
const pchip=n=>H(n)?`<button class="pc" onclick="openHero('${full(n)}')">${av(n)}${full(n)}</button>`:'';
const HRX=new RegExp('\\b('+[...HEROES.map(h=>h.name),...Object.keys(ALIAS)].sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?!\\w)','g');
const heroesIn=t=>[...new Set((t.match(HRX)||[]).map(full))];
const ICONS={counter:'<path d="M5 19 19 5M14 5h5v5M5 5l5 5M14 14l5 5M19 14v5h-5"/>',maps:'<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',heroes:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',sens:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',xh:'<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',pc:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'};
const TABS=[['counter','Counter'],['maps','Maps'],['heroes','Heroes'],['sens','Sens'],['xh','Crosshair'],['pc','PC']];
let tab='counter';
$('#nav').innerHTML=TABS.map(([id,l])=>`<button data-t="${id}"><svg viewBox="0 0 24 24">${ICONS[id]}</svg>${l}</button>`).join('');
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.t)};
function go(t){tab=t;$('#q').value='';$('.search').classList.remove('has');render();scrollTo(0,0)}
$('#q').oninput=()=>{$('.search').classList.toggle('has',!!$('#q').value);render()};$('#qx').onclick=()=>go(tab);
function render(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==tab));const q=$('#q').value.trim().toLowerCase();
 const m=$('#main');m.style.animation='none';m.offsetHeight;m.style.animation='';m.innerHTML=q?vSearch(q):V[tab]();after[tab]&&!q&&after[tab]()}
const note='<div class="note">Unofficial fan tool · data reflects public sources as of Nov 2026 · counters are community heuristics</div>';
// sheet
function sheet(html){$('#sheetBody').innerHTML=html;$('#sheet').scrollTop=0;document.body.classList.add('sh')}
const closeSheet=()=>document.body.classList.remove('sh');$('#scrim').onclick=closeSheet;
let y0;$('#sheet').addEventListener('touchstart',e=>{y0=$('#sheet').scrollTop<=0?e.touches[0].clientY:null},{passive:true});
$('#sheet').addEventListener('touchend',e=>{if(y0!=null&&e.changedTouches[0].clientY-y0>90)closeSheet()});
const heroGrid=(list,click,sel)=>`<div class="grid">${list.map(h=>`<button class="ht${sel&&sel.has(h.name)?' sel':''}" onclick="${click}('${h.name}')">${av(h.name)}<span class="n">${h.name}</span></button>`).join('')}</div>`;
const roleGroups=(click,sel,filter=h=>1)=>['T','D','S'].map(r=>{const l=HEROES.filter(h=>h.role==r&&filter(h));return l.length?`<div class="rolehdr r${r}"><span class="dot"></span>${RC[r]} · ${l.length}</div>`+heroGrid(l,click,sel):''}).join('');
// COUNTER
let enemies=new Set(),myRole='D';
function tog(n){enemies.has(n)?enemies.delete(n):enemies.size<5&&enemies.add(n);render()}
const suggest=()=>rank([...enemies],myRole,HEROES).slice(0,5);
const V={};
V.counter=()=>{const s=suggest();const slots=[...enemies].map(av).join('')+'<span class="slot"></span>'.repeat(5-enemies.size);
 return `<h2>Counter-pick</h2><p class="sub">Tap up to 5 enemies, choose your role.</p>
 <div class="tray"><div class="slots">${slots}</div>${enemies.size?'<button class="btn" onclick="enemies.clear();render()">Clear</button>':''}</div>
 <div class="seg">${Object.entries(RC).map(([r,l])=>`<button class="${r==myRole?'on':''}" onclick="myRole='${r}';render()">I play ${l}</button>`).join('')}</div>
 ${enemies.size?`<h3>Best picks</h3>${s.length?s.map((x,i)=>`<button class="card res r${myRole}" style="width:100%;text-align:left" onclick="openHero('${x.n}')"><span class="rank">${i+1}</span>${av(x.n)}<span class="t"><b>${x.n}</b><div class="why">${x.why.slice(0,2).map(w=>`<b style="font-weight:600;color:#cfd5df">vs ${w.e}:</b> ${w.r}`).join('<br>')}</div>${x.weak.length?`<div class="why warn">⚠ watch ${x.weak.join(', ')}</div>`:''}</span></button>`).join(''):'<div class="card empty">No clear counter here — play your comfort pick.</div>'}`:''}
 <h3>Enemy team</h3>${roleGroups('tog',enemies)}${note}`};
// MAPS
let mode='All';const MODES=['All','Control','Escort','Hybrid','Push','Flashpoint'];
const style=m=>m[2].split(/[ (]/)[0].replace(/\/.*/,'');
const mapRows=l=>`<div class="list">${l.map(m=>`<button class="row" onclick="openMap('${m[0].replace(/'/g,"\\'")}')"><span class="grow"><b>${m[0]}</b><br><span class="tag mode-${m[1]}">${m[1]}</span><span class="tag">${m[2].replace(/\s*\(.*\)/,'')}</span></span><span class="chev">›</span></button>`).join('')}</div>`;
V.maps=()=>`<h2>Maps</h2><p class="sub">${MAPS.length} maps in rotation · tap for picks & tips</p><div class="seg" style="overflow-x:auto">${MODES.map(x=>`<button class="${x==mode?'on':''}" onclick="mode='${x}';render()">${x=='Flashpoint'?'Flash':x}</button>`).join('')}</div>`+mapRows(MAPS.filter(m=>mode=='All'||m[1]==mode))+note;
function openMap(n){const m=MAPS.find(x=>x[0]==n),picks=heroesIn(m[2]),tips=m[3].split(/(?<=\.)\s+|;\s*/).filter(Boolean);
 sheet(`<h2>${m[0]}</h2><div style="margin:6px 0 4px"><span class="tag mode-${m[1]}">${m[1]}</span><span class="tag or">${m[2].replace(/\s*\(.*\)/,'')}</span></div>
 <h3>Best picks</h3>${picks.length?`<div class="chips">${picks.map(pchip).join('')}</div>`:'<p class="hint">Meta still forming — flexible comps.</p>'}
 <h3>Tips</h3><ul class="b">${tips.map(t=>`<li>${t[0].toUpperCase()+t.slice(1).replace(/\.$/,'')}</li>`).join('')}</ul>`)}
// HEROES
let hrole='All';
V.heroes=()=>`<h2>Heroes</h2><p class="sub">${HEROES.length} heroes · tap for tips, counters & settings</p><div class="seg">${['All','T','D','S'].map(r=>`<button class="${r==hrole?'on':''}" onclick="hrole='${r}';render()">${RC[r]||'All'}</button>`).join('')}</div>`+roleGroups('openHero',null,h=>hrole=='All'||h.role==hrole)+note;
const erows=(l,i)=>l.length?`<div class="list">${l.map(e=>`<button class="row sc" onclick="openHero('${e[i]}')">${av(e[i])}<span class="grow"><b>${e[i]}</b><div class="hint">${e[2]}</div></span><span class="tag ${e[3]=='c'?'':'or'}">${e[3]=='c'?'consensus':'stats'}</span></button>`).join('')}</div>`:'<p class="hint">No verified matchups listed.</p>';
function openHero(n){const h=H(n);sheet(`<div class="shead">${av(h.name)}<div><h2>${h.name}</h2><span class="tag r${h.role}">${RC[h.role]}</span>${h.sub!='—'?`<span class="tag">${h.sub}</span>`:''}${h.newish?'<span class="tag or">limited data</span>':''}</div></div>
 <h3>Key tips</h3><ul class="b">${h.tips.map(t=>`<li>${t[0].toUpperCase()+t.slice(1).replace(/\.$/,'')}</li>`).join('')}</ul>
 <h3>Countered by</h3>${erows(h.cbyE,0)}<h3>Good into</h3>${erows(h.ctrE,1)}
 <h3>Settings</h3><ul class="b"><li>${h.set=='—'?'Defaults are fine':h.set}</li><li>Aim assist: n/a on PC mouse</li></ul>`)}
// SENS
const SCOPED=[['Widowmaker',30,'Zoom vFOV 30° · Blizzard forums & r/Overwatch (37.89)'],['Ana',30,'Zoom vFOV 30° · Blizzard forums & r/Overwatch (37.89)'],['Ashe',40,'Zoom vFOV 40° · Blizzard forums & r/Overwatch (51.47)'],['Cassidy',40,'Only with Silver Bullet perk · same zoom as Ashe · r/Overwatch (51.47)'],['Emre',42.5,'Zoom vFOV 42.5° workshop-measured · r/Competitiveoverwatch (54.99); community estimates 54.69–55.08'],['Freja',47.5,'Zoom vFOV 47.5° · r/Competitiveoverwatch (62.22); 62.50 also widely cited (Blizzard forums)']],rad=d=>d*Math.PI/180;
let S={hs:5,dpi:800,fov:103,mdm:'0'};
V.sens=()=>`<h2>Scoped sensitivity</h2><p class="sub">Match zoomed aim to your hipfire.</p><div class="card calc"><div class="fields">
 <div><label>Sens</label><input id="hs" type="number" inputmode="decimal" step="0.01" value="${S.hs}"></div><div><label>DPI</label><input id="dpi" type="number" inputmode="numeric" value="${S.dpi}"></div><div><label>FOV</label><input id="fov" type="number" inputmode="numeric" value="${S.fov}"></div></div>
 <div style="margin-top:10px"><label>Match method</label><select id="mdm">${[['0','0% monitor distance · recommended'],['0.5','50% monitor distance'],['0.75','75% monitor distance'],['1','100% monitor distance'],['360','360° distance (1:1)']].map(([v,l])=>`<option value="${v}"${v==S.mdm?' selected':''}>${l}</option>`).join('')}</select></div></div>
 <div id="sout"></div>
 <details><summary>How it works<span class="c">formula</span></summary><div style="padding:0 14px 14px" class="hint"><p>cm/360 = 360 ÷ (sens × 0.0066 × DPI) × 2.54</p><p>Set the % at Options → Controls → hero → “Relative aim sensitivity while zoomed”.</p><p>0% MDM = tan(zoom vFOV/2) ÷ tan(base vFOV/2) ≈ <b>37.89</b> (Widow/Ana), 51.47 (Ashe/Cassidy perk), 54.99 (Emre), 62.22 (Freja) at FOV 103. Zoom FOVs are community-measured; Blizzard publishes none. The game default <b>30</b> is slower than 0% MDM. 360° match = 100.</p></div></details>${note}`;
function sens(){['hs','dpi','fov','mdm'].forEach(k=>S[k]=$('#'+k).value);const s=+S.hs,d=+S.dpi,f=+S.fov||103,p=S.mdm,bv=2*Math.atan(Math.tan(rad(f)/2)*9/16);
 const cm=x=>s&&d?(360/(s*x*.0066*d)*2.54):0;
 $('#sout').innerHTML=`<div class="stats"><div class="stat"><div class="k">eDPI</div><div class="v">${Math.round(s*d)}</div></div><div class="stat"><div class="k">cm / 360°</div><div class="v">${cm(1)?cm(1).toFixed(1):'—'}</div></div></div><h3>Zoomed %</h3><p class="hint">Heroes with a per-hero zoom sensitivity setting. Cassidy has none by default — the option only applies with his Silver Bullet perk. Sojourn, Hanzo, Junkrat etc. have no zoom setting.</p><div class="list">`+SCOPED.map(([n,zv,src])=>{
 const z=rad(zv);let v=p=='360'?100:p=='0'?100*Math.tan(z/2)/Math.tan(bv/2):100*Math.atan(+p*Math.tan(2*Math.atan(Math.tan(z/2)*16/9)/2))/Math.atan(+p*Math.tan(rad(f)/2));
 return `<div class="row sc">${av(n)}<span class="grow"><b>${n}</b><div class="hint">${cm(v/100)?cm(v/100).toFixed(1)+' cm/360 scoped · ':''}<span style="font-size:11px">${src}</span></div></span><span class="v">${v.toFixed(2)}</span></div>`}).join('')+'</div>'}
const after={sens:()=>{['hs','dpi','fov','mdm'].forEach(k=>$('#'+k).oninput=sens);sens()},xh:()=>document.querySelectorAll('.xc canvas').forEach((c,i)=>drawXH(c,XH[i][2],XH[i][1],1.6))};
// CROSSHAIR
function drawXH(cv,o,type,k){const dpr=2,W=cv.width=cv.clientWidth*dpr||320,H_=cv.height=W*.62,c=cv.getContext('2d'),cx=W/2,cy=H_/2,S_=k*dpr;c.globalAlpha=o.op/100;
 const rect=(x,y,w,h)=>{if(o.outline){c.fillStyle='#000';c.fillRect(x-S_,y-S_,w+2*S_,h+2*S_)}c.fillStyle=o.color;c.fillRect(x,y,w,h)};const t=o.thick*S_,l=o.len*S_,g=o.gap*S_;
 if(type=='Crosshair'&&l>0){rect(cx-t/2,cy-g-l,t,l);rect(cx-t/2,cy+g,t,l);rect(cx-g-l,cy-t/2,l,t);rect(cx+g,cy-t/2,l,t)}
 if(o.dot){const r=o.dot*S_/2;if(o.outline){c.fillStyle='#000';c.beginPath();c.arc(cx,cy,r+S_,0,7);c.fill()}c.fillStyle=o.color;c.beginPath();c.arc(cx,cy,r,0,7);c.fill()}}
const xtxt=(type,o)=>`Type: ${type}\nColor: ${o.color.toUpperCase()}\nThickness: ${o.thick}\nCrosshair length: ${o.len}\nCenter gap: ${o.gap}\nOpacity: ${o.op}%\nOutline opacity: ${o.outline?100:0}%\nDot size: ${o.dot}\nDot opacity: ${o.dot?100:0}%`;
V.xh=()=>`<h2>Crosshairs</h2><p class="sub">Tap one for exact settings. All labeled “popular style” — no pro attribution verified.</p><div class="xg">${XH.map(([n],i)=>`<button class="xc" onclick="openXH(${i})"><canvas></canvas><div>${n}</div></button>`).join('')}</div>`+note;
function openXH(i){const[n,type,o]=XH[i];sheet(`<h2>${n}</h2><span class="tag">popular style</span><div class="xc" style="margin-top:12px"><canvas id="bigx"></canvas></div><pre id="xt">${xtxt(type,o)}</pre><button class="btn pri" style="width:100%;padding:13px" onclick="navigator.clipboard&&navigator.clipboard.writeText($('#xt').textContent);this.textContent='Copied ✓'">Copy settings</button><p class="hint">Options → Controls → General → Reticle → Advanced</p>`);requestAnimationFrame(()=>drawXH($('#bigx'),o,type,2.6))}
// PC
const PC=[['Video · max FPS & low latency',['Display Mode: Fullscreen (exclusive)','Resolution native · Render Scale 100%','Field of View: 103','Frame cap: ~3 below refresh with G-Sync (e.g. 237 @240Hz), else stable high cap','NVIDIA Reflex: Enabled + Boost','V-Sync & Triple Buffering: Off','Reduce Buffering: On (if no Reflex)','Graphics Quality: Low · Textures Medium/High if VRAM allows','Texture Filtering: 8x–16x','Fog, Reflections, Shadows, AO: Low/Off','Model & Effects Detail: Low (clearer)','High Precision Mouse Input: On','Show performance stats: FPS + latency']],
['Game options',['Mouse acceleration: none (default)','Reticle: Advanced (see Crosshair tab)','Dolby Atmos / Windows Sonic for Headphones','Hit markers & crit sound on','Kill feed & hero portraits visible']],
['Windows',['Game Mode: On','HW-accelerated GPU scheduling: test On','Power plan: High / Ultimate Performance','Enhance pointer precision: Off','Disable unused Xbox Game Bar captures','Close background browsers & launchers','Update chipset & GPU drivers']],
['NVIDIA / AMD',['NVIDIA Low Latency Mode: Off (Reflex handles it)','Power management: Prefer max performance','G-Sync on + cap 3 below refresh','Texture filtering quality: High performance','AMD: Anti-Lag on · Radeon Chill off']],
['Monitor & mouse',['Refresh rate set in Windows display settings','Mouse polling 1000Hz+ · DPI 400–1600','Overdrive: medium (no inverse ghosting)']]];
const done=JSON.parse(localStorage.owpc||'{}');function ck(k,v){done[k]=v;localStorage.owpc=JSON.stringify(done);render()}
V.pc=()=>`<h2>PC settings</h2><p class="sub">Tick items as you apply them · saved on this device.</p>`+PC.map(([t,l],gi)=>{const n=l.filter((_,i)=>done[gi+'-'+i]).length;return `<details${gi==0?' open':''}><summary>${t}<span class="c">${n}/${l.length}</span></summary>${l.map((x,i)=>`<label class="chk"><input type="checkbox"${done[gi+'-'+i]?' checked':''} onchange="ck('${gi}-${i}',this.checked)"><span>${x}</span></label>`).join('')}</details>`}).join('')+note;
// SEARCH
function vSearch(q){const hs=HEROES.filter(h=>h.name.toLowerCase().includes(q)),ms=MAPS.filter(m=>m[0].toLowerCase().includes(q)||m[1].toLowerCase().includes(q));
 return `<h2>Results</h2>${hs.length?`<h3>Heroes</h3>${heroGrid(hs,'openHero')}`:''}${ms.length?`<h3>Maps</h3>${mapRows(ms)}`:''}${!hs.length&&!ms.length?'<div class="empty">No matches</div>':''}`}
// deep links: #counter=Winston,Genji&role=D | #map=Dorado | #tab=xh
(function(){const p=new URLSearchParams(location.hash.slice(1));if(p.get('tab'))tab=p.get('tab');if(p.get('counter'))p.get('counter').split(',').forEach(n=>H(n)&&enemies.add(H(n).name));if(p.get('role'))myRole=p.get('role');render();if(p.get('map')){tab='maps';render();openMap(p.get('map'))}if(p.get('hero'))openHero(p.get('hero'))})();
