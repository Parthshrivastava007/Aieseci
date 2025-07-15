import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDXQVaqLAVluSDvTUSLceCpJdMj67kQxo",
  authDomain: "aieseci.firebaseapp.com",
  projectId: "aieseci",
  storageBucket: "aieseci.firebasestorage.app",
  messagingSenderId: "78926608751",
  appId: "1:78926608751:web:144729a73a80693957909a",
  measurementId: "G-1E4SMDMSCE",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };
