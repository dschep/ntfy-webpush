``ntfy-webpush``
================

Brining webpush notifications to `ntfy <https://github.com/dschep/ntfy>`_.

.. image:: screenshot.png

Quick start
~~~~~~~~~~~

::

    sudo pip install ntfy-webpush
    ntfy-webpush

Then follow the directions.

Config Options
~~~~~~~~~~~~~~
    * ``subscription_info`` - A `PushSubscription <https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription>`_ Object
    * ``private_key`` - the path to private key file or anything else
      `that works with pywebpush <https://github.com/web-push-libs/pywebpush>`_.

Example config:
~~~~~~~~~~~~~~~
.. code:: yaml

    ---
    backends:
        - ntfy_webpush
    ntfy_webpush:
    subscription_info:
        endpoint: >-
        https://updates.push.services.mozilla.com/wpush/v2/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        keys:
        auth: xXXxXXxxxXXXXxxxXXxxXX
        p256dh: >-
            xXXxXXxxxXXXXxxxXXxxXxXXxXXxxxXXXXxxxXXxxXxXXxXXxxxXXXXxxxXXxxXxXXxXXxxxXXXXxxxXXxxXXXX
    private_key: /home/user/.local/share/ntfy/private_key.pem
