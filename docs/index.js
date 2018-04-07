// cribbed from https://github.com/web-push-libs/web-push/tree/f18c2f36472197b3273eb42ac1f5430c35acc120#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const subscriptionToConfig = (subscription, privateKey) => jsyaml.dump({
  ntfy_webpush: {
    subscription_info: JSON.parse(JSON.stringify(subscription)),
    private_key: privateKeyPath || '/path/to/private_key.pem',
  },
});

const {publicKey, privateKeyPath} = window.location.hash
  .split(/[#&]/).
  slice(1).map(s => s.split('='))
  .reduce((obj, [k, v]) => Object.assign(obj, {[k]: v}), {});

if (publicKey) {
  document.body.classList.add('subscribe');
  document.body.classList.remove('info');
  document.querySelector('.qr').classList.add('show');
  const sub = document.querySelector('button#subscribe');
  sub.disabled = false;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        const subOnclick = (e) => {
          registration.pushManager.getSubscription()
            .then((subscription) => (subscription || registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            })))
            .then((subscription) => {
              document.querySelector('#config').innerHTML = subscriptionToConfig(subscription);
            })
            .then(() => {
              sub.innerHTML = 'Unsubscribe';
              sub.classList.add('unsub');
            })
            .catch(console.log);
        };
        const unsubOnclick = () => registration.pushManager.getSubscription()
          .then((subscription) => subscription.unsubscribe())
          .then(() => {
            document.querySelector('#config').innerHTML = '';
          })
          .then(() => {
            sub.innerHTML = 'Subscribe';
            sub.classList.remove('unsub');
          });
        sub.onclick = (e) => (e.target.classList.has('unsub') ? unsubOnclick() : subOnclick());
        registration.pushManager.getSubscription()
          .then((subscription) => {
            if (subscription) {
              document.querySelector('#config').innerHTML = subscriptionToConfig(subscription);
              sub.innerHTML = 'Unsubscribe';
              sub.classList.add('unsub');
            }
          });
      });
  } else {
    document.getElementById('no-sw').style.display = 'block';
  }
} else {
  document.body.classList.remove('subscribe');
  document.body.classList.add('info');
}
