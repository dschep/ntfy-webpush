import {h, app} from 'hyperapp';
import yaml from 'js-yaml';
import logoURL from './ntfy.png';

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

const subscriptionToConfig = (subscription, privateKey) => yaml.dump({
  ntfy_webpush: {
    subscription_info: JSON.parse(JSON.stringify(subscription)),
    private_key: privateKeyPath || '/path/to/private_key.pem',
  },
});

const Usage = () => (
  <div>
    <p class="usage">
    Then send a test notification with:
    </p>
    <code>ntfy -b ntfy_webpush send 'testing webpush!'</code>
  </div>
);

const QrCode = ({publicKey}) => {
  if (publicKey)
    return (
      <div>
        <h4>Subscribing on your phone</h4>
        <p>
          To subscribe on notifications on your phone, open this same page with the full url on your phone.
          Here's a QR code to scan for convinence.
        </p>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(window.location)}`}/>
      </div>
    );
}

const GithubCorner = () => (
  <div>
    <a href="https://github.com/dschep/ntfy-webpush" className="github-corner" aria-label="View source on Github"><svg width={80} height={80} viewBox="0 0 250 250" style={{fill: '#151513', color: '#fff', position: 'absolute', top: 0, border: 0, right: 0}} aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" /><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{transformOrigin: '130px 106px'}} className="octo-arm" /><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body" /></svg></a><style dangerouslySetInnerHTML={{__html: ".github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}" }} />
  </div>
);

const Header = () => (
  <h1>
    <img src={logoURL} class="logo"/><span class="pre">ntfy</span> web-push
  </h1>
);

const Info = () => (
  <p class="info">
    To get started, install <span class="pre">ntfy-webpush</span> and run it to generate keys,
    then follow the link in the output to reload this page with a public key.
    <code>
      $ sudo pip install ntfy-webpush
      <br/>
      $ ntfy-webpush
      <br/>
      ....
    </code>
  </p>
);

const Subscribe = ({publicKey, subscription, subscribe, unsubscribe}) => {
  const isSubscribed = Boolean(subscription);
  const config = isSubscribed?subscriptionToConfig(subscription):'';
  return (
    <p class="subscribe">
        When a key is loaded, click subscribe to subscribe to notifications in this browser and then
        copy the config below into your <span class="pre">ntfy.yml</span>
        <p>
          <button disabled={!publicKey} onclick={() => (subscription?unsubscribe():subscribe())}>
            {subscription?'Unubscribe':'Subscribe'}
          </button>
        </p>
        <code id="config">{config}</code>
        <div style={{display: 'none'}} id="no-sw">
            Sorry, your browser doesn't support web-push.
        </div>
    </p>
  );
};

const {publicKey, privateKeyPath} = window.location.hash
  .split(/[#&]/).
  slice(1).map(s => s.split('='))
  .reduce((obj, [k, v]) => Object.assign(obj, {[k]: v}), {});

const state = {
  publicKey,
  privateKeyPath,
  subscription: null,
}

const actions = {
  getSubscription: () => (state, actions) => navigator.serviceWorker.register('./sw.js')
    .then((registration) => registration.pushManager.getSubscription())
    .then(actions.setSubscription),
  subscribe: () => (state, actions) => navigator.serviceWorker.register('./sw.js')
    .then((registration) => registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }))
    .then(actions.setSubscription),
  unsubscribe: () => (state, actions) => state.subscription.unsubscribe()
    .then(() => actions.setSubscription(undefined)),
  setSubscription: value => state => Object.assign({}, state, {subscription: value}),
};

const view = (state, actions) => (
  <div oncreate={actions.getSubscription}>
    <Header></Header>

    <Info></Info>

    <Subscribe
      subscribe={actions.subscribe}
      unsubscribe={actions.unsubscribe}
      subscription={state.subscription}
      publicKey={state.publicKey}>
    </Subscribe>

    <Usage></Usage>

    <QrCode publicKey={state.publicKey}></QrCode>

    <GithubCorner/>
  </div>
);

app(state, actions, view, document.body);
