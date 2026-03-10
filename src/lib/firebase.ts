import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlDi9NAqyaxmj-Dsm7iFyeUwQUCeo9jaY",
  authDomain: "studio-7951938114-8c2e2.firebaseapp.com",
  projectId: "studio-7951938114-8c2e2",
  storageBucket: "studio-7951938114-8c2e2.firebasestorage.app",
  messagingSenderId: "522249545224",
  appId: "1:522249545224:web:c211f7752dfd79e34913bd"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
