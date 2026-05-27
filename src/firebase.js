import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const prodConfig = {
  apiKey: "AIzaSyDWW8M5g-vx4hiF05kUS4n5dNoQVp--GP8",
  authDomain: "polla-william.firebaseapp.com",
  databaseURL: "https://polla-william-default-rtdb.firebaseio.com",
  projectId: "polla-william",
  storageBucket: "polla-william.firebasestorage.app",
  messagingSenderId: "855690217674",
  appId: "1:855690217674:web:345c48559e546878798c33"
};

const devConfig = {
  apiKey: "AIzaSyDHR43lbUZy_EaJLIqRemmSjUM6MYjtHSA",
  authDomain: "polla-william-dev.firebaseapp.com",
  databaseURL: "https://polla-william-dev-default-rtdb.firebaseio.com",
  projectId: "polla-william-dev",
  storageBucket: "polla-william-dev.firebasestorage.app",
  messagingSenderId: "803601993183",
  appId: "1:803601993183:web:e39e0ead5d347c53af086a"
};

const firebaseConfig = process.env.REACT_APP_ENV === "development" ? devConfig : prodConfig;

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);