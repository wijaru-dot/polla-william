import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWW8M5g-vx4hiF05kUS4n5dNoQVp--GP8",
  authDomain: "polla-william.firebaseapp.com",
  databaseURL: "https://polla-william-default-rtdb.firebaseio.com",
  projectId: "polla-william",
  storageBucket: "polla-william.firebasestorage.app",
  messagingSenderId: "855690217674",
  appId: "1:855690217674:web:345c48559e546878798c33"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;
