import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBLYnNrch5LVSzGlFmDDVur2q4-81voU4s",
  authDomain: "mymeadow-4ee7d.firebaseapp.com",
  projectId: "mymeadow-4ee7d",
  storageBucket: "mymeadow-4ee7d.firebasestorage.app",
  messagingSenderId: "270101216661",
  appId: "1:270101216661:web:59d1ae5b9c85565adbca9c",
  measurementId: "G-6M0JX18PCW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;