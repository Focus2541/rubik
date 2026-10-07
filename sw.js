// Offline cache for the Rubik app. Files are versioned (?v=N) so updates are picked up automatically.
const VERSION='rubik-v11';
const CORE=['./','./index.html','./app.css?v=11','./app.js?v=11','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    if(req.mode==='navigate'||!url.search){
      const key=req.mode==='navigate'?'./index.html':req;
      e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(key,c));}return r;}).catch(()=>caches.match(key).then(h=>h||caches.match('./index.html'))));return;
    }
    e.respondWith(caches.match(req).then(h=>h||fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c));return r;})));return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(h=>h||fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c));return r;})));
  }
});
