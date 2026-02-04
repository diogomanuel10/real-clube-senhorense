import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4BCWSadjNCWBuofwcOSXXbDGiI2qrGAE",
  authDomain: "real-clube-senhorense.firebaseapp.com",
  projectId: "real-clube-senhorense",
  storageBucket: "real-clube-senhorense.firebasestorage.app",
  messagingSenderId: "687082892402",
  appId: "1:687082892402:web:452798a2aa8c71b0cea6eb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
