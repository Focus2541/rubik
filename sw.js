// Offline cache for the Rubik app. Bump VERSION after uploading a new index.html.
const VERSION='rubik-v6';
const CORE=['./','./index.html','./app.css','./app.js','./vendor/cube.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // network first for the page so updates show up, cache as fallback offline
    if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return r;}).catch(()=>caches.match('./index.html')));return;}
    e.respondWith(caches.match(req).then(h=>h||fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c));return r;})));return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(h=>h||fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c));return r;})));
  }
});
