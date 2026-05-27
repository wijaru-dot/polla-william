import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDHR43lbUZy_EaJLIqRemmSjUM6MYjtHSA",
  authDomain: "polla-william-dev.firebaseapp.com",
  databaseURL: "https://polla-william-dev-default-rtdb.firebaseio.com",
  projectId: "polla-william-dev",
  storageBucket: "polla-william-dev.firebasestorage.app",
  messagingSenderId: "803601993183",
  appId: "1:803601993183:web:e39e0ead5d347c53af086a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);