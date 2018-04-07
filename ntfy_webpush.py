import getpass
import json
import os
import platform

from ntfy.data import ntfy_data_dir
from pywebpush import webpush
from py_vapid import Vapid01, b64urlencode


def notify(title, message, private_key, subscription_info, **kwargs):
    webpush(
        subscription_info,
        json.dumps({'title': title, 'message': message}),
        vapid_private_key=private_key,
        vapid_claims={'sub': 'mailto:{0}@{1}.local'.format(getpass.getuser(), platform.node())},
    )


def setup():
    vapid = Vapid01()
    private_key_path = os.path.join(ntfy_data_dir, 'private_key.pem')
    public_key_path = os.path.join(ntfy_data_dir, 'public_key.pem')

    if os.path.exists(private_key_path):
        print('Loading from', private_key_path)
        vapid = Vapid01.from_file(private_key_path)
    else:
        vapid.generate_keys()
        print('Generating', private_key_path)
        vapid.save_key(private_key_path)
        print('Generating', public_key_path)
        vapid.save_public_key(public_key_path)

    raw_pub = vapid.public_key.public_numbers().encode_point()
    print()
    print('Open the following url in your browser to continue configuring ntfy-webpush')
    print('https://dschep.github.io/ntfy-webpush/#publicKey={0}&privateKeyPath={1}'.format(
        b64urlencode(raw_pub), private_key_path))

if __name__ == '__main__':
    setup()
