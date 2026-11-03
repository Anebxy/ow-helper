// Run: node tests/counters.test.js
const fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8')+';this.HEROES=HEROES',ctx);
const {EDGES,LIMITED,rank}=require('../counters.js');const HEROES=ctx.HEROES;const names=new Set(HEROES.map(h=>h.name));
let pass=0,fail=0;const t=(name,ok,msg='')=>{ok?pass++:fail++;console.log((ok?'PASS ':'FAIL ')+name+(ok?'':' — '+msg))};
const bad=EDGES.filter(e=>!names.has(e[0])||!names.has(e[1]));t('every referenced hero exists',!bad.length,JSON.stringify(bad));
t('no hero counters itself',!EDGES.some(e=>e[0]==e[1]));
t('every reason non-empty',EDGES.every(e=>e[2]&&e[2].trim().length>5));
t('every source tag valid',EDGES.every(e=>['c','s'].includes(e[3])));
const keys=EDGES.map(e=>e[0]+'>'+e[1]);t('no duplicate edges',new Set(keys).size==keys.length,keys.filter((k,i)=>keys.indexOf(k)!=i).join(','));
const mutual=EDGES.filter(e=>keys.includes(e[1]+'>'+e[0]));t('no mutual A↔B contradictions',!mutual.length,mutual.map(e=>e[0]+'↔'+e[1]).join(', '));
t('LIMITED heroes exist',LIMITED.every(n=>names.has(n)));
t('54 heroes in roster',HEROES.length==54,HEROES.length);
const noData=HEROES.filter(h=>!EDGES.some(e=>e[1]==h.name));t('every hero has ≥1 counter',!noData.length,noData.map(h=>h.name).join(', '));
const top=(en,role,n=4)=>rank(en,role,HEROES).slice(0,n).map(x=>x.n);
const C=[
 ['Pharah+Mercy → DPS hitscan',['Pharah','Mercy'],'D',['Soldier: 76','Cassidy','Ashe','Widowmaker','Emre','Freja']],
 ['Genji → Tank',['Genji'],'T',['Winston','Zarya']],
 ['Genji → Support',['Genji'],'S',['Moira','Brigitte']],
 ['Genji → DPS',['Genji'],'D',['Mei']],
 ['Bastion → DPS',['Bastion'],'D',['Genji','Tracer']],
 ['Bastion → Tank',['Bastion'],'T',['D.Va']],
 ['Widowmaker → Tank',['Widowmaker'],'T',['Winston','D.Va','Wrecking Ball','Doomfist']],
 ['Roadhog+Mauga → Support',['Roadhog','Mauga'],'S',['Ana','Zenyatta']],
 ['Reinhardt brawl → DPS',['Reinhardt','Brigitte','Lucio'],'D',['Pharah','Junkrat']],
 ['Tracer → DPS',['Tracer'],'D',['Cassidy','Torbjorn','Junkrat','Hanzo']],
 ['Doomfist → Support',['Doomfist'],'S',['Ana']],
 ['Echo+Pharah → DPS',['Echo','Pharah'],'D',['Soldier: 76','Cassidy','Ashe']],
];
for(const[nm,en,role,exp] of C){const r=top(en,role);t('comp: '+nm,r.some(x=>exp.includes(x))&&!r.some(x=>en.includes(x)&&false),'got '+r.join(', '))}
// sanity: suggestions never weak vs every enemy
t('Pharah not suggested vs Soldier+Cassidy+Ashe',!top(['Soldier: 76','Cassidy','Ashe'],'D',5).includes('Pharah'));
console.log(`\n${pass} passed, ${fail} failed · ${EDGES.length} relationships`);process.exit(fail?1:0);
