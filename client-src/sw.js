import icon from './ntfy.png';

self.addEventListener('push', function(event) {
  var payload = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.message,
      icon,
    })
  );
});
