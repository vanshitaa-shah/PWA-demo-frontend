var deferredPrompt;
let enableNotificationButtons = document.querySelectorAll(
  '.enable-notifications'
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

const displayConfirmNotification = () => {
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'You have successfully subscribed for notifications',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification', //stack notifications
      renotify: false, //notis having same tag won't vibrate again
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
      ],
    };
    navigator.serviceWorker.ready.then((swreg) => {
      swreg.showNotification('Successfully Subscribed', options);
    });
  }
};
const configurePushSub = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  let reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      console.log({ sub });
      if (sub === null) {
        //create new subscription
        let vapidPublicKey =
          'BK-wC9PaG-eF11KXKHtKQ3EbdL3zTkRax8fR-ENqRX46UW5x6WlS3Yy2bD2QJBLjcYTCGs4-7TKO-b0fqzhJEns                                                                                                                                                                                                                                         ';
        console.log({ vapidPublicKey });

        let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);

        console.log({ convertedVapidPublicKey });
        const newSubscription = reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });

        console.log({ newSubscription });
        return newSubscription;
      } else {
      }
    })
    .then((newSub) => {
      console.log({ newSub });

      if (!newSub) {
        console.log('here');
        return;
      }
      return fetch(
        'https://pwagram-14946-default-rtdb.firebaseio.com/subscriptions.json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(newSub),
        }
      ).then((res) => {
        if (res.ok) {
          console.log('Sent data', res);
          displayConfirmNotification();
        }
      });
    })

    .catch((error) => {
      console.log('Error: ', error);
    });
};


const askForNotificationPersmission = () => {
  Notification.requestPermission((result) => {
    console.log('User Choice ', result);
    if (result !== 'granted') {
      console.log('No notification permission granted');
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
};

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = 'inline-block';
    enableNotificationButtons[i].addEventListener(
      'click',
      askForNotificationPersmission
    );
  }
}
