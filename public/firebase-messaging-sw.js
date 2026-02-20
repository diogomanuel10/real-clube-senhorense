// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "A_TUA_API_KEY",
  authDomain: "o-teu-projeto.firebaseapp.com",
  projectId: "o-teu-project-id",
  storageBucket: "o-teu-bucket",
  messagingSenderId: "o-teu-sender-id",
  appId: "o-teu-app-id",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
