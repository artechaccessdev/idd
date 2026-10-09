// Troque a versão ao publicar mudanças para forçar a atualização do cache
const CACHE = 'carteira-v1';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Responde do cache na hora e atualiza em segundo plano (inclui as fotos dos cartões)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const salvo = await c.match(req, { ignoreSearch: true });
    const rede = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => salvo);
    return salvo || rede;
  }));
});
