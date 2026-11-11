// Offline cache. Bump VERSION whenever a file below changes.
const VERSION = 'loopstone-1';
const FILES = ['./', 'index.html', 'style.css', 'ui.js', 'core.js', 'ai.js', 'ai-worker.js', 'audio.js',
  'content.js', 'config.js', 'icon.svg', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(keys => Promise.all(keys.filter(k => k.startsWith('loopstone-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
