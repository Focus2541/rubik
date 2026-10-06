(() => {
const $=s=>document.querySelector(s);
const APP_VER='7';
const FACE={U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]};
const DEF_COL={U:'#FFD500',D:'#F4F6F8',F:'#009E60',B:'#0051BA',R:'#FF5800',L:'#C41E3A'};
const DEF_NAME={U:'เหลือง',D:'ขาว',F:'เขียว',B:'น้ำเงิน',R:'ส้ม',L:'แดง'};
const COL={...DEF_COL,X:'repeating-linear-gradient(45deg,#7d8796 0 5px,#8f99a8 5px 10px)'};
const NAME={...DEF_NAME},N=NAME;
const POS={U:'ด้านบน',D:'ด้านล่าง',F:'ด้านหน้า',B:'ด้านหลัง',R:'ด้านขวา',L:'ด้านซ้าย'};
try{const sv=JSON.parse(localStorage.getItem('rubik-colors')||'null');if(sv){Object.assign(COL,sv.col||{});Object.assign(NAME,sv.name||{});}}catch(e){}
const saveColors=()=>{const col={};for(const f in DEF_COL)col[f]=COL[f];try{localStorage.setItem('rubik-colors',JSON.stringify({col,name:NAME}));}catch(e){}};
const MOVES={R:[0,1,-1],L:[0,-1,1],U:[1,1,-1],D:[1,-1,1],F:[2,1,-1],B:[2,-1,1]};
const DIRS=[[[1,0,0],'rotateY(90deg)'],[[-1,0,0],'rotateY(-90deg)'],[[0,1,0],'rotateX(90deg)'],[[0,-1,0],'rotateX(-90deg)'],[[0,0,1],''],[[0,0,-1],'rotateY(180deg)']];
const key=v=>v.join(',');
const stage=$('#stage'),cubeEl=$('#cube');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON={
  restart:'<svg class="i" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>',
  back:'<svg class="i" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  next:'<svg class="i" viewBox="0 0 24 24"><path d="M7 6l7 6-7 6"/><path d="M18 6v12"/></svg>',
  play:'<svg class="i" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>',
  pause:'<svg class="i" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" stroke-width="3.2"/></svg>'
};
let S=46,vx=-28,vy=-38,cubies=[];

function rot(v,ax,d){const[x,y,z]=v;
  if(ax===0)return d<0?[x,z,-y]:[x,-z,y];
  if(ax===1)return d<0?[-z,y,x]:[z,y,-x];
  return d<0?[y,-x,z]:[-y,x,z];}
function parse(t){let[ax,l,d]=MOVES[t[0]];const m=t.slice(1);let n=1;if(m.includes('2'))n=2;else if(m==="'")d=-d;return{ax,l,d,n};}
const split=s=>s.trim().split(/\s+/).filter(Boolean);
const inv=t=>t.endsWith('2')?t:t.endsWith("'")?t[0]:t+"'";
const invert=a=>a.slice().reverse().map(inv);
const FN={R:'ด้านขวา',L:'ด้านซ้าย',U:'ด้านบน',D:'ด้านล่าง',F:'ด้านหน้า',B:'ด้านหลัง'};
const describe=t=>{const m=t.slice(1);return`หมุน${FN[t[0]]} ${m==="'"?'ทวนเข็มนาฬิกา ↺':m.includes('2')?'2 ครั้ง (ครึ่งรอบ)':'ตามเข็มนาฬิกา ↻'}`;};

function build(){
  cubeEl.textContent='';cubies=[];
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
    if(!x&&!y&&!z)continue;
    const st={};
    for(const f in FACE){const n=FACE[f];if((n[0]&&n[0]===x)||(n[1]&&n[1]===y)||(n[2]&&n[2]===z))st[key(n)]=f;}
    const el=document.createElement('div');el.className='cubie';
    const faces=DIRS.map(([n,r])=>{const f=document.createElement('div');f.className='face';f.dataset.r=r;f.appendChild(document.createElement('i'));el.appendChild(f);return[f,n];});
    cubeEl.appendChild(el);cubies.push({p:[x,y,z],st,el,faces});
  }
  layout();
}
const baseT=(c,a=[0,0,0])=>`rotateX(${a[0]}deg) rotateY(${a[1]}deg) rotateZ(${a[2]}deg) translate3d(${c.p[0]*S}px,${-c.p[1]*S}px,${c.p[2]*S}px)`;
function paint(c){
  const center=Math.abs(c.p[0])+Math.abs(c.p[1])+Math.abs(c.p[2])===1;
  for(const[f,n]of c.faces){const i=f.firstChild,col=c.st[key(n)];
    if(col){i.style.display='';i.style.background=COL[col];i.textContent=center&&col!=='X'?col:'';}else i.style.display='none';}
}
function renderC(c){c.el.style.transition='none';c.el.style.transform=baseT(c);paint(c);}
function layout(){
  S=Math.max(30,Math.floor(Math.min(stage.clientWidth,stage.clientHeight)/5.6));
  for(const c of cubies){
    for(const[f]of c.faces){f.style.width=f.style.height=S+'px';f.style.left=f.style.top=(-S/2)+'px';f.style.fontSize=(S*.34)+'px';f.style.transform=`${f.dataset.r} translateZ(${S/2}px)`;}
    renderC(c);
  }
}
const setView=()=>{cubeEl.style.transform=`rotateX(${vx}deg) rotateY(${vy}deg)`;};
function applyModel(t){const{ax,l,d,n}=parse(t);
  for(const c of cubies){if(c.p[ax]!==l)continue;
    for(let k=0;k<n;k++){c.p=rot(c.p,ax,d);const s={};for(const q in c.st)s[key(rot(q.split(',').map(Number),ax,d))]=c.st[q];c.st=s;}}
}
function isSolved(){const m={};for(const c of cubies)for(const k in c.st){if(m[k]===undefined)m[k]=c.st[k];else if(m[k]!==c.st[k])return false;}return true;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function animate(t,dur){
  const{ax,l,d,n}=parse(t);const th=d*90*n;const a=[0,0,0];a[ax]=ax===1?th:-th;
  const aff=cubies.filter(c=>c.p[ax]===l);
  if(reduce||dur<=0){applyModel(t);aff.forEach(renderC);return sleep(reduce?Math.min(dur,120):0);}
  aff.forEach(c=>{c.el.style.transition=`transform ${dur}ms cubic-bezier(.45,0,.2,1)`;c.el.style.transform=baseT(c,a);});
  return sleep(dur+25).then(()=>{applyModel(t);aff.forEach(renderC);void cubeEl.offsetWidth;});
}

// ---------- queue ----------
let queue=[],busy=false,idleWaiters=[];
function enqueue(job){queue.push(job);if(!busy)runQueue();}
async function runQueue(){busy=true;renderPlayer();
  while(queue.length){const j=queue.shift();j.before&&j.before();await animate(j.tok,j.dur);j.after&&j.after();}
  busy=false;idleWaiters.splice(0).forEach(r=>r());renderPlayer();}
const idle=()=>busy?new Promise(r=>idleWaiters.push(r)):Promise.resolve();
const stopAll=()=>{queue=[];};

// ---------- state ----------
let mode='intro',demo=null,history=[],scrambleSeq=[],armed=false,t0=0,elapsed=null,running=false,autoTimer=null;
const toTop=()=>{if(innerWidth<980)scrollTo({top:0,behavior:reduce?'auto':'smooth'});};

async function loadDemo(title,alg,setup,autoplay,kind,segs){
  stopAll();clearTimeout(autoTimer);await idle();build();
  const moves=split(alg);
  if(setup&&setup.length===54)strToModel(setup);
  else{(setup==='none'?[]:invert(moves)).forEach(applyModel);cubies.forEach(renderC);}
  mode='demo';demo={title,alg,setup,moves,i:0,now:null,kind:kind||'lesson',segs};renderPlayer();
  if(autoplay)autoTimer=setTimeout(()=>playDemo(true),reduce?100:600);
}
function playDemo(all){
  if(!demo||busy)return;
  const d=demo,end=all?d.moves.length:Math.min(d.i+1,d.moves.length);
  const dur=d.moves.length===1?650:d.kind==='solution'?520:430;
  const spk=d.kind!=='lesson';
  for(let k=d.i;k<end;k++)enqueue({tok:d.moves[k],dur:spk&&all&&voiceOn?Math.max(dur,900):dur,before:()=>{d.now=k;if(spk)sayMove(d,k);renderPlayer();},after:()=>{d.i=k+1;d.now=null;if(spk&&d.i>=d.moves.length)setTimeout(()=>say(thVoice?'เสร็จแล้ว':'done'),700);renderPlayer();}});
}
function stepBack(){
  if(!demo||busy||demo.i===0)return;const d=demo,k=d.i-1;
  enqueue({tok:inv(d.moves[k]),dur:380,before:()=>{d.now=k;renderPlayer();},after:()=>{d.i=k;d.now=null;renderPlayer();}});
}
const fmt=ms=>(ms/1000).toFixed(1);
function segInfo(d,idx,tt){
  if(!d.segs||!d.segs.length)return;const i=Math.min(idx,d.moves.length-1);
  const g=d.segs.find(g=>i>=g.start&&i<g.end)||d.segs[d.segs.length-1];
  if(idx>=d.moves.length)return;
  tt.textContent=`ขั้น ${g.step}/7 ${g.title}`;$('#mvNote').textContent=g.note;
}
function flatSegs(segs){let a=0;const out=[],moves=[];for(const g of segs){out.push({step:g.step,title:g.title,note:g.note,start:a,end:a+g.moves.length});a+=g.moves.length;moves.push(...g.moves);}return{segs:out,moves};}
function segHTML(segs){
  return segs.map(g=>`<div class="seg"><span class="badge" style="--sc:${stepCol(g.step)};--sci:${inkOn(stepCol(g.step))}">${g.step}</span><div><b>${g.title}</b><small>${g.note}</small><code>${g.moves.join(' ')}</code></div></div>`).join('');
}

function renderPlayer(){
  voiceUI();
  const big=$('#mvBig'),tt=$('#mvTitle'),ds=$('#mvDesc'),chips=$('#chips'),ctr=$('#ctrls'),fill=$('#trackFill'),track=$('#track');
  $('#mvNote').textContent='';big.className='';ds.className='';chips.textContent='';ctr.textContent='';ctr.hidden=true;track.hidden=true;chips.hidden=true;
  const chip=(t,c)=>{const s=document.createElement('span');s.className='chip '+(c||'');s.textContent=t;chips.appendChild(s);return s;};
  const cbtn=(html,label,fn,primary,dis)=>{const b=document.createElement('button');b.type='button';b.className='cbtn'+(primary?' primary':'');b.innerHTML=html;b.setAttribute('aria-label',label);b.disabled=!!dis;b.onclick=fn;ctr.appendChild(b);};
  if(mode==='demo'&&demo&&demo.live){
    const d=demo,n=d.moves.length,done=d.i>=n;
    tt.textContent=d.title;segInfo(d,d.i,tt);
    if(done){big.textContent='✓';big.className='ok';ds.textContent='เรียงเสร็จแล้ว เก่งมาก!';ds.className='ok';}
    else{big.textContent=d.moves[d.i];big.className=d.off?'warn':'now';
      ds.textContent=d.off?'ลูกไม่ตรงกับท่าที่บอก ลองหมุนกลับ หรือกดคำนวณใหม่':d.half?`หมุน ${d.moves[d.i][0]} ต่ออีก 1 ครั้ง`:`หมุนลูกจริง: ${describe(d.moves[d.i])} (${d.i+1}/${n})`;}
    track.hidden=false;fill.style.width=(d.i/n*100)+'%';
    chips.hidden=false;let el=null;d.moves.forEach((t,k)=>{const e=chip(t,k<d.i?'done':k===d.i?'next':'');if(k===d.i)el=e;});
    if(el)requestAnimationFrame(()=>{chips.scrollLeft=el.offsetLeft-chips.clientWidth/2+el.offsetWidth/2;});
    ctr.hidden=false;ctr.style.gridTemplateColumns='1fr 1fr';
    if(d.kind==='solution')cbtn(ICON.restart+'คำนวณใหม่','คำนวณวิธีแก้ใหม่จากลูกตอนนี้',()=>{goLive('live');selectTab('solve');btSolve();},!done&&d.off);
    else if(d.kind==='hint')cbtn(ICON.restart+'ใบ้ใหม่','ใบ้ใหม่จากลูกตอนนี้',coachHint,!done&&d.off);
    else cbtn(ICON.restart+'สุ่มใหม่','สุ่มโจทย์ใหม่',btScramble,false);
    cbtn('เลิก','เลิกทำตาม',()=>goLive(curTab==='practice'?'practice':'live'),false);
    return;
  }
  ctr.style.gridTemplateColumns='';
  if(mode==='live'){
    tt.textContent='ลูกจริง (บลูทูธ)';const last=bt.moves[bt.moves.length-1];
    big.textContent=last||'BT';if(!last)big.className='long';
    if(bt.facelet===SOLVED){ds.textContent='ลูกเรียงครบทุกด้าน';ds.className='ok';}else ds.textContent='หมุนลูกจริง แล้วลูกในจอจะหมุนตาม';
    if(bt.moves.length){chips.hidden=false;bt.moves.slice(-30).forEach(t=>chip(t));requestAnimationFrame(()=>{chips.scrollLeft=chips.scrollWidth;});}
    return;
  }
  if(mode==='demo'&&demo){
    const d=demo,n=d.moves.length,done=d.i>=n&&(!busy||d.now==null),cur=Math.min(d.now!=null?d.now:d.i,n-1);
    tt.textContent=d.title;segInfo(d,cur,tt);
    if(done){big.textContent='✓';big.className='ok';ds.textContent=d.kind==='solution'?'เรียงเสร็จแล้ว เก่งมาก!':'จบท่าแล้ว';ds.className='ok';}
    else{big.textContent=d.moves[cur];if(d.now!=null)big.className='now';ds.textContent=(d.now!=null?'':'ท่าต่อไป: ')+describe(d.moves[cur])+`  (${cur+1}/${n})`;}
    track.hidden=false;fill.style.width=(d.i/n*100)+'%';
    if(n>1){chips.hidden=false;let el=null;
      d.moves.forEach((t,k)=>{const e=chip(t,k===d.now?'now':k<d.i?'done':(k===d.i&&!busy)?'next':'');if(k===cur)el=e;});
      if(el)requestAnimationFrame(()=>{chips.scrollLeft=el.offsetLeft-chips.clientWidth/2+el.offsetWidth/2;});}
    ctr.hidden=false;
    cbtn(ICON.restart,'เริ่มใหม่',()=>loadDemo(d.title,d.alg,d.setup,false,d.kind,d.segs),false,busy);
    cbtn(ICON.back,'ย้อน 1 ท่า',stepBack,false,busy||d.i===0);
    if(busy)cbtn(ICON.pause+'หยุด','หยุด',stopAll,true);
    else if(done)cbtn(ICON.restart+'ดูอีกครั้ง','ดูอีกครั้ง',()=>loadDemo(d.title,d.alg,d.setup,true,d.kind,d.segs),true);
    else cbtn(ICON.play+'เล่นทั้งหมด','เล่นทั้งหมด',()=>playDemo(true),true);
    cbtn(ICON.next,'ทีละท่า',()=>playDemo(false),false,busy||done);
  }else if(mode==='practice'){
    tt.textContent='ฝึกหมุนเอง';big.className='long';
    const solvedNow=isSolved()&&history.length>0;
    big.textContent=running?fmt(performance.now()-t0):elapsed!=null?(curPen==='dnf'?'DNF':fmt(elapsed+(curPen||0))+(curPen?'+':'')):'0.0';
    if(armed&&!running&&insp.start){const e=(performance.now()-insp.start)/1000;
      big.textContent=e<15?String(Math.ceil(15-e)):e<17?'+2':'DNF';big.className='long'+(e>=8?' warn':'');
      ds.textContent='เวลาดูโจทย์ หมุนท่าแรกเมื่อพร้อม';return;}
    if(solvedNow){big.className='long ok';ds.textContent=`เรียงครบทุกด้าน! ${history.length} ท่า`+(elapsed!=null?` ใน ${fmt(elapsed)} วินาที`:'');ds.className='ok';}
    else ds.textContent=running?`กำลังจับเวลา หมุนไปแล้ว ${history.length} ท่า`:armed?'หมุนท่าแรกเพื่อเริ่มจับเวลา':bt.on?'กด “สุ่มโจทย์ให้ทำตาม” หรือหมุนลูกจริงได้เลย':scrambleSeq.length?'หมุนท่าแรกเพื่อเริ่มจับเวลา':'กด “สุ่มโจทย์ใหม่” เพื่อเริ่ม';
    if(history.length){chips.hidden=false;history.slice(-30).forEach(t=>chip(t));requestAnimationFrame(()=>{chips.scrollLeft=chips.scrollWidth;});}
  }else if(mode==='edit'){
    const n=entry.filter((x,i)=>x!=='X'&&i%9!==4).length;
    tt.textContent='กรอกสีจากลูกจริง';big.className='long';big.textContent=`${Math.round(n/48*100)}%`;
    ds.textContent=n<48?`กรอกแล้ว ${n} จาก 48 ช่อง`:'ครบแล้ว กด “หาวิธีแก้” ได้เลย';
    track.hidden=false;fill.style.width=(n/48*100)+'%';
  }else{
    tt.textContent='ลูกบาศก์จำลอง';big.className='long';big.textContent='3×3';
    ds.textContent='กด “ดูตัวอย่าง” ในบทเรียน แล้วลูกนี้จะหมุนให้ดู';
  }
}
let inspOn=false;try{inspOn=localStorage.getItem('rubik-insp')==='1';}catch(e){}
const insp={start:null,w8:false,w12:false};let curPen=0;
function startInspection(){if(!inspOn)return;insp.start=performance.now();insp.w8=insp.w12=false;}
function startTimer(){
  if(insp.start){const e=(performance.now()-insp.start)/1000;curPen=e>17?'dnf':e>15?2000:0;insp.start=null;}else curPen=0;
  running=true;t0=performance.now();elapsed=null;}
setInterval(()=>{
  if(mode!=='practice')return;
  if(insp.start&&!running){const e=(performance.now()-insp.start)/1000;
    if(e>=8&&!insp.w8){insp.w8=true;say(thVoice?'แปดวินาที':'eight seconds');}
    if(e>=12&&!insp.w12){insp.w12=true;say(thVoice?'สิบสองวินาที':'twelve seconds');}
    renderPlayer();}
  else if(running)renderPlayer();
},100);

// ---------- voice ----------
let voiceOn=false;try{voiceOn=localStorage.getItem('rubik-voice')==='1';}catch(e){}
const HAS_TTS='speechSynthesis' in window;let thVoice=null;
function pickVoice(){try{thVoice=speechSynthesis.getVoices().find(v=>/^th/i.test(v.lang))||null;}catch(e){}}
if(HAS_TTS){pickVoice();try{speechSynthesis.addEventListener('voiceschanged',pickVoice);}catch(e){}}
const TH_L={R:'อาร์',L:'แอล',U:'ยู',D:'ดี',F:'เอฟ',B:'บี'};
function moveWords(t){const m=t.slice(1);return thVoice?TH_L[t[0]]+(m==="'"?' ไพรม์':m.includes('2')?' สอง':''):t[0]+(m==="'"?' prime':m.includes('2')?' two':'');}
function say(text,force){if(!HAS_TTS||(!voiceOn&&!force)||!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);
  if(thVoice){u.voice=thVoice;u.lang=thVoice.lang;}else u.lang=/[ก-๙]/.test(text)?'th-TH':'en-US';u.rate=1.05;speechSynthesis.speak(u);}catch(e){}}
function segAt(d,k){return d.segs?d.segs.find(g=>k>=g.start&&k<g.end):null;}
function sayMove(d,k){const t=d.moves[k];if(!t)return;const g=segAt(d,k);let pre='';
  if(g&&g.start===k)pre=thVoice?`ขั้น ${g.step} ${g.title} `:`step ${g.step}, `;say(pre+moveWords(t));}
function voiceUI(){const b=$('#voiceBtn');if(!b)return;b.hidden=!HAS_TTS||!(mode==='demo'&&demo&&demo.kind!=='lesson');b.setAttribute('aria-pressed',voiceOn);
  $('#voiceWave').style.display=voiceOn?'':'none';$('#voiceMute').style.display=voiceOn?'none':'';}
$('#voiceBtn').onclick=()=>{voiceOn=!voiceOn;try{localStorage.setItem('rubik-voice',voiceOn?'1':'0');}catch(e){}voiceUI();
  if(voiceOn){if(demo&&demo.live&&demo.i<demo.moves.length)sayMove(demo,demo.i);else say(thVoice?'เปิดเสียงแล้ว':'voice on',true);}else if(HAS_TTS)speechSynthesis.cancel();};

// ---------- lessons ----------
const Y='#FFD500',YI='#18213A';
const STEPS=[
 {n:'เริ่ม',t:'อ่านสัญลักษณ์ก่อน',goal:'ชื่อท่าหมุนที่ใช้ในทุกสูตร',sc:'var(--accent)',sci:'var(--accent-ink)',nota:true,
  tip:'ถือรูบิคให้สีเหลืองอยู่บน สีขาวอยู่ล่างตลอดทุกขั้น ในแอปนี้ด้านหน้าเป็นสีเขียว'},
 {n:'1',t:'กากบาทสีขาว',goal:'ขอบขาว 4 ชิ้นเป็นกากบาทด้านล่าง สีข้างตรงกับจุดกลาง',sc:'#F4F6F8',sci:YI,
  how:['ทำ “ดอกเดซี่” พาขอบขาว 4 ชิ้นขึ้นไปล้อมจุดกลางสีเหลือง ขั้นนี้ลองหมุนเอง ไม่ต้องจำสูตร','หมุน U จนสีข้างของขอบขาวชิ้นหนึ่งตรงกับจุดกลางด้านนั้น','หมุนด้านนั้น 2 ครั้ง ขอบขาวจะลงไปอยู่ด้านล่าง ทำซ้ำให้ครบ 4 ชิ้น'],
  algs:[['F2','พาขอบขาวลงล่าง','F2']],tip:'ถ้าช่องที่จะใส่มีขอบขาวอยู่แล้ว ให้หมุน U หลบก่อน'},
 {n:'2',t:'มุมสีขาว',goal:'ใส่มุมขาว 4 มุม ให้ชั้นล่างเสร็จ',sc:'#F4F6F8',sci:YI,
  how:['หามุมที่มีสีขาวในชั้นบน','หมุน U จนมุมอยู่เหนือช่องของมัน (ระหว่างจุดกลาง 2 สีของมุมนั้น)','หันมุมไว้ หน้า-ขวา-บน แล้วทำสูตรซ้ำจนมุมลงถูกที่ (1, 3 หรือ 5 รอบ)'],
  algs:[["R U R' U'",'ทำซ้ำจนมุมลงถูกที่',"R U R' U' R U R' U' R U R' U'"]],tip:'มุมขาวติดชั้นล่างแต่ผิดที่: หันไว้ หน้า-ขวา-ล่าง แล้วทำสูตร 1 รอบเพื่อดึงขึ้นมาก่อน'},
 {n:'3',t:'ชั้นกลาง',goal:'ใส่ขอบ 4 ชิ้นของชั้นกลาง',sc:'#009E60',sci:'#FFFFFF',
  how:['หาขอบในชั้นบนที่ไม่มีสีเหลือง','หมุน U จนสีหน้าของขอบตรงกับจุดกลางด้านหน้า (เห็นเป็นตัว T กลับหัว)','สีบนของขอบตรงกับด้านขวา ใช้สูตรไปขวา ตรงกับด้านซ้าย ใช้สูตรไปซ้าย'],
  algs:[["U R U' R' U' F' U F",'ใส่ขอบไปทางขวา',"U R U' R' U' F' U F"],["U' L' U L U F U' F'",'ใส่ขอบไปทางซ้าย',"U' L' U L U F U' F'"]],tip:'ขอบติดชั้นกลางแต่กลับด้าน: ทำสูตรไปขวาตรงนั้น 1 ครั้งเพื่อดึงออกมาก่อน'},
 {n:'4',t:'กากบาทสีเหลือง',goal:'ทำกากบาทเหลืองด้านบน ยังไม่ต้องสนใจมุม',sc:Y,sci:YI,
  how:['เห็นแค่จุดตรงกลาง: ทำสูตร 1 ครั้ง จะได้ตัว L','เห็นตัว L: หันแขนตัว L ไปทางหลังกับทางซ้าย (เหมือนเข็มนาฬิกาตอน 9 โมง) แล้วทำสูตร','เห็นเส้นตรง: หันให้เส้นนอนซ้าย-ขวา แล้วทำสูตร จะได้กากบาท'],
  algs:[["F R U R' U' F'",'ใช้ได้ทั้ง 3 แบบ',"F R U R' U' F'"]]},
 {n:'5',t:'ขอบเหลืองให้ตรงสี',goal:'สีข้างของขอบเหลืองตรงกับจุดกลางครบ 4 ด้าน',sc:Y,sci:YI,
  how:['หมุน U จนมีขอบที่ตรงสีอย่างน้อย 2 ชิ้น','2 ชิ้นอยู่ติดกัน: หันให้อยู่ด้านหลังกับด้านขวา แล้วทำสูตร','2 ชิ้นอยู่ตรงข้ามกัน: ทำสูตร 1 ครั้งก่อน จะกลายเป็นแบบติดกัน'],
  algs:[["R U R' U R U2 R' U",'สลับขอบหน้ากับขอบซ้าย',"R U R' U R U2 R' U"]]},
 {n:'6',t:'วางมุมเหลือง',goal:'มุมเหลืองทุกมุมอยู่ถูกที่ หันผิดทางได้',sc:Y,sci:YI,
  how:['หามุมที่ 3 สีตรงกับจุดกลาง 3 ด้านรอบมัน','หันมุมนั้นไว้ หน้า-ขวา-บน แล้วทำสูตร 1–2 ครั้ง','ไม่เจอเลยสักมุม: ทำสูตร 1 ครั้งจากมุมไหนก็ได้ แล้วจะเจอ'],
  algs:[["U R U' L' U R' U' L",'มุมหน้า-ขวา-บนอยู่กับที่ อีก 3 มุมวนกัน',"U R U' L' U R' U' L"]]},
 {n:'7',t:'หมุนมุมเหลือง',goal:'ขั้นสุดท้าย หมุนมุมให้เหลืองหันขึ้นทั้งหมด',sc:Y,sci:YI,
  how:['หันมุมที่ยังไม่เสร็จไว้ หน้า-ขวา-บน','ทำสูตรซ้ำจนเหลืองของมุมนั้นหันขึ้น (2 หรือ 4 ครั้ง)','หมุนแค่ U พามุมถัดไปมาไว้ที่เดิม แล้วทำซ้ำ ห้ามหมุนทั้งลูก','ครบทุกมุมแล้ว หมุน U ให้ตรงสี เสร็จ!'],
  algs:[["R' D' R D",'ทำซ้ำทีละมุม',"R' D' R D R' D' R D U R' D' R D R' D' R D R' D' R D R' D' R D U'"]],tip:'ระหว่างทำ ชั้นล่างจะดูเละ ไม่ต้องตกใจ ทำต่อให้ครบแล้วจะกลับมาเอง'},
];
let prog={};try{prog=JSON.parse(localStorage.getItem('rubik-progress')||'{}')||{};}catch(e){}
let curStep=0;try{curStep=Math.min(7,Math.max(0,+localStorage.getItem('rubik-step')||0));}catch(e){}
let track='basic',advStep=0;try{track=localStorage.getItem('rubik-track')==='adv'?'adv':'basic';advStep=Math.min(4,Math.max(0,+localStorage.getItem('rubik-advstep')||0));}catch(e){}
const ADV=[
 {n:'เริ่ม',t:'ขั้นสูง: 2-look OLL/PLL',goal:'เล่นเร็วขึ้นด้วยสูตรที่ทำทีละมากกว่า',
  how:['ทำขั้น 1–3 ของพื้นฐานให้คล่องก่อน (กากบาท มุมล่าง ชั้นกลาง)','แทนขั้น 4–7 ด้วย 4 ขั้นในหมวดนี้: OLL ทำหน้าบนให้เป็นสีเดียว แล้ว PLL สลับชิ้นให้ถูกที่','ทั้งหมดมี 16 สูตร ค่อย ๆ จำทีละขั้นได้ ระหว่างนั้นใช้วิธีพื้นฐานแทนส่วนที่ยังจำไม่ได้'],
  algs:[],tip:'ถือสีเหลืองไว้บนตลอด เหมือนในบทเรียนพื้นฐาน ใช้หมุน U ปรับตำแหน่งก่อนทำสูตรแทนการหมุนทั้งลูก'},
 {n:'1',t:'OLL ขอบ: กากบาทเหลือง',goal:'ทำกากบาทเหลืองในครั้งเดียว',
  how:['เส้นตรง: หันให้เส้นนอนซ้าย-ขวา แล้วใช้สูตรแรก','ตัว L: หันแขนตัว L ไปทางหลังกับทางซ้าย แล้วใช้สูตรที่สอง','จุด: ใช้สูตรที่สาม (คือสองสูตรแรกต่อกัน)'],
  algs:[["F R U R' U' F'",'เส้นตรง (นอนซ้าย-ขวา)',"F R U R' U' F'"],["F U R U' R' F'",'ตัว L (แขนชี้หลังกับซ้าย)',"F U R U' R' F'"],["F R U R' U' F' U2 F U R U' R' F'",'จุดตรงกลาง',"F R U R' U' F' U2 F U R U' R' F'"]]},
 {n:'2',t:'OLL มุม: หน้าบนเหลืองทั้งหมด',goal:'ดูว่ามีมุมเหลืองบนกี่มุม แล้วเลือกสูตร',
  how:['มุมเหลือง 1 มุม (รูปปลา): ซูน หรือ แอนติซูน','ไม่มีมุมเหลืองบนเลย: H หรือ Pi','มุมเหลือง 2 มุม: ไฟหน้า, T หรือ โบว์ไท','กด “ดู” เพื่อดูรูปแบบของแต่ละสูตรบนลูกบาศก์ด้านบน'],
  algs:[["R U R' U R U2 R'",'ซูน: มุมเหลืองอยู่หน้า-ซ้าย สีเหลืองของมุมหน้า-ขวาหันมาด้านหน้า',"R U R' U R U2 R'"],
        ["R U2 R' U' R U' R'",'แอนติซูน: มุมเหลืองอยู่หลัง-ขวา สีเหลืองของมุมหน้า-ซ้ายหันมาด้านหน้า',"R U2 R' U' R U' R'"],
        ["R U R' U R U' R' U R U2 R'",'H: ไม่มีมุมบน เหลืองเป็นคู่อยู่ด้านซ้ายและด้านขวา',"R U R' U R U' R' U R U2 R'"],
        ["R U2 R2 U' R2 U' R2 U2 R",'Pi: ไม่มีมุมบน ด้านซ้ายมีเหลือง 2 อัน ด้านขวาไม่มี',"R U2 R2 U' R2 U' R2 U2 R"],
        ["R2 D R' U2 R D' R' U2 R'",'ไฟหน้า: มุมเหลือง 2 มุมอยู่ด้านหลัง ด้านหน้ามีเหลือง 2 อัน',"R2 D R' U2 R D' R' U2 R'"],
        ["L F R' F' L' F R F'",'T: มุมเหลือง 2 มุมอยู่ด้านขวา สีเหลืองของมุมซ้ายหันไปหน้าและหลัง',"L F R' F' L' F R F'"],
        ["F R' F' L F R F' L'",'โบว์ไท: มุมเหลือง 2 มุมทแยงกัน (หลัง-ซ้าย กับ หน้า-ขวา)',"F R' F' L F R F' L'"]],
  tip:'ถ้าลูกยังไม่ตรงกับรูปแบบไหน ให้หมุน U แล้วดูใหม่'},
 {n:'3',t:'PLL มุม: วางมุมให้ถูกที่',goal:'ดูด้านข้างชั้นบน หา “ไฟหน้า” (2 มุมสีเดียวกันบนด้านเดียว)',
  how:['มีไฟหน้าด้านเดียว: หันไฟหน้าไว้ด้านซ้าย แล้วใช้สูตร T','ไม่มีไฟหน้าเลย: ใช้สูตร Y จากมุมไหนก็ได้','มีไฟหน้าทุกด้าน: มุมถูกที่แล้ว ข้ามไปขั้นต่อไป'],
  algs:[["R U R' U' R' F R2 U' R' U' R U R' F'",'T: ไฟหน้าไว้ด้านซ้าย',"R U R' U' R' F R2 U' R' U' R U R' F'"],["F R U' R' U' R U R' F' R U R' U' R' F R F'",'Y: ไม่มีไฟหน้า สลับมุมทแยง',"F R U' R' U' R U R' F' R U R' U' R' F R F'"]]},
 {n:'4',t:'PLL ขอบ: จบ!',goal:'สลับขอบชั้นบนให้ตรงสี แล้วหมุน U เป็นอันเสร็จ',
  how:['มีขอบถูกที่ 1 ด้าน: หันด้านนั้นไว้ด้านหลัง แล้วลอง Ua ถ้ายังไม่ตรงใช้ Ub','ไม่มีขอบถูกที่เลยและขอบตรงข้ามสลับกัน: H','ไม่มีขอบถูกที่และขอบที่ติดกันสลับกัน: Z'],
  algs:[["R U' R U R U R U' R' U' R2",'Ua: ขอบที่ถูกที่ไว้ด้านหลัง',"R U' R U R U R U' R' U' R2"],["R2 U R U R' U' R' U' R' U R'",'Ub: ขอบที่ถูกที่ไว้ด้านหลัง',"R2 U R U R' U' R' U' R' U R'"],
        ["R2 U2 R U2 R2 U2 R2 U2 R U2 R2",'H: สลับขอบตรงข้าม 2 คู่',"R2 U2 R U2 R2 U2 R2 U2 R U2 R2"],["R' U' R U' R U R U' R' U R U R2 U' R' U",'Z: สลับขอบที่ติดกัน 2 คู่',"R' U' R U' R U R U' R' U R U R2 U' R' U"]],
  tip:'จบแล้วหมุน U ให้ทุกด้านตรงสี เสร็จ! ลองจับเวลาในหน้าฝึกเทียบกับวิธีพื้นฐาน'},
];
const saveProg=()=>{try{localStorage.setItem('rubik-progress',JSON.stringify(prog));localStorage.setItem('rubik-step',curStep);localStorage.setItem('rubik-track',track);localStorage.setItem('rubik-advstep',advStep);}catch(e){}};
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function goStep(i,trk){if(trk&&trk!==track)track=trk;if(track==='adv')advStep=i;else curStep=i;saveProg();renderLesson();if(innerWidth<980){const r=$('#stepper').getBoundingClientRect();if(r.top<0||r.top>innerHeight*.6)$('#stepper').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}}
const CW={'ขาว':'D','เหลือง':'U','เขียว':'F'};
const ct=t=>t?t.replace(/ขาว|เหลือง|เขียว/g,w=>NAME[CW[w]]):t;
const inkOn=h=>{try{const[r,g,b]=unhex(h);return(r*.299+g*.587+b*.114)>150?'#18213A':'#FFFFFF';}catch(e){return'#18213A';}};
const stepCol=n=>n<=2?COL.D:n===3?COL.F:COL.U;
function renderLesson(){
  const adv=track==='adv',LS=adv?ADV:STEPS,cs=adv?advStep:curStep,pk=i=>adv?'a'+i:i,last=LS.length-1;
  document.querySelectorAll('#trackSel [data-track]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.track===track));
  const sp=$('#stepper');sp.textContent='';
  LS.forEach((s,i)=>{const b=el('button','pill'+(prog[pk(i)]?' done':''),prog[pk(i)]&&i!==cs?'✓':s.n);b.type='button';b.setAttribute('aria-label',`ขั้น ${s.n} ${s.t}`);if(i===cs)b.setAttribute('aria-current','step');b.onclick=()=>goStep(i);sp.appendChild(b);});
  const cur=sp.children[cs];requestAnimationFrame(()=>{sp.scrollLeft=cur.offsetLeft-sp.clientWidth/2+cur.offsetWidth/2;});
  const s=LS[cs],L=$('#lesson');L.textContent='';
  const head=el('div','lhead');const bd=el('span','badge',s.n==='เริ่ม'?'?':s.n);
  const bc=cs===0?null:adv?COL.U:stepCol(cs);
  if(bc){bd.style.setProperty('--sc',bc);bd.style.setProperty('--sci',inkOn(bc));}else{bd.style.setProperty('--sc','var(--accent)');bd.style.setProperty('--sci','var(--accent-ink)');}
  const ht=el('div');ht.append(el('h2','',ct(s.t)),el('p','',ct(s.goal)));head.append(bd,ht);L.appendChild(head);
  if(s.nota){
    const r=el('div','rules');
    [['R','หมุนด้านขวา'],['L','หมุนด้านซ้าย'],['U','หมุนด้านบน'],['D','หมุนด้านล่าง'],['F','หมุนด้านหน้า'],['B','หมุนด้านหลัง'],['R','ตัวอักษรเฉย ๆ คือหมุนตามเข็มนาฬิกา ↻ เมื่อมองตรงไปที่ด้านนั้น'],["R'",'มีขีด (อ่านว่า “ไพรม์”) คือหมุนทวนเข็มนาฬิกา ↺'],['R2','มีเลข 2 คือหมุน 2 ครั้ง']].forEach(([a,b],k)=>{if(k===6)r.appendChild(el('div','',''))&&r.appendChild(el('div','',''));r.append(el('b','',a),el('span','',b));});
    L.appendChild(r);
    L.appendChild(el('p','muted small','แตะเพื่อดูแต่ละท่าบนลูกบาศก์ด้านบน'));
    const g=el('div','nota');["R","R'","L","L'","U","U'","D","D'","F","F'","B","B'"].forEach(t=>{const b=el('button','',t);b.type='button';b.onclick=()=>{toTop();loadDemo(`ท่า ${t}`,t,'none',true);};g.appendChild(b);});
    L.appendChild(g);
  }else{
    const ol=el('ol','how');s.how.forEach(h=>ol.appendChild(el('li','',ct(h))));L.appendChild(ol);
    s.algs.forEach(([a,cap,demoAlg])=>{const box=el('div','algbox');const d=el('div');const c=el('code');c.textContent=a;d.append(c,el('small','',ct(cap)));
      const b=el('button','btn primary',ICON.play+'ดู');b.type='button';b.setAttribute('aria-label',`ดูตัวอย่างสูตร ${a}`);
      b.onclick=()=>{toTop();loadDemo(`${adv?'ขั้นสูง ':''}ขั้น ${s.n}: ${ct(s.t)}`,demoAlg,undefined,true);};box.append(d,b);L.appendChild(box);});
  }
  if(s.tip)L.appendChild(el('p','tip','💡 '+ct(s.tip)));
  const ft=el('div','lfoot');
  const prev=el('button','btn','ก่อนหน้า');prev.disabled=cs===0;prev.onclick=()=>goStep(cs-1);
  const dn=el('button','btn done-btn',prog[pk(cs)]?'✓ ทำได้แล้ว':'ทำได้แล้ว');dn.setAttribute('aria-pressed',!!prog[pk(cs)]);
  dn.onclick=()=>{prog[pk(cs)]=!prog[pk(cs)];saveProg();renderLesson();};
  if(cs===0)dn.style.visibility='hidden';
  const nx=el('button','btn primary',cs===last?'ไปฝึก':'ถัดไป');nx.onclick=()=>cs===last?selectTab('practice'):goStep(cs+1);
  ft.append(prev,dn,nx);L.appendChild(ft);
}
document.querySelectorAll('#trackSel [data-track]').forEach(b=>b.onclick=()=>{track=b.dataset.track;saveProg();renderLesson();});

// ---------- practice ----------
function userMove(t){
  if(mode!=='practice')enterPractice();
  enqueue({tok:t,dur:170,before:()=>{if(armed&&!running)startTimer();},after:()=>{history.push(t);
    if(running&&isSolved()){running=false;armed=false;elapsed=performance.now()-t0;recordSolve(elapsed,history.length,false);}renderPlayer();}});
}
function enterPractice(){if(mode!=='practice'){history=[];scrambleSeq=[];running=false;elapsed=null;armed=false;stopAll();}clearTimeout(autoTimer);mode='practice';demo=null;renderPlayer();}
function genScramble(len){
  const faces='RLUDFB',axis={R:0,L:0,U:1,D:1,F:2,B:2},mods=['',"'",'2'],seq=[];
  while(seq.length<len){const f=faces[Math.random()*6|0],p1=seq.length?seq[seq.length-1][0]:null,p2=seq.length>1?seq[seq.length-2][0]:null;
    if(f===p1)continue;if(p1&&p2&&axis[f]===axis[p1]&&axis[f]===axis[p2])continue;seq.push(f+mods[Math.random()*3|0]);}
  return seq;}
async function scramble(){
  stopAll();await idle();build();mode='practice';demo=null;history=[];running=false;elapsed=null;armed=false;
  const seq=genScramble(20);
  scrambleSeq=seq;toTop();
  seq.forEach((t,k)=>enqueue({tok:t,dur:60,after:k===seq.length-1?()=>{armed=true;startInspection();renderPlayer();}:null}));
}
$('#scramble').onclick=scramble;
$('#reset').onclick=async()=>{stopAll();await idle();build();mode='practice';demo=null;history=[];scrambleSeq=[];running=false;elapsed=null;armed=false;renderPlayer();};
$('#undo').onclick=()=>{if(busy||mode!=='practice'||!history.length)return;const t=history.pop();enqueue({tok:inv(t),dur:170,after:renderPlayer});};
$('#unscramble').onclick=async()=>{
  if(mode!=='practice')return;stopAll();await idle();
  const seq=invert(scrambleSeq.concat(history));if(!seq.length)return;
  running=false;armed=false;elapsed=null;toTop();
  seq.forEach((t,k)=>enqueue({tok:t,dur:220,after:()=>{if(k===seq.length-1){history=[];scrambleSeq=[];}renderPlayer();}}));
};
function renderPad(){const pad=$('#pad');pad.textContent='';
  ['R','L','U','D','F','B',"R'","L'","U'","D'","F'","B'",'R2','L2','U2','D2','F2','B2'].forEach(t=>{const b=el('button','',t);b.type='button';b.style.setProperty('--dot',COL[t[0]]);b.setAttribute('aria-label',describe(t));b.onclick=()=>userMove(t);pad.appendChild(b);});}

// ---------- solve from a real cube ----------
const ORDER='URFDLB';
const WIZ=[
 ['F','ด้านหน้า',()=>`ถือให้สี${N.U}อยู่บน แล้วหันด้านที่กลางเป็นสี${N.F}เข้าหาตัว`,()=>`ฝั่งสี${N.U}`,()=>'',[-18,0]],
 ['R','ด้านขวา',()=>`จากด้านสี${N.F} หมุนทั้งลูกไปทางซ้าย 1 ครั้ง (สี${N.U}ยังอยู่บน) จะเห็นกลางสี${N.R}`,()=>`ฝั่งสี${N.U}`,()=>'',[-18,-90]],
 ['B','ด้านหลัง',()=>`หมุนทั้งลูกไปทางซ้ายอีก 1 ครั้ง จะเห็นกลางสี${N.B}`,()=>`ฝั่งสี${N.U}`,()=>'',[-18,180]],
 ['L','ด้านซ้าย',()=>`หมุนทั้งลูกไปทางซ้ายอีก 1 ครั้ง จะเห็นกลางสี${N.L}`,()=>`ฝั่งสี${N.U}`,()=>'',[-18,90]],
 ['U','ด้านบน',()=>`หันด้านสี${N.F}เข้าหาตัว แล้วพลิกให้ด้านสี${N.U}หันเข้าหาตัว ด้านสี${N.F}จะอยู่ล่าง`,()=>'',()=>`ฝั่งสี${N.F}`,[-72,0]],
 ['D','ด้านล่าง',()=>`หันด้านสี${N.F}เข้าหาตัว แล้วพลิกให้ด้านสี${N.D}หันเข้าหาตัว ด้านสี${N.F}จะอยู่บน`,()=>`ฝั่งสี${N.F}`,()=>'',[72,0]],
];
const blankEntry=()=>{const a=[];for(const f of ORDER)for(let i=0;i<9;i++)a.push(i===4?f:'X');return a;};
let entry=[];try{entry=(localStorage.getItem('rubik-entry')||'').split('');}catch(e){}
if(entry.length!==54||!/^[URFDLBX]+$/.test(entry.join(''))||ORDER.split('').some((f,i)=>entry[i*9+4]!==f))entry=blankEntry();
const saveEntry=()=>{try{localStorage.setItem('rubik-entry',entry.join(''));}catch(e){}};
let curFace='F',curColor='U',solverReady=false,appSnap=null,samples={},overrides=new Set(),photo=null;
function facePos(f,r,c){switch(f){
  case'U':return[c-1,1,r-1];case'D':return[c-1,-1,1-r];case'F':return[c-1,1-r,1];
  case'B':return[1-c,1-r,-1];case'R':return[1,1-r,1-c];default:return[-1,1-r,c-1];}}
const at=p=>cubies.find(q=>q.p[0]===p[0]&&q.p[1]===p[1]&&q.p[2]===p[2]);
function strToModel(s){build();ORDER.split('').forEach((f,fi)=>{for(let k=0;k<9;k++)at(facePos(f,k/3|0,k%3)).st[key(FACE[f])]=s[fi*9+k];});cubies.forEach(renderC);}
function modelToStr(){let s='';for(const f of ORDER)for(let k=0;k<9;k++)s+=at(facePos(f,k/3|0,k%3)).st[key(FACE[f])];return s;}
function faceView(){const w=WIZ.find(w=>w[0]===curFace);vx=w[5][0];vy=w[5][1];setView();}
async function enterEdit(){stopAll();clearTimeout(autoTimer);await idle();if(mode!=='edit')appSnap=modelToStr();mode='edit';demo=null;strToModel(entry.join(''));faceView();renderEditor();renderPlayer();}
const cellBg=v=>v==='X'?'#8f99a8':COL[v];
function renderEditor(){
  $('#solveHold').innerHTML=`ถือรูบิคให้ <b>สี${N.U}อยู่บน สี${N.F}อยู่หน้า</b> แล้วกรอกให้ครบ 6 ด้าน`;
  const ft=$('#faceTabs');ft.textContent='';
  for(const w of WIZ){const f=w[0],fi=ORDER.indexOf(f);const b=el('button','ftab');b.type='button';b.setAttribute('aria-pressed',f===curFace);
    const mini=el('div','mini');let full=true;for(let k=0;k<9;k++){const c=el('b');const v=entry[fi*9+k];if(v==='X')full=false;c.style.background=cellBg(v);mini.appendChild(c);}
    b.append(mini,w[1].replace('ด้าน',''));if(full)b.appendChild(el('span','ok','✓'));b.onclick=()=>{curFace=f;renderEditor();faceView();};ft.appendChild(b);}
  const w=WIZ.find(w=>w[0]===curFace),fi=ORDER.indexOf(curFace);
  $('#faceName').textContent=`${w[1]} (กลางสี${NAME[curFace]})`;$('#faceHow').textContent=w[2]();
  $('#labTop').textContent=w[3]();$('#labBottom').textContent=w[4]();
  $('#photoTop').textContent=' '+(w[3]()||`ฝั่งตรงข้ามกับสี${N.F}`);
  const g=$('#grid9');g.textContent='';
  for(let k=0;k<9;k++){const v=entry[fi*9+k];const b=el('button');b.type='button';
    if(v==='X')b.className='unset';else b.style.background=COL[v];
    b.setAttribute('aria-label',`ช่อง ${k+1}: ${v==='X'?'ยังไม่กรอก':'สี'+NAME[v]}`);
    if(k===4){b.disabled=true;b.textContent=curFace;}else b.onclick=()=>paintCell(fi*9+k);
    g.appendChild(b);}
  const pal=$('#palette');pal.textContent='';
  for(const f of 'UDFBRL'){const n=entry.filter(x=>x===f).length;const b=el('button','swatch');b.type='button';b.setAttribute('aria-pressed',f===curColor);
    const i=el('i');i.style.background=COL[f];const c=el('span',n>9?'over':'',`${n}/9`);
    b.append(i,el('span','',NAME[f]),c);b.onclick=()=>{curColor=f;renderEditor();};pal.appendChild(b);}
  const i=WIZ.findIndex(w=>w[0]===curFace);$('#prevFace').disabled=i===0;$('#nextFace').disabled=i===5;
  renderColorRows();renderPad();if(typeof renderLesson==='function')renderLesson();
}
async function paintCell(idx){
  if(mode!=='edit')await enterEdit();
  entry[idx]=entry[idx]===curColor?'X':curColor;overrides.add(idx);saveEntry();
  const f=ORDER[idx/9|0],k=idx%9;const c=at(facePos(f,k/3|0,k%3));c.st[key(FACE[f])]=entry[idx];paint(c);
  showMsg('');renderEditor();renderPlayer();
}
const moveFace=d=>{const i=WIZ.findIndex(w=>w[0]===curFace)+d;if(i<0||i>5)return;curFace=WIZ[i][0];renderEditor();faceView();};
$('#nextFace').onclick=()=>moveFace(1);$('#prevFace').onclick=()=>moveFace(-1);
$('#clearFace').onclick=async()=>{const fi=ORDER.indexOf(curFace);delete samples[curFace];for(let k=0;k<9;k++){overrides.delete(fi*9+k);if(k!==4)entry[fi*9+k]='X';}saveEntry();showMsg('');await enterEdit();};
$('#clearAll').onclick=async()=>{entry=blankEntry();samples={};overrides.clear();saveEntry();showMsg('');curFace='F';await enterEdit();};
$('#fromApp').onclick=async()=>{stopAll();await idle();entry=(mode==='edit'&&appSnap?appSnap:modelToStr()).split('');samples={};overrides.clear();saveEntry();showMsg('');await enterEdit();};

const SETS=new Set();
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const l=[];for(const f in FACE){const n=FACE[f];if((n[0]&&n[0]===x)||(n[1]&&n[1]===y)||(n[2]&&n[2]===z))l.push(f);}if(l.length>1)SETS.add(l.sort().join(''));}
const parity=p=>{let n=0;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(p[i]>p[j])n++;return n%2;};
function checkFacelet(s){
  if(!s||s.length!==54)return'ความยาวไม่ครบ';
  for(const f of ORDER)if(s.split('').filter(x=>x===f).length!==9)return'จำนวนสีไม่ครบ 9';
  const pieces={};ORDER.split('').forEach((f,fi)=>{for(let k=0;k<9;k++){const pk=key(facePos(f,k/3|0,k%3));(pieces[pk]=pieces[pk]||[]).push(s[fi*9+k]);}});
  const seen={};for(const pk in pieces){const l=pieces[pk];if(l.length<2)continue;const id=l.slice().sort().join('');if(!SETS.has(id))return'มีชิ้นที่ไม่มีจริง '+id;if(seen[id])return'ชิ้นซ้ำ '+id;seen[id]=1;}
  try{const c=Cube.fromString(s);if(c.co.reduce((a,b)=>a+b,0)%3)return'มุมบิด';if(c.eo.reduce((a,b)=>a+b,0)%2)return'ขอบกลับ';if(parity(c.cp)!==parity(c.ep))return'สลับคู่';}catch(e){return'อ่านไม่ได้';}
  return'';
}
function validate(){
  const s=entry.join(''),errs=[];
  const unk=entry.filter(x=>x==='X').length;if(unk)errs.push(`ยังกรอกไม่ครบ เหลืออีก ${unk} ช่อง`);
  for(const f of ORDER){const n=entry.filter(x=>x===f).length;if(n>9)errs.push(`สี${NAME[f]}มี ${n} ช่อง (ต้องมี 9)`);}
  if(errs.length)return errs;
  const pieces={};ORDER.split('').forEach((f,fi)=>{for(let k=0;k<9;k++){const pk=key(facePos(f,k/3|0,k%3));(pieces[pk]=pieces[pk]||[]).push(s[fi*9+k]);}});
  const seen={};
  for(const pk in pieces){const l=pieces[pk];if(l.length<2)continue;const id=l.slice().sort().join('');const kind=l.length===3?'มุม':'ขอบ';const nm=l.map(x=>NAME[x]).join('-');
    if(!SETS.has(id))errs.push(`ชิ้น${kind}สี ${nm} ไม่มีอยู่ในรูบิคจริง`);else if(seen[id])errs.push(`ชิ้น${kind}สี ${nm} ซ้ำกัน 2 ชิ้น`);seen[id]=1;}
  if(errs.length)return errs.slice(0,4);
  const c=Cube.fromString(s);
  if(c.co.reduce((a,b)=>a+b,0)%3)errs.push('มีมุม 1 ชิ้นถูกบิดผิดทาง ลองตรวจว่ากรอกสีของมุมสลับกันหรือเปล่า');
  if(c.eo.reduce((a,b)=>a+b,0)%2)errs.push('มีขอบ 1 ชิ้นกลับด้าน ลองตรวจว่ากรอกสีของขอบสลับกันหรือเปล่า');
  if(!errs.length&&parity(c.cp)!==parity(c.ep))errs.push('มี 2 ชิ้นสลับที่กันอยู่ ลองตรวจสีที่กรอกอีกครั้ง');
  return errs;
}
function showMsg(html){const m=$('#solveMsg');m.innerHTML=html;if(html)m.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});}
let solveMethod='lbl';
function solutionCard(f,live,target){
  const box=target;
  const run=()=>{
    try{
      let moves,segs=null;
      if(solveMethod==='lbl'){const r=flatSegs(LBL.solve(f));moves=r.moves;segs=r.segs;}
      else{if(!solverReady){Cube.initSolver();solverReady=true;}moves=split(Cube.fromString(f).solve());}
      const raw=solveMethod==='lbl'?LBL.solve(f):null;
      const body=solveMethod==='lbl'?segHTML(raw):(()=>{const ch=[];for(let i=0;i<moves.length;i+=5)ch.push('<span>'+moves.slice(i,i+5).join(' ')+'</span>');return `<div class="solmoves">${ch.join('')}</div>`;})();
      box.innerHTML=`<div class="card result"><h2>วิธีแก้ ${moves.length} ท่า</h2>
        <div class="methods" role="group" aria-label="แบบวิธีแก้"><button data-m="lbl" aria-pressed="${solveMethod==='lbl'}">ตามบทเรียน 7 ขั้น</button><button data-m="short" aria-pressed="${solveMethod==='short'}">สั้นที่สุด</button></div>
        <p class="muted small" style="margin:4px 0 10px">${solveMethod==='lbl'?'แก้ทีละขั้นด้วยสูตรเดียวกับในบทเรียน ท่าเยอะกว่าแต่เข้าใจได้และฝึกจำได้':'คอมพิวเตอร์คำนวณให้สั้นที่สุด ท่าน้อยแต่จำไม่ได้'}</p>
        ${body}
        <p class="muted small" style="margin:10px 0 12px">ถือสี${N.U}ไว้บน สี${N.F}ไว้หน้าตลอด ห้ามหมุนทั้งลูก ${live?'แล้วหมุนลูกจริงตาม แอปจะเลื่อนท่าให้เอง':'แล้วกด <b>ทีละท่า</b> ใต้ลูกบาศก์ หมุนลูกจริงตามทีละท่า'}</p>
        <button class="btn primary big" data-follow>${ICON.play}เริ่มทำตามทีละท่า</button></div>`;
      box.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{if(solveMethod===b.dataset.m)return;solveMethod=b.dataset.m;
        if(solveMethod==='short'&&!solverReady)box.querySelector('.result h2').textContent='กำลังเตรียมตัวคำนวณ อาจใช้เวลา 5–10 วินาที…';setTimeout(run,40);});
      const title=solveMethod==='lbl'?'วิธีแก้ตามบทเรียน':'วิธีแก้แบบสั้น';
      if(live){box.querySelector('[data-follow]').onclick=()=>{loadFollow(title,moves,'solution',segs);toTop();};}
      else{loadDemo(title,moves.join(' '),f,false,'solution',segs);box.querySelector('[data-follow]').onclick=()=>toTop();}
    }catch(e){box.innerHTML='<div class="errcard"><strong>คำนวณไม่สำเร็จ</strong><p class="small" style="margin:4px 0 0">ลองตรวจสีที่กรอกอีกครั้ง</p></div>';}
  };
  box.innerHTML='<div class="infocard">กำลังคำนวณ…</div>';setTimeout(run,40);
}
$('#solveBtn').onclick=()=>{
  const errs=validate();
  if(errs.length){showMsg('<div class="errcard"><strong>ยังหาวิธีแก้ไม่ได้</strong><ul>'+errs.map(e=>'<li>'+e+'</li>').join('')+'</ul><p class="small" style="margin:0">'+(errs.some(e=>/บิด|กลับด้าน|สลับที่/.test(e))?`สาเหตุที่พบบ่อยคือถือลูกผิดทิศตอนกรอกบางด้าน ให้ถือกลางสี${N.U}ไว้บน กลางสี${N.F}หันหาตัวทุกครั้ง และเช็กว่าชื่อสีในแถบเลือกสีตรงกับสีจริง `:'')+(bt.on?'<b>ลูกบลูทูธเชื่อมอยู่ ไม่ต้องกรอกสีเอง กดปุ่ม “หาวิธีแก้จากลูกบลูทูธ” ด้านบนได้เลย</b>':'ถ้ากรอกถูกหมดแล้วยังขึ้นข้อความนี้ รูบิคอาจเคยถูกแกะแล้วประกอบกลับผิด')+'</p></div>');return;}
  const f=entry.join('');if(f===SOLVED){showMsg('<div class="infocard"><strong>ลูกนี้เรียงเสร็จอยู่แล้ว</strong></div>');return;}
  solutionCard(f,false,$('#solveMsg'));$('#solveMsg').scrollIntoView({block:'nearest'});
};

// ---------- colors & photo ----------
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hex=([r,g,b])=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const unhex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function lab([r,g,b]){
  const f=v=>{v/=255;return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92;};
  const R=f(r),G=f(g),B=f(b);
  let x=(R*.4124+G*.3576+B*.1805)/.95047,y=R*.2126+G*.7152+B*.0722,z=(R*.0193+G*.1192+B*.9505)/1.08883;
  const h=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;x=h(x);y=h(y);z=h(z);
  return[116*y-16,500*(x-y),200*(y-z)];}
const dist=(a,b)=>Math.hypot((a[0]-b[0])*.6,a[1]-b[1],a[2]-b[2]);
function colorName([r,g,b]){
  r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
  const sat=d===0?0:d/(1-Math.abs(2*l-1));
  if(sat<.2||d<.12)return l>.5?'ขาว':l<.2?'ดำ':'เทา';
  let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;
  if(h>=290&&h<340)return'ชมพู';
  if(h>=340||h<12)return l>.68?'ชมพู':'แดง';
  if(h<42)return'ส้ม';if(h<70)return'เหลือง';
  if(h<150)return l>.62?'เขียวอ่อน':'เขียว';
  if(h<195)return'เขียวมิ้นท์';
  if(h<255)return l>.6?'ฟ้า':'น้ำเงิน';
  return'ม่วง';}
function classify(){
  const refs={};for(const f of ORDER)refs[f]=samples[f]?samples[f][4]:lab(unhex(COL[f]));
  const cells=[];
  ORDER.split('').forEach((f,fi)=>{if(!samples[f])return;for(let k=0;k<9;k++){const idx=fi*9+k;if(k===4||overrides.has(idx))continue;cells.push([idx,samples[f][k]]);}});
  if(ORDER.split('').every(f=>samples[f])){
    const cap={};for(const f of ORDER)cap[f]=8;
    overrides.forEach(i=>{if(i%9!==4&&cap[entry[i]]!==undefined)cap[entry[i]]--;});
    const pairs=[];cells.forEach(([idx,c])=>{for(const f of ORDER)pairs.push([dist(c,refs[f]),idx,f]);});
    pairs.sort((a,b)=>a[0]-b[0]);const done=new Set();
    for(const[,idx,f]of pairs){if(done.has(idx)||cap[f]<=0)continue;entry[idx]=f;cap[f]--;done.add(idx);}
    cells.forEach(([idx])=>{if(!done.has(idx))entry[idx]='X';});
  }else cells.forEach(([idx,c])=>{let best='X',bd=1e9;for(const f of ORDER){const d=dist(c,refs[f]);if(d<bd){bd=d;best=f;}}entry[idx]=best;});
  saveEntry();
}
function renderColorRows(){
  const box=$('#colorRows');if(box.contains(document.activeElement))return;box.textContent='';
  for(const f of 'UFRBLD'){
    const row=el('div','crow');
    const c=document.createElement('input');c.type='color';c.value=COL[f];c.setAttribute('aria-label',`สีกลาง${POS[f]}`);
    c.oninput=()=>{COL[f]=c.value;saveColors();cubies.forEach(paint);renderEditor();};
    c.onchange=()=>{NAME[f]=colorName(unhex(c.value));saveColors();c.blur();renderEditor();box.textContent='';renderColorRows();};
    const t=document.createElement('input');t.type='text';t.value=NAME[f];t.maxLength=14;t.setAttribute('aria-label',`ชื่อสีกลาง${POS[f]}`);
    t.oninput=()=>{NAME[f]=t.value.trim()||DEF_NAME[f];saveColors();renderEditor();};t.onblur=()=>renderEditor();
    row.append(c,t,el('small','','กลาง'+POS[f]));box.appendChild(row);}
}
function confirmTap(btn,fn){
  const label=btn.textContent;
  btn.onclick=()=>{
    if(btn.classList.contains('confirm')){clearTimeout(btn._t);btn.classList.remove('confirm');btn.textContent=label;fn();return;}
    btn.classList.add('confirm');btn.textContent='แตะอีกครั้งเพื่อยืนยัน';
    btn._t=setTimeout(()=>{btn.classList.remove('confirm');btn.textContent=label;},3000);
  };
}
confirmTap($('#resetColors2'),()=>{Object.assign(COL,DEF_COL);Object.assign(NAME,DEF_NAME);saveColors();samples={};try{localStorage.removeItem('rubik-bt-cal');}catch(e){}cubies.forEach(paint);renderEditor();renderPlayer();showMsg('');
  if(bt.on){openBt();startCal();toast('คืนค่าสีแล้ว มาตั้งสีลูกบลูทูธใหม่กัน');}else toast('คืนค่าสีมาตรฐานแล้ว');});
confirmTap($('#clearAll2'),async()=>{entry=blankEntry();samples={};overrides.clear();saveEntry();showMsg('');curFace='F';await enterEdit();toast('ล้างสีที่กรอกแล้ว');});
$('#colorReset').onclick=()=>{Object.assign(COL,DEF_COL);Object.assign(NAME,DEF_NAME);saveColors();cubies.forEach(paint);renderEditor();renderPlayer();renderLesson();};

const pc=$('#pc'),pIn=$('#photoIn'),sheet=$('#sheet');
const openSheet=()=>{sheet.hidden=false;document.body.style.overflow='hidden';drawPhoto();$('#pUse').focus();};
const closeSheet=()=>{sheet.hidden=true;document.body.style.overflow='';photo=null;};
function onPick(e){
  const input=e.target,file=input.files&&input.files[0];input.value='';if(!file)return;
  const rd=new FileReader();
  rd.onload=()=>{const img=new Image();
    img.onload=()=>{const k=Math.min(1,900/Math.max(img.naturalWidth,img.naturalHeight));
      const cv=document.createElement('canvas');cv.width=Math.round(img.naturalWidth*k);cv.height=Math.round(img.naturalHeight*k);
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      photo={cv,cx:cv.width/2,cy:cv.height/2,s:Math.min(cv.width,cv.height)*.6};$('#psize').value=60;autoFrame();openSheet();};
    img.onerror=()=>showMsg('<div class="errcard"><strong>เปิดรูปนี้ไม่ได้</strong><p class="small" style="margin:4px 0 0">ลองถ่ายใหม่อีกครั้ง</p></div>');
    img.src=rd.result;};
  rd.readAsDataURL(file);
}
pIn.onchange=onPick;$('#camIn').onchange=onPick;

// live camera fallback
const liveSheet=$('#liveSheet'),video=$('#video');let stream=null;
const GUIDE=.62;
function stopLive(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;liveSheet.hidden=true;document.body.style.overflow='';}
function sizeGuide(){const w=video.clientWidth,h=video.clientHeight,g=$('#guide');if(!w||!h)return;const s=Math.min(w,h)*GUIDE;g.style.width=g.style.height=s+'px';}
$('#liveBtn').onclick=async()=>{
  const fail=m=>showMsg(`<div class="errcard"><strong>เปิดกล้องไม่ได้</strong><p class="small" style="margin:4px 0 0">${m}</p></div>`);
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){fail('แอปที่เปิดหน้านี้อยู่ไม่อนุญาตให้ใช้กล้อง ลองเปิดลิงก์นี้ในเบราว์เซอร์ Chrome หรือ Safari');return;}
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:1280}},audio:false});}
  catch(err){fail(err&&err.name==='NotAllowedError'?'ยังไม่ได้อนุญาตให้ใช้กล้อง ลองกดอนุญาต หรือเปิดลิงก์นี้ในเบราว์เซอร์ Chrome หรือ Safari':'ลองเปิดลิงก์นี้ในเบราว์เซอร์ Chrome หรือ Safari แล้วกดถ่ายรูปอีกครั้ง');return;}
  const w=WIZ.find(w=>w[0]===curFace);$('#liveTop').textContent=' '+(w[3]()||`ฝั่งตรงข้ามกับสี${N.F}`);
  liveSheet.hidden=false;document.body.style.overflow='hidden';video.srcObject=stream;
  video.onloadedmetadata=()=>{video.play().catch(()=>{});sizeGuide();};video.onresize=sizeGuide;
};
$('#liveCancel').onclick=stopLive;
liveSheet.addEventListener('click',e=>{if(e.target===liveSheet)stopLive();});
$('#liveShot').onclick=()=>{
  const vw=video.videoWidth,vh=video.videoHeight;if(!vw||!vh)return;
  const k=Math.min(1,900/Math.max(vw,vh)),cv=document.createElement('canvas');cv.width=Math.round(vw*k);cv.height=Math.round(vh*k);
  cv.getContext('2d').drawImage(video,0,0,cv.width,cv.height);stopLive();
  photo={cv,cx:cv.width/2,cy:cv.height/2,s:Math.min(cv.width,cv.height)*GUIDE};$('#psize').value=Math.round(GUIDE*100);autoFrame();openSheet();
};
addEventListener('resize',sizeGuide);
function autoFrame(){
  try{const o=photo.cv,k=160/Math.max(o.width,o.height),w=Math.max(8,Math.round(o.width*k)),h=Math.max(8,Math.round(o.height*k));
    const t=document.createElement('canvas');t.width=w;t.height=h;const g=t.getContext('2d',{willReadFrequently:true});g.drawImage(o,0,0,w,h);
    const b=detectCube(g.getImageData(0,0,w,h).data,w,h);
    if(b&&b.score>30&&b.cellL-b.lineL>35){photo.cx=b.cx/k;photo.cy=b.cy/k;photo.s=b.s/k;$('#psize').value=Math.round(photo.s/Math.min(o.width,o.height)*100);$('#sheetHint').textContent='แอปหากรอบให้อัตโนมัติแล้ว ถ้าไม่ตรงลากปรับได้';return;}
  }catch(e){}
  $('#sheetHint').textContent='ลากกรอบให้วงกลมอยู่กลางสติกเกอร์ทุกช่อง';
}
function sampleCells(){
  const ctx=photo.cv.getContext('2d',{willReadFrequently:true}),out=[],cell=photo.s/3,half=Math.max(1,cell*.18);
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){
    const x=clamp(Math.round(photo.cx+(c-1)*cell-half),0,photo.cv.width-1),y=clamp(Math.round(photo.cy+(r-1)*cell-half),0,photo.cv.height-1);
    const w=Math.max(1,Math.min(Math.round(half*2),photo.cv.width-x)),h=Math.max(1,Math.min(Math.round(half*2),photo.cv.height-y));
    const d=ctx.getImageData(x,y,w,h).data;let R=0,G=0,B=0,n=0;
    for(let i=0;i<d.length;i+=4){R+=d[i];G+=d[i+1];B+=d[i+2];n++;}
    out.push([R/n,G/n,B/n]);}
  return out;}
function drawPhoto(){
  if(!photo||sheet.hidden)return;
  const dpr=devicePixelRatio||1,cs=getComputedStyle(pc.parentElement),maxW=pc.parentElement.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),maxH=innerHeight*.5;
  const sc=Math.min(maxW/photo.cv.width,maxH/photo.cv.height),W=photo.cv.width*sc,H=photo.cv.height*sc;
  pc.width=Math.round(W*dpr);pc.height=Math.round(H*dpr);pc.style.width=W+'px';pc.style.height=H+'px';
  const g=pc.getContext('2d');g.setTransform(dpr*sc,0,0,dpr*sc,0,0);g.drawImage(photo.cv,0,0);
  const{cx,cy,s}=photo,x0=cx-s/2,y0=cy-s/2,lw=1/sc;
  g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.rect(0,0,photo.cv.width,photo.cv.height);g.rect(x0,y0,s,s);g.fill('evenodd');
  g.strokeStyle='#fff';g.lineWidth=2.5*lw;g.strokeRect(x0,y0,s,s);
  g.lineWidth=lw;for(let i=1;i<3;i++){g.beginPath();g.moveTo(x0+i*s/3,y0);g.lineTo(x0+i*s/3,y0+s);g.moveTo(x0,y0+i*s/3);g.lineTo(x0+s,y0+i*s/3);g.stroke();}
  sampleCells().forEach((col,k)=>{const x=cx+((k%3)-1)*s/3,y=cy+((k/3|0)-1)*s/3;g.beginPath();g.arc(x,y,Math.max(6*lw,s*.05),0,7);g.fillStyle=hex(col);g.fill();g.lineWidth=2.5*lw;g.strokeStyle='#fff';g.stroke();});
  photo.sc=sc;
}
let pdrag=null;
pc.addEventListener('pointerdown',e=>{if(!photo)return;pdrag={x:e.clientX,y:e.clientY,cx:photo.cx,cy:photo.cy};pc.setPointerCapture(e.pointerId);});
pc.addEventListener('pointermove',e=>{if(!pdrag||!photo)return;photo.cx=clamp(pdrag.cx+(e.clientX-pdrag.x)/photo.sc,0,photo.cv.width);photo.cy=clamp(pdrag.cy+(e.clientY-pdrag.y)/photo.sc,0,photo.cv.height);drawPhoto();});
const pend=()=>pdrag=null;pc.addEventListener('pointerup',pend);pc.addEventListener('pointercancel',pend);
$('#psize').oninput=e=>{if(!photo)return;photo.s=Math.min(photo.cv.width,photo.cv.height)*e.target.value/100;drawPhoto();};
$('#pRot').onclick=()=>{if(!photo)return;const o=photo.cv,cv=document.createElement('canvas');cv.width=o.height;cv.height=o.width;
  const g=cv.getContext('2d');g.translate(cv.width,0);g.rotate(Math.PI/2);g.drawImage(o,0,0);
  photo={cv,cx:o.height-photo.cy,cy:photo.cx,s:photo.s};drawPhoto();};
$('#pCancel').onclick=closeSheet;
sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet();});
addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!sheet.hidden)closeSheet();if(!liveSheet.hidden)stopLive();});
$('#pUse').onclick=async()=>{
  if(!photo)return;const cols=sampleCells();closeSheet();
  if(mode!=='edit')await enterEdit();
  const fi=ORDER.indexOf(curFace);
  samples[curFace]=cols.map(lab);for(let k=0;k<9;k++)overrides.delete(fi*9+k);
  COL[curFace]=hex(cols[4]);NAME[curFace]=colorName(cols[4]);saveColors();
  classify();strToModel(entry.join(''));renderEditor();renderPlayer();
  const left=WIZ.filter(w=>!samples[w[0]]).length,done=POS[curFace];
  showMsg(`<div class="infocard">อ่านสี${done}แล้ว ตรวจในตารางว่าตรงกับลูกจริงไหม ถ้าช่องไหนผิด เลือกสีแล้วแตะแก้ได้${left?` จากนั้นกด “ด้านถัดไป” (เหลืออีก ${left} ด้าน) สีที่ยังไม่ได้ถ่ายด้านของมันอาจอ่านเพี้ยนไปก่อน ถ่ายครบ 6 ด้านแล้วแอปจะอ่านใหม่ให้เอง`:' ครบ 6 ด้านแล้ว กด “หาวิธีแก้” ได้เลย'}</div>`);
};
addEventListener('resize',()=>drawPhoto());

// ---------- beginner solver & photo detection ----------
// Layer-by-layer (beginner) solver matching the app's 7 lesson steps. White = D, yellow = U.
const LBL=(()=>{
  const FACES='URFDLB';let MV=null,CT=null;
  function init(){
    if(MV)return;MV={};
    for(const f of FACES){const c=new Cube();c.move(f);const m={cp:c.cp.slice(),co:c.co.slice(),ep:c.ep.slice(),eo:c.eo.slice()};
      MV[f]=m;MV[f+'2']=mul(m,m);MV[f+"'"]=mul(MV[f+'2'],m);}
    // cross pruning table over edges 4..7 (DR,DF,DL,DB)
    const N=12**4*16;CT=new Uint8Array(N).fill(255);
    const inv={};for(const k in MV){const p=MV[k].ep,ip=[];for(let i=0;i<12;i++)ip[p[i]]=i;inv[k]=ip;}
    const enc=(pos,ori)=>((((pos[0]*12+pos[1])*12+pos[2])*12+pos[3])*16)+((ori[0])|(ori[1]<<1)|(ori[2]<<2)|(ori[3]<<3));
    let frontier=[[[4,5,6,7],[0,0,0,0]]];CT[enc([4,5,6,7],[0,0,0,0])]=0;let d=0;
    const keys=Object.keys(MV);
    while(frontier.length){const next=[];d++;
      for(const[pos,ori]of frontier)for(const k of keys){const m=MV[k],ip=inv[k];
        const np=[],no=[];for(let j=0;j<4;j++){const i=ip[pos[j]];np.push(i);no.push((ori[j]+m.eo[i])&1);}
        const e=enc(np,no);if(CT[e]===255){CT[e]=d;next.push([np,no]);}}
      frontier=next;}
    init.enc=enc;init.inv=inv;
  }
  function mul(a,m){const r={cp:[],co:[],ep:[],eo:[]};
    for(let i=0;i<8;i++){r.cp[i]=a.cp[m.cp[i]];r.co[i]=(a.co[m.cp[i]]+m.co[i])%3;}
    for(let i=0;i<12;i++){r.ep[i]=a.ep[m.ep[i]];r.eo[i]=(a.eo[m.ep[i]]+m.eo[i])&1;}return r;}
  const run=(s,moves)=>{for(const m of moves)s=mul(s,MV[m]);return s;};
  const sp=a=>a.trim().split(/\s+/).filter(Boolean);
  // frames: hold face X in front (U stays up)
  const RIGHT={F:'R',R:'B',B:'L',L:'F'},OPP={F:'B',B:'F',R:'L',L:'R'};
  function frame(alg,front){const m={F:front,R:RIGHT[front],B:OPP[front],L:OPP[RIGHT[front]],U:'U',D:'D'};return sp(alg).map(t=>m[t[0]]+t.slice(1));}
  const FR=['F','R','B','L'];
  const edgeOK=(s,i)=>s.ep[i]===i&&s.eo[i]===0, cornOK=(s,i)=>s.cp[i]===i&&s.co[i]===0;
  const cross=s=>[4,5,6,7].every(i=>edgeOK(s,i));
  const corners=s=>[4,5,6,7].every(i=>cornOK(s,i));
  const mids=s=>[8,9,10,11].every(i=>edgeOK(s,i));
  const yCross=s=>[0,1,2,3].every(i=>s.eo[i]===0);
  const aufs=['','U','U2',"U'"];
  function withAUF(s,pred){for(const a of aufs){const t=a?run(s,[a]):s;if(pred(t))return a;}return null;}
  const yEdges=s=>[0,1,2,3].every(i=>s.ep[i]===i);
  const yCornPos=s=>[0,1,2,3].every(i=>s.cp[i]===i);
  function stageOf(f){init();const s=Cube.fromString(f);const st={cp:s.cp,co:s.co,ep:s.ep,eo:s.eo};
    if(!cross(st))return 0;if(!corners(st))return 1;if(!mids(st))return 2;if(!yCross(st))return 3;
    if(withAUF(st,yEdges)===null)return 4;const a=withAUF(st,yEdges);const t=a?run(st,[a]):st;
    if(!yCornPos(t))return 5;if(!(t.co.every(x=>x===0)&&yEdges(t)&&yCornPos(t)))return 6;
    return 7;}
  function bfs(s,tokens,goal,maxD){
    if(goal(s))return[];let fr=[[s,[]]];
    for(let d=1;d<=maxD;d++){const nx=[];
      for(const[st,path]of fr)for(const t of tokens){const last=path[path.length-1];if(last&&last.u&&t.u)continue;
        const ns=run(st,t.m),np=path.concat([t]);if(goal(ns))return np;nx.push([ns,np]);}
      fr=nx;}
    return null;}
  function solveCross(s){
    const enc=init.enc,inv=init.inv;
    const key=st=>{const pos=[],ori=[];for(let j=4;j<8;j++){const i=st.ep.indexOf(j);pos.push(i);ori.push(st.eo[i]);}return enc(pos,ori);};
    const out=[];let cur=s;
    while(CT[key(cur)]>0){const h=CT[key(cur)];let found=false;
      for(const k in MV){const ns=mul(cur,MV[k]);if(CT[key(ns)]===h-1){out.push(k);cur=ns;found=true;break;}}
      if(!found)break;}
    return{moves:out,s:cur};}
  function simplify(m){const out=[];const val=t=>t.endsWith('2')?2:t.endsWith("'")?3:1;
    for(const t of m){const l=out[out.length-1];if(l&&l[0]===t[0]){const v=(val(l)+val(t))%4;out.pop();if(v)out.push(t[0]+['','','2',"'"][v]);}else out.push(t);}
    return out;}
  function solve(facelet){
    init();const c=Cube.fromString(facelet);let s={cp:c.cp,co:c.co,ep:c.ep,eo:c.eo};const segs=[];
    const push=(step,title,note,moves)=>{moves=simplify(moves);if(moves.length)segs.push({step,title,note,moves});s=run(s,moves);};
    // 1 cross
    const cr=solveCross(s);push(1,'กากบาท','ทำกากบาทด้านล่าง',cr.moves);
    // 2 corners: slot pos -> front frame; top above
    const SLOT={4:'F',7:'R',6:'B',5:'L'},ABOVE={4:0,7:3,6:2,5:1},TOPF={0:'F',3:'R',2:'B',1:'L'},BOTF={4:'F',7:'R',6:'B',5:'L'};
    for(const j of [4,7,6,5]){
      if(cornOK(s,j))continue;let mv=[];let p=s.cp.indexOf(j);
      if(p>=4){mv=mv.concat(frame("R U R' U'",BOTF[p]));s=run(s,frame("R U R' U'",BOTF[p]));p=s.cp.indexOf(j);}
      const setup=[];for(const a of aufs){const t=a?run(s,[a]):s;if(t.cp.indexOf(j)===ABOVE[j]){if(a)setup.push(a);break;}}
      s=run(s,setup);mv=mv.concat(setup);
      const sx=frame("R U R' U'",SLOT[j]);let n=0;while(!cornOK(s,j)&&n<6){s=run(s,sx);mv=mv.concat(sx);n++;}
      s=run(s,invert(mv));// rewind, then push as one segment
      push(2,'มุมสีล่าง',`ใส่มุมด้วย R U R' U' (หันช่องเป้าหมายไว้หน้า-ขวา)`,mv);
    }
    // 3 middle edges
    const RA="U R U' R' U' F' U F",LA="U' L' U L U F U' F'",EF={8:'F',11:'R',10:'B',9:'L'};
    const done=()=>cross(s)&&corners(s);
    for(const j of [8,11,10,9]){
      if(edgeOK(s,j))continue;let mv=[];let p=s.ep.indexOf(j);
      if(p>=8){const x=frame(RA,EF[p]);mv=mv.concat(x);s=run(s,x);}
      let ok=null;
      for(const a of aufs){for(const f of FR)for(const[alg,nm]of[[RA,'ไปขวา'],[LA,'ไปซ้าย']]){const cand=(a?[a]:[]).concat(frame(alg,f));const t=run(s,cand);
        if(edgeOK(t,j)&&[4,5,6,7].every(i=>edgeOK(t,i)&&cornOK(t,i))&&[8,9,10,11].filter(i=>i!==j&&edgeOK(s,i)).every(i=>edgeOK(t,i))){ok={cand,nm};break;}}if(ok)break;}
      if(!ok)throw new Error('mid');
      s=run(s,ok.cand);mv=mv.concat(ok.cand);s=run(s,invert(mv));
      push(3,'ชั้นกลาง',`ใส่ขอบด้วยสูตร${ok.nm}`,mv);
    }
    // 4 yellow cross
    const T=a=>({m:sp(a),u:a.startsWith('U')&&sp(a).length===1});
    const uT=['U','U2',"U'"].map(T);
    let r=bfs(s,uT.concat([T("F R U R' U' F'")]),yCross,8);push(4,'กากบาทบน',"ใช้ F R U R' U' F'",[].concat(...r.map(t=>t.m)));
    // 5 yellow edges
    r=bfs(s,uT.concat(FR.map(f=>({m:frame("R U R' U R U2 R' U",f),u:false}))),yEdges,5);push(5,'ขอบบนตรงสี',"ใช้ R U R' U R U2 R' U",[].concat(...r.map(t=>t.m)));
    // 6 corner positions
    r=bfs(s,FR.map(f=>({m:frame("U R U' L' U R' U' L",f),u:false})),yCornPos,3);push(6,'วางมุมบน',"ใช้ U R U' L' U R' U' L",[].concat(...r.map(t=>t.m)));
    // 7 orient corners: only U turns between
    let mv=[];for(let k=0;k<4;k++){let n=0;while(s.co[0]!==0&&n<3){const x=sp("R' D' R D R' D' R D");s=run(s,x);mv=mv.concat(x);n++;}s=run(s,['U']);mv.push('U');}
    s=run(s,invert(mv));
    const fin=withAUF(run(s,mv),st=>st.cp.every((x,i)=>x===i)&&st.ep.every((x,i)=>x===i)&&st.co.every(x=>!x)&&st.eo.every(x=>!x));
    if(fin)mv.push(fin);push(7,'หมุนมุมบน',"ใช้ R' D' R D ซ้ำ หมุนแค่ U ระหว่างมุม",mv);
    const solvedNow=s.cp.every((x,i)=>x===i)&&s.ep.every((x,i)=>x===i)&&s.co.every(x=>!x)&&s.eo.every(x=>!x);
    if(!solvedNow)throw new Error('not solved');
    return segs;
  }
  const inv1=t=>t.endsWith('2')?t:t.endsWith("'")?t[0]:t+"'";
  const invert=a=>a.slice().reverse().map(inv1);
  return{solve,stageOf,init};
})();


function detectCube(px,W,H){ // px: RGB(A) array with stride 4
  const L=new Float32Array(W*H),R=new Float32Array(W*H),G=new Float32Array(W*H),B=new Float32Array(W*H);
  for(let i=0;i<W*H;i++){R[i]=px[i*4];G[i]=px[i*4+1];B[i]=px[i*4+2];L[i]=(R[i]*.299+G[i]*.587+B[i]*.114);}
  // integral images for mean & variance
  const mk=a=>{const I=new Float64Array((W+1)*(H+1));for(let y=0;y<H;y++){let row=0;for(let x=0;x<W;x++){row+=a[y*W+x];I[(y+1)*(W+1)+x+1]=I[y*(W+1)+x+1]+row;}}return I;};
  const sq=a=>a.map(v=>v*v);
  const IR=mk(R),IG=mk(G),IB=mk(B),IL=mk(L),IR2=mk(sq(R)),IG2=mk(sq(G)),IB2=mk(sq(B));
  const box=(I,x0,y0,x1,y1)=>I[y1*(W+1)+x1]-I[y0*(W+1)+x1]-I[y1*(W+1)+x0]+I[y0*(W+1)+x0];
  const stat=(cx,cy,h)=>{const x0=Math.max(0,Math.round(cx-h)),y0=Math.max(0,Math.round(cy-h)),x1=Math.min(W,Math.round(cx+h)+1),y1=Math.min(H,Math.round(cy+h)+1);const n=Math.max(1,(x1-x0)*(y1-y0));
    const mr=box(IR,x0,y0,x1,y1)/n,mg=box(IG,x0,y0,x1,y1)/n,mb=box(IB,x0,y0,x1,y1)/n;
    const v=box(IR2,x0,y0,x1,y1)/n-mr*mr+box(IG2,x0,y0,x1,y1)/n-mg*mg+box(IB2,x0,y0,x1,y1)/n-mb*mb;
    return{l:box(IL,x0,y0,x1,y1)/n,sd:Math.sqrt(Math.max(0,v))};};
  const lum=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return 255;return L[y*W+x];};
  let best=null;const mn=Math.min(W,H);
  for(let s=mn*.25;s<=mn*.98;s*=1.04){const c=s/3,h=Math.max(1,c*.2);
    for(let cy=s/2;cy<=H-s/2;cy+=Math.max(1,s/40))for(let cx=s/2;cx<=W-s/2;cx+=Math.max(1,s/40)){
      let sdSum=0,minL=999,cells=[];
      for(let r=-1;r<=1;r++)for(let q=-1;q<=1;q++){const st=stat(cx+q*c,cy+r*c,h);sdSum+=st.sd;cells.push(st.l);if(st.l<minL)minL=st.l;}
      // grid lines: midpoints between neighbouring cells
      let lineL=0,n=0;
      for(let r=-1;r<=1;r++)for(let q=-1;q<=0;q++){lineL+=lum(cx+(q+.5)*c,cy+r*c);n++;lineL+=lum(cx+r*c,cy+(q+.5)*c);n++;}
      lineL/=n;const cellL=cells.reduce((a,b)=>a+b,0)/9;
      const score=(cellL-lineL)-sdSum/9*0.8;
      if(!best||score>best.score)best={score,cx,cy,s,cellL,lineL,sd:sdSum/9};
    }}
  return best;
}


// ---------- bluetooth (GiiKER / Mi Smart cube) ----------
const GK={
 CF:[[26,15,29],[20,8,9],[18,38,6],[24,27,44],[51,35,17],[45,11,2],[47,0,36],[53,42,33]],
 EF:[[25,28],[23,12],[19,7],[21,41],[32,16],[5,10],[3,37],[30,43],[52,34],[48,14],[46,1],[50,39]],
 KEY:[176,81,104,224,86,137,237,119,38,26,193,161,210,126,150,81,93,13,236,249,89,235,88,24,113,81,214,131,130,199,2,169,39,165,171,41],
 CO:[-1,1,-1,1,1,-1,1,-1],
 parse(dv){
  const raw=[];for(let i=0;i<20;i++)raw.push(dv.getUint8(i));
  let n=20;if(raw[18]===0xa7){const k1=raw[19]>>4&15,k2=raw[19]&15;for(let i=0;i<18;i++)raw[i]=(raw[i]+GK.KEY[i+k1]+GK.KEY[i+k2])&255;n=18;}
  const v=[];for(let i=0;i<n;i++)v.push(raw[i]>>4&15,raw[i]&15);
  const eo=[];for(let i=0;i<3;i++)for(let m=8;m;m>>=1)eo.push(v[i+28]&m?1:0);
  const ca=[],ea=[];for(let i=0;i<8;i++)ca[i]=(v[i]-1)|(((3+v[i+8]*GK.CO[i])%3)<<3);
  for(let i=0;i<12;i++)ea[i]=((v[i+16]-1)<<1)|eo[i];
  const f=[];for(let i=0;i<54;i++)f[i]=i;
  for(let c=0;c<8;c++){const j=ca[c]&7,o=ca[c]>>3;for(let k=0;k<3;k++)f[GK.CF[c][(k+o)%3]]=GK.CF[j][k];}
  for(let e=0;e<12;e++){const j=ea[e]>>1,o=ea[e]&1;for(let k=0;k<2;k++)f[GK.EF[e][(k+o)%2]]=GK.EF[j][k];}
  const face=['?','B','D','L','U','R','F'][v[32]],dk=v[33]===9?3:v[33];
  return{facelet:f.map(x=>'URFDLB'[x/9|0]).join(''),move:face&&face!=='?'?face+(['','','2',"'"][dk]||''):null};
 }
};
const U16=x=>`0000${x}-0000-1000-8000-00805f9b34fb`;
const BT_DATA=U16('aadb'),BT_DATA_C=U16('aadc'),BT_RW=U16('aaaa'),BT_R=U16('aaab'),BT_W=U16('aaac');
const SOLVED='UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
const bt={on:false,dev:null,w:null,facelet:null,raw:null,X:null,shown:null,name:'',battery:null,moves:[],timer:null};
function cubeInv(c){const r=new Cube();for(let i=0;i<8;i++){r.cp[c.cp[i]]=i;r.co[c.cp[i]]=(3-c.co[i])%3;}for(let i=0;i<12;i++){r.ep[c.ep[i]]=i;r.eo[c.ep[i]]=c.eo[i];}return r;}
function tracked(raw){if(!bt.X||checkFacelet(raw))return raw;const r=bt.X.clone();r.multiply(Cube.fromString(raw));return r.asString();}
function setOffset(x){bt.X=x;try{if(x)localStorage.setItem('rubik-bt-offset',x.asString());else localStorage.removeItem('rubik-bt-offset');}catch(e){}const st=$('#btSyncState');if(st)st.hidden=!x;}
const after=(f,m)=>{const c=Cube.fromString(f);c.move(m);return c.asString();};
const btLog=[];
function hexOf(dv){let h='';for(let i=0;i<dv.byteLength;i++)h+=dv.getUint8(i).toString(16).padStart(2,'0');return h;}
function logBt(dv,r,cur,mv){btLog.push({t:new Date().toLocaleTimeString('th-TH'),hex:hexOf(dv),raw:r.facelet,ok:checkFacelet(r.facelet)||'ok',pm:r.move||'-',mv:mv||'-',cur});if(btLog.length>12)btLog.shift();
  const el=$('#btLog');if(el)el.textContent=btLog.map(x=>`${x.t} ${x.ok} ท่าจากลูก:${x.pm} ท่าที่หาได้:${x.mv}\n${x.hex}\n${x.raw}`).join('\n\n');}
const ALL_MOVES=[].concat(...'URFDLB'.split('').map(f=>[f,f+"'",f+'2']));
let toastT;function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,3200);}
function btUI(){
  document.body.classList.toggle('bt-on',bt.on);
  $('#btPill').classList.toggle('on',bt.on);
  $('#btPillText').textContent=bt.on?(bt.battery!=null?`${bt.battery}%`:'เชื่อมแล้ว'):'เชื่อมลูกบลูทูธ';
  $('#btOff').hidden=bt.on;$('#btOnView').hidden=!bt.on;
  $('#btName').textContent=bt.name;$('#btBatt').textContent=bt.battery!=null?`แบตเตอรี่ ${bt.battery}%`:'เชื่อมต่ออยู่';
  const go=$('#btGo');go.textContent=bt.on?'ยกเลิกการเชื่อม':'เชื่อมต่อ';go.className=bt.on?'btn':'btn primary';go.disabled=false;
}
function btError(kind){
  const T={
    unsupported:'เบราว์เซอร์นี้ใช้บลูทูธไม่ได้ ต้องเปิดด้วย Chrome บน Android หรือคอมพิวเตอร์ (iPhone และ iPad ใช้ไม่ได้) ถ้าเปิดผ่านแอป Claude หรือแอปอื่นอยู่ ให้คัดลอกลิงก์ไปเปิดใน Chrome',
    blocked:'หน้านี้ถูกบล็อกไม่ให้ใช้บลูทูธ มักเกิดเมื่อเปิดผ่านแอป Claude หรือแอปอื่น ให้คัดลอกลิงก์ไปเปิดใน Chrome ถ้าเปิดใน Chrome แล้วยังขึ้นข้อความนี้ ต้องนำไฟล์แอปไปเปิดเอง',
    notfound:'ไม่พบลูก ลองหมุนลูกให้ตื่น เช็กว่าเปิดบลูทูธกับตำแหน่ง (GPS) แล้ว แล้วกดเชื่อมอีกครั้ง',
    connect:'เชื่อมไม่สำเร็จ ลองหมุนลูกแล้วกดอีกครั้ง หรือปิด-เปิดบลูทูธ ถ้าลูกยังเชื่อมกับแอปอื่นอยู่ ให้ปิดแอปนั้นก่อน'};
  $('#btMsg').innerHTML=`<div class="errcard"><strong>เชื่อมไม่ได้</strong><p class="small" style="margin:4px 0 0">${T[kind]}</p></div>`;
}
async function btWrite(b){if(!bt.w)return;const d=new Uint8Array([b]);
  try{if(bt.w.writeValueWithoutResponse)await bt.w.writeValueWithoutResponse(d);else await bt.w.writeValue(d);}
  catch(e){try{await bt.w.writeValue(d);}catch(_){}}}
function onBtChar(e){if(e.target.value)onBtData(e.target.value);}
function onBtBatt(e){const v=e.target.value;if(v&&v.byteLength>1){bt.battery=clamp(v.getUint8(1),0,100);btUI();}}
async function setupGatt(dev){
  const g=await dev.gatt.connect();
  const c=await (await g.getPrimaryService(BT_DATA)).getCharacteristic(BT_DATA_C);
  if(c.removeEventListener)c.removeEventListener('characteristicvaluechanged',onBtChar);c.addEventListener('characteristicvaluechanged',onBtChar);
  await c.startNotifications();
  const fv=await c.readValue();const first=GK.parse(fv);try{logBt(fv,first,'',null);}catch(e){}
  let X=null;try{const o=localStorage.getItem('rubik-bt-offset');if(o)X=Cube.fromString(o);}catch(e){}
  Object.assign(bt,{on:true,dev,raw:first.facelet,name:dev.name||'GiiKER',manual:false});setOffset(X);bt.facelet=tracked(bt.raw);
  try{const rw=await g.getPrimaryService(BT_RW);const r=await rw.getCharacteristic(BT_R);bt.w=await rw.getCharacteristic(BT_W);
    if(r.removeEventListener)r.removeEventListener('characteristicvaluechanged',onBtBatt);r.addEventListener('characteristicvaluechanged',onBtBatt);
    await r.startNotifications();btWrite(0xb5);clearInterval(bt.timer);bt.timer=setInterval(()=>btWrite(0xb5),60000);}catch(e){bt.w=null;}
}
async function btConnect(){
  $('#btMsg').innerHTML='';
  if(!navigator.bluetooth||!navigator.bluetooth.requestDevice){btError('unsupported');return;}
  let dev;
  try{dev=await navigator.bluetooth.requestDevice({filters:[{namePrefix:'Gi'},{namePrefix:'Mi Smart Magic Cube'},{namePrefix:'Hi-'}],optionalServices:[BT_DATA,BT_RW]});}
  catch(e){if(e&&e.name==='NotFoundError'&&/cancel/i.test(e.message||''))return;
    btError(e&&e.name==='SecurityError'?'blocked':e&&e.name==='NotFoundError'?'notfound':e&&e.name==='NotAllowedError'?'blocked':'connect');return;}
  const go=$('#btGo');go.disabled=true;go.textContent='กำลังเชื่อม…';
  try{
    if(bt.dev!==dev)dev.addEventListener('gattserverdisconnected',onBtDisconnect);
    bt.moves=[];bt.battery=null;await setupGatt(dev);
    btUI();
    let calDone=false;try{calDone=!!localStorage.getItem('rubik-bt-cal');}catch(e){}
    if(!calDone){$('#btOff').hidden=true;$('#btOnView').hidden=false;startCal();toast('เชื่อมแล้ว มาตั้งสีลูกนี้กันก่อน');}
    else{closeBt();toast('เชื่อมลูกแล้ว หมุนลูกจริงได้เลย');}
    lastStage=null;setTimeout(()=>updateCoach(false),50);
    if(curTab==='practice')goLive('practice');else{selectTab(curTab==='learn'?'solve':curTab);}
  }catch(e){btError('connect');try{dev.gatt.disconnect();}catch(_){}btUI();}
}
let reconnecting=false;
async function btReconnect(dev){
  if(reconnecting)return;reconnecting=true;$('#btPillText').textContent='เชื่อมใหม่…';
  for(let i=0;i<6&&!bt.manual;i++){
    await sleep(1200+i*800);if(bt.manual||bt.on)break;
    try{await setupGatt(dev);reconnecting=false;btUI();toast('เชื่อมลูกกลับแล้ว');
      if(curTab==='practice')goLive('practice');else if(curTab==='solve')goLive('live');else updateCoach(false);return;}catch(e){}
  }
  reconnecting=false;btUI();if(!bt.on&&!bt.manual)toast('เชื่อมกลับไม่สำเร็จ หมุนลูกให้ตื่นแล้วกดเชื่อมใหม่');
}
function onBtDisconnect(){
  if(!bt.on)return;bt.on=false;bt.w=null;clearInterval(bt.timer);btUI();
  if(mode==='live'||(mode==='demo'&&demo&&demo.live)){mode='intro';demo=null;}
  if(curTab==='practice'){mode='practice';running=false;armed=false;}
  renderPlayer();
  if(!bt.manual&&bt.dev){toast('ลูกหลุด กำลังเชื่อมใหม่…');btReconnect(bt.dev);}else toast('ยกเลิกการเชื่อมลูกแล้ว');
}
function onBtData(dv){
  const r=GK.parse(dv);if(!bt.on||r.facelet===bt.raw)return;
  const prev=bt.facelet;bt.raw=r.facelet;let cur;try{cur=tracked(r.facelet);}catch(e){cur=r.facelet;}
  bt.facelet=cur;r.facelet=cur;
  let mv=null;
  if(prev){const cands=(r.move?[r.move]:[]).concat(ALL_MOVES);
    for(const m of cands){try{if(after(prev,m)===cur){mv=m;break;}}catch(e){}}}
  logBt(dv,r,cur,mv);
  if(bt.X&&cur===SOLVED){btWrite(0xa1);bt.raw=SOLVED;setOffset(null);setTimeout(()=>toast('เรียงเสร็จ แก้ความจำในลูกให้ตรงแล้ว'),400);}
  if(mv){bt.moves.push(mv);if(bt.moves.length>300)bt.moves.shift();}
  if(cal.step&&mv)calMove(mv);
  if(curTab==='learn')updateCoach(true);
  const liveDemo=mode==='demo'&&demo&&demo.live;
  if(!(mode==='live'||mode==='practice'||liveDemo))return;
  mirror(r.facelet,mv);
  if(mode==='practice'){
    if(mv)history.push(mv);
    if(armed&&!running&&mv)startTimer();
    if(running&&r.facelet===SOLVED){running=false;armed=false;elapsed=performance.now()-t0;recordSolve(elapsed,history.length,true);}
  }else if(liveDemo)followUpdate(r.facelet);
  renderPlayer();
}
function mirror(f,mv){
  let ok=false;try{ok=!!(mv&&bt.shown&&queue.length<3&&after(bt.shown,mv)===f);}catch(e){}
  bt.shown=f;
  if(ok)enqueue({tok:mv,dur:reduce?0:110});
  else{stopAll();idle().then(()=>{if(bt.shown===f)strToModel(f);});}
}
async function goLive(m){
  if(!bt.on)return;stopAll();clearTimeout(autoTimer);await idle();
  strToModel(bt.facelet);bt.shown=bt.facelet;demo=null;mode=m;
  if(m==='practice'){history=[];scrambleSeq=[];running=false;elapsed=null;armed=false;}
  vx=-28;vy=-38;setView();renderPlayer();
}
async function loadFollow(title,moves,kind,segs){
  await goLive(kind==='scramble'?'practice':'live');
  const states=[bt.facelet],halves=[];let c=Cube.fromString(bt.facelet);
  for(const m of moves){
    if(m.endsWith('2')){const s=c.asString();halves.push([after(s,m[0]),after(s,m[0]+"'")]);}else halves.push([]);
    c.move(m);states.push(c.asString());}
  mode='demo';demo={title,moves,i:0,now:null,kind,live:true,states,halves,half:false,off:false,segs};
  if(kind==='scramble')scrambleSeq=moves;
  renderPlayer();sayMove(demo,0);
}
function followUpdate(f){
  const d=demo;let j=d.states[d.i+1]===f?d.i+1:d.states.indexOf(f);const wasOff=d.off;
  if(j>=0){const moved=j!==d.i;d.i=j;d.half=false;d.off=false;if(moved&&j<d.moves.length)sayMove(d,j);else if(wasOff&&j<d.moves.length)sayMove(d,j);}
  else if(d.halves[d.i]&&d.halves[d.i].includes(f)){d.half=true;d.off=false;say(thVoice?'อีกครั้ง':'once more');}
  else{d.off=true;d.half=false;if(!wasOff)say(thVoice?'ไม่ตรงท่า':'wrong move');}
  if(d.i>=d.moves.length)say(thVoice?'เสร็จแล้ว':'done');
  if(d.i>=d.moves.length){
    if(d.kind==='scramble'){mode='practice';demo=null;history=[];running=false;elapsed=null;armed=true;startInspection();toast(inspOn?'สุ่มเสร็จแล้ว เริ่มนับเวลาดูโจทย์':'สุ่มเสร็จแล้ว หมุนท่าแรกเพื่อเริ่มจับเวลา');}
    else if(d.kind==='hint'){toast(`ทำขั้น ${d.hintStep} เสร็จแล้ว!`);goLive('live');}
    else toast('เรียงเสร็จแล้ว เก่งมาก!');
  }
}
function btScramble(){if(!bt.on)return;loadFollow('หมุนลูกจริงตามเพื่อสุ่ม',genScramble(20),'scramble');toTop();}
function btSolve(){
  if(!bt.on)return;const m=$('#btSolveMsg');
  if(bt.facelet===SOLVED){m.innerHTML='<div class="infocard">ลูกเรียงอยู่แล้ว ลองหมุนให้มั่วก่อน แล้วกดอีกครั้ง</div>';return;}
  solutionCard(bt.facelet,true,m);
}
// ---- calibration (orientation + colours) ----
const SCHEMES={pastel:{up:['#F2F4F7','ขาว'],down:['#F2E400','เหลือง'],front:['#6FD3BE','มิ้นท์'],back:['#1E6FD9','น้ำเงิน'],right:['#E996C8','ชมพู'],left:['#EE5A1F','ส้ม']},
  std:{up:['#F4F6F8','ขาว'],down:['#FFD500','เหลือง'],front:['#009E60','เขียว'],back:['#0051BA','น้ำเงิน'],right:['#C41E3A','แดง'],left:['#FF5800','ส้ม']}};
const cal={step:0,scheme:'pastel',u:null};
const letterOf=n=>Object.keys(FACE).find(f=>FACE[f].every((v,i)=>v===n[i]));
function startCal(){cal.step=0;$('#calBox').hidden=false;$('#calPick').hidden=false;$('#calStep').hidden=true;$('#btCalStart').hidden=true;}
function calShow(t,sub){$('#calPick').hidden=true;$('#calStep').hidden=false;$('#calText').textContent=t;$('#calSub').textContent=sub||'';}
document.querySelectorAll('[data-scheme]').forEach(b=>b.onclick=()=>{cal.scheme=b.dataset.scheme;cal.step=1;const S=SCHEMES[cal.scheme];
  calShow(`1. ถือลูกให้กลางสี${S.up[1]}อยู่บน กลางสี${S.front[1]}หันเข้าหาตัว แล้วหมุนด้านบน 1 ครั้ง`,'หมุนทางไหนก็ได้');});
function calMove(mv){
  const f=mv[0],S=SCHEMES[cal.scheme];
  if(cal.step===1){cal.u=f;cal.step=2;calShow(`2. ถือลูกท่าเดิม แล้วหมุนด้านหน้า (กลางสี${S.front[1]}) 1 ครั้ง`,'ด้านที่หันเข้าหาตัว');return;}
  if(cal.step===2){
    const nu=FACE[cal.u],nf=FACE[f];
    if(nu[0]*nf[0]+nu[1]*nf[1]+nu[2]*nf[2]!==0){cal.step=1;calShow(`หมุนด้านเดิมหรือด้านตรงข้าม ลองใหม่: ถือกลางสี${S.up[1]}ไว้บน กลางสี${S.front[1]}หันหาตัว แล้วหมุนด้านบน 1 ครั้ง`);return;}
    const nr=[nu[1]*nf[2]-nu[2]*nf[1],nu[2]*nf[0]-nu[0]*nf[2],nu[0]*nf[1]-nu[1]*nf[0]],neg=v=>v.map(x=>-x);
    const map={[cal.u]:S.up,[letterOf(neg(nu))]:S.down,[f]:S.front,[letterOf(neg(nf))]:S.back,[letterOf(nr)]:S.right,[letterOf(neg(nr))]:S.left};
    for(const k in map){COL[k]=map[k][0];NAME[k]=map[k][1];}
    saveColors();try{localStorage.setItem('rubik-bt-cal','1');}catch(e){}
    cal.step=0;cubies.forEach(paint);renderEditor();renderLesson();renderPad();renderPlayer();
    calShow('ตั้งค่าเสร็จแล้ว ✓',`ต่อไปให้ถือลูกแบบนี้เสมอ: กลางสี${N.U}อยู่บน กลางสี${N.F}หันหาตัว`);
    $('#btCalStart').hidden=false;$('#btCalStart').textContent='ตั้งสีและทิศทางใหม่';
    toast(`ถือกลางสี${N.U}ไว้บน สี${N.F}หันหาตัว`);
  }
}
$('#btCalStart').onclick=startCal;

// ---- BT coach for lessons ----
let lastStage=null,coachBusy=false;
function updateCoach(fromMove){
  if(!bt.on||!bt.facelet)return;
  const txt=$('#coachText');
  if(!LBL._ready){if(coachBusy)return;coachBusy=true;txt.textContent='กำลังวิเคราะห์ลูก…';setTimeout(()=>{try{LBL.init();LBL._ready=true;}catch(e){txt.textContent='วิเคราะห์ลูกไม่สำเร็จ ('+(e&&e.message)+') ลองรีเฟรชหน้า';coachBusy=false;return;}coachBusy=false;updateCoach(false);},30);return;}
  let st;try{st=LBL.stageOf(bt.facelet);}catch(e){txt.textContent='อ่านสภาพลูกไม่ได้ ลองกด “ตั้งให้ลูกนี้เป็นลูกที่เรียงแล้ว” หลังเรียงลูกจริง หรือส่งข้อมูลแก้ปัญหาให้ Claude';return;}
  [...$('#coachBar').children].forEach((e,i)=>e.classList.toggle('on',i<st));
  $('#coachSub').textContent=`ถือกลางสี${N.U}ไว้บน สี${N.F}หันหาตัว`;
  if(st===7)txt.innerHTML='<b>ลูกเรียงครบแล้ว</b> ลองหมุนให้มั่ว แล้วเริ่มขั้น 1 ใหม่';
  else txt.innerHTML=(st?`ทำเสร็จถึง <b>ขั้น ${st}</b> แล้ว `:'')+`ต่อไป: <b>ขั้น ${st+1} ${ct(STEPS[st+1].t)}</b>`;
  $('#coachGo').textContent=st===7?'ไปบทเรียน':`ไปบทเรียนขั้น ${st+1}`;$('#coachGo').onclick=()=>goStep(st===7?1:st+1,'basic');
  $('#coachHint').disabled=st===7;
  if(fromMove&&lastStage!=null&&st>lastStage){let n=0;for(let i=lastStage+1;i<=st;i++)if(!prog[i]){prog[i]=true;n++;}
    saveProg();renderLesson();toast(st===7?'เรียงเสร็จทั้งลูก เก่งมาก!':`ทำขั้น ${st} สำเร็จ!${n?' ติ๊กให้แล้ว':''}`);}
  lastStage=st;
}
function coachHint(){
  if(!bt.on)return;if(!LBL._ready){LBL.init();LBL._ready=true;}
  const st=LBL.stageOf(bt.facelet);if(st===7)return;
  const segs=LBL.solve(bt.facelet).filter(g=>g.step===st+1);if(!segs.length)return;
  const r=flatSegs(segs);loadFollow(`ใบ้ขั้น ${st+1}`,r.moves,'hint',r.segs).then(()=>{demo.hintStep=st+1;});toTop();
}
$('#coachHint').onclick=coachHint;$('#coachShow').onclick=()=>{goLive('live');toTop();};

// ---- time stats ----
let times=[];try{times=JSON.parse(localStorage.getItem('rubik-times')||'[]')||[];}catch(e){}
function recordSolve(ms,moves,real){if(!scrambleSeq.length&&!real)return;const pen=curPen;times.push({t:Math.round(ms+(typeof pen==='number'?pen:0)),m:moves,d:Date.now(),bt:!!real,p:pen||0});if(times.length>500)times.shift();
  try{localStorage.setItem('rubik-times',JSON.stringify(times));}catch(e){}renderStats();}
function aoN(n){if(times.length<n)return null;const a=times.slice(-n).map(x=>x.p==='dnf'?Infinity:x.t).sort((x,y)=>x-y);a.shift();a.pop();const v=a.reduce((x,y)=>x+y,0)/a.length;return isFinite(v)?v:'DNF';}
function renderStats(){
  const ok=times.filter(x=>x.p!=='dnf'),st=$('#stats'),best=ok.length?Math.min(...ok.map(x=>x.t)):null,f=v=>v==null?'–':v==='DNF'?'DNF':fmt(v);
  st.innerHTML=[['ดีที่สุด',f(best)],['ao5',f(aoN(5))],['ao12',f(aoN(12))],['ครั้ง',times.length]].map(([a,b])=>`<div><b>${b}</b><small>${a}</small></div>`).join('');
  const sp=$('#spark'),last=ok.slice(-30);
  if(last.length>1){const mx=Math.max(...last.map(x=>x.t)),mn=Math.min(...last.map(x=>x.t)),rg=Math.max(1,mx-mn);
    const pts=last.map((x,i)=>`${(i/(last.length-1)*296+2).toFixed(1)},${(52-(x.t-mn)/rg*48).toFixed(1)}`).join(' ');
    sp.innerHTML=`<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;}else sp.innerHTML='';
  sp.style.display=last.length>1?'':'none';
  $('#tlist').innerHTML=times.slice(-10).reverse().map(x=>`<li class="${x.p==='dnf'?'dnf':x.t===best?'best':''}"><span>${new Date(x.d).toLocaleDateString('th-TH',{day:'numeric',month:'short'})}${x.bt?' · ลูกจริง':''}</span><b>${x.p==='dnf'?'DNF':fmt(x.t)+(x.p?'+':'')}</b></li>`).join('')||'<li style="grid-column:1/-1;border:0" class="muted">ยังไม่มีประวัติ ลองสุ่มโจทย์แล้วเรียงให้เสร็จ</li>';
}
const it=$('#inspToggle');it.checked=inspOn;it.onchange=()=>{inspOn=it.checked;try{localStorage.setItem('rubik-insp',inspOn?'1':'0');}catch(e){}};
// ---- backup ----
$('#exportBtn').onclick=()=>{
  const o={app:'rubik',v:1,at:new Date().toISOString(),data:{}};
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('rubik-'))o.data[k]=localStorage.getItem(k);}}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));
  a.download=`rubik-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('ส่งออกไฟล์แล้ว ดูในโฟลเดอร์ดาวน์โหลด');};
$('#importIn').onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
  const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!o||o.app!=='rubik'||!o.data)throw 0;
    for(const k in o.data)if(k.startsWith('rubik-')&&typeof o.data[k]==='string')localStorage.setItem(k,o.data[k]);
    toast('นำเข้าข้อมูลแล้ว กำลังโหลดใหม่…');setTimeout(()=>location.reload(),900);}
    catch(err){toast('ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอปรูบิค');}};rd.readAsText(f);};
confirmTap($('#clearTimes'),()=>{times=[];try{localStorage.setItem('rubik-times','[]');}catch(e){}renderStats();});
renderStats();

const btSheet=$('#btSheet');
function openBt(){$('#btMsg').innerHTML='';btUI();btSheet.hidden=false;document.body.style.overflow='hidden';}
function closeBt(){btSheet.hidden=true;document.body.style.overflow='';}
$('#btPill').onclick=openBt;$('#btClose').onclick=closeBt;
btSheet.addEventListener('click',e=>{if(e.target===btSheet)closeBt();});
$('#btGo').onclick=()=>{if(bt.on){bt.manual=true;const d=bt.dev;onBtDisconnect();try{d.gatt.disconnect();}catch(e){}closeBt();}else btConnect();};
$('#btReset').onclick=()=>{if(!bt.on)return;btWrite(0xa1);bt.raw=SOLVED;setOffset(null);bt.facelet=SOLVED;bt.moves=[];closeBt();toast('ตั้งค่าแล้ว ลูกนี้คือลูกที่เรียงแล้ว');
  if(mode==='live'||mode==='practice'||(mode==='demo'&&demo&&demo.live))goLive(curTab==='practice'?'practice':'live');};
$('#btCopy').onclick=async()=>{const txt=[`device: ${bt.name}`,`ua: ${navigator.userAgent}`,`synced: ${!!bt.X}`,`raw-now: ${bt.raw} (${checkFacelet(bt.raw)||'ok'})`].concat(btLog.map(x=>`${x.t} | ${x.ok} | pm:${x.pm} | mv:${x.mv} | ${x.hex} | ${x.raw}`)).join('\n');
  try{await navigator.clipboard.writeText(txt);toast('คัดลอกแล้ว วางในแชทได้เลย');}catch(e){const el=$('#btLog');el.textContent=txt;toast('คัดลอกอัตโนมัติไม่ได้ กดค้างที่ข้อความเพื่อคัดลอก');}};
$('#btUnsync').onclick=()=>{setOffset(null);if(bt.on){bt.facelet=bt.raw;bt.moves=[];if(mode==='live'||mode==='practice')goLive(mode);}toast('ล้างการซิงค์แล้ว');};
$('#btScramble').onclick=btScramble;$('#btSolve').onclick=btSolve;
$('#btSync').onclick=()=>{
  const m=$('#btSolveMsg');if(!bt.on)return;
  const errs=validate();
  if(errs.length){m.innerHTML='<div class="errcard"><strong>ยังซิงค์ไม่ได้</strong><ul>'+errs.map(e=>'<li>'+e+'</li>').join('')+`</ul><p class="small" style="margin:0">กรอกหรือถ่ายรูปให้ครบ 6 ด้านในส่วนด้านล่างก่อน ถือกลางสี${N.U}ไว้บน กลางสี${N.F}หันหาตัวทุกครั้ง</p></div>`;return;}
  const T=Cube.fromString(entry.join('')),X=T.clone();X.multiply(cubeInv(Cube.fromString(bt.raw)));
  setOffset(X);bt.facelet=entry.join('');bt.moves=[];m.innerHTML='';
  if(bt.facelet===SOLVED){btWrite(0xa1);bt.raw=SOLVED;setOffset(null);}
  goLive('live');toTop();toast('ซิงค์แล้ว ลองหมุนลูกจริงดู หน้าจอควรตรงกันแล้ว');
};
addEventListener('keydown',e=>{if(e.key==='Escape'&&!btSheet.hidden)closeBt();});

// ---------- navigation ----------
let curTab='learn';
function selectTab(name){
  curTab=name;
  for(const[t,id]of[['learn','#navLearn'],['practice','#navPractice'],['solve','#navSolve']]){$(id).setAttribute('aria-selected',t===name);$('#'+t).hidden=t!==name;}
  if(name==='learn'&&!(mode==='demo'&&demo&&demo.kind==='lesson')){stopAll();clearTimeout(autoTimer);mode='intro';demo=null;renderPlayer();}
  if(name==='practice'){if(bt.on){if(!(mode==='demo'&&demo&&demo.live&&demo.kind==='scramble'))goLive('practice');}else enterPractice();}
  if(name==='solve'&&!(mode==='demo'&&demo&&demo.kind==='solution')){if(bt.on)goLive('live');else enterEdit();}
  if(name!=='solve')renderPad();
  if(name==='learn')updateCoach(false);
  scrollTo({top:0});
}
$('#navLearn').onclick=()=>selectTab('learn');
$('#navPractice').onclick=()=>selectTab('practice');
$('#navSolve').onclick=()=>selectTab('solve');

// ---------- view drag ----------
let drag=null;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,vx,vy};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag)return;vy=drag.vy+(e.clientX-drag.x)*.5;vx=clamp(drag.vx-(e.clientY-drag.y)*.5,-89,89);setView();});
const endDrag=()=>drag=null;stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
$('#resetView').onclick=()=>{vx=-28;vy=-38;setView();};

let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(async()=>{await idle();layout();},120);});
build();setView();renderLesson();renderPad();renderPlayer();$('#appVer').textContent=APP_VER;
// offline / install support when self-hosted (e.g. GitHub Pages)
if(location.protocol==='https:'&&!/claude|anthropic/.test(location.hostname)){
  try{const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});}catch(e){}
}
})();
