const CACHE='sjw-app-v3.2.0-release-2';
const SHELL=['/','/index.html','/assets/css/app.css?v=3.2.0','/assets/js/config.js?v=3.2.0','/assets/js/api.js?v=3.2.0','/assets/js/app.js?v=3.2.0','/offline.html','/privacy.html','/terms.html','/refund.html','/acceptable-use.html','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/offline.html','/privacy.html','/terms.html','/refund.html','/acceptable-use.html'))));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>ws[0]?ws[0].focus():clients.openWindow('/')))});
