/* ============================================================================
   NAMMA EXAM V3 — SERVICE WORKER
   ============================================================================
   IT CACHES NOTHING. ON PURPOSE.

   v2's service worker tried to cache responses, and on Cloudflare Pages every
   .html URL 307-redirects to its clean form. Caching a redirected response
   throws in some browsers, and that thrown error surfaced to the page as a
   full ERR_FAILED navigation failure. Real users could not load the site.
   It was hard to find because a hard refresh bypasses service workers, so it
   looked fine to anyone testing that way.

   With no fetch handler at all, that entire class of bug cannot happen. This
   file exists so the app is installable and can receive push later — nothing
   more. If caching is ever added, test navigating BETWEEN pages straight
   afterwards, not a hard refresh.
   ========================================================================= */

self.addEventListener('install',  function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

/* Deliberately no 'fetch' listener. Every request goes straight to the
   network exactly as it would without a service worker. */

/* Push is wired but unused until a sender exists. */
self.addEventListener('push', function (e) {
  if (!e.data) return;
  let d = {};
  try { d = e.data.json(); } catch (err) { d = { title: 'Namma Exam', body: e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Namma Exam', {
    body:  d.body || '',
    icon:  'icon-192.png',
    badge: 'icon-badge.png',   // must be white-on-transparent or it renders as a grey blob
    tag:   d.tag || 'namma',   // same tag replaces instead of stacking up
    data:  { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window' }).then(function (list) {
    for (const c of list) { if ('focus' in c) { c.focus(); return c.navigate(url); } }
    return clients.openWindow(url);
  }));
});
