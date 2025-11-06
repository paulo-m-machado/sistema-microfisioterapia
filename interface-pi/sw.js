'use strict';

const CACHE_NAME = 'clinica-cache-v4';
const ASSETS = [
  './index.html',
  './login.html',
  './pacientes.html',
  './consultas.html',
  './anamnese.html',
  './agenda.html',
  './calendario.html',
  './profissional.html',
  './manifest.webmanifest',
  '../css/BaseNavegacao.css',
  '../css/AreaConteudoMain.css',
  '../css/Consultas.css',
  '../css/Pacientes.css',
  '../css/Anamnese.css',
  '../css/Agenda.css',
  '../css/Calendario.css',
  '../css/Profissional.css',
  '../js/auth.js',
  '../js/pacientes.js',
  '../js/consultas.js',
  '../js/anamnese.js',
  '../js/agenda.js',
  '../js/calendario.js',
  '../js/pwa.js',
  '../img/logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      }).catch(()=>cached);
    })
  );
});
