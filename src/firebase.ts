import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB0kd5uJSJ5WQMDYkD7hN73ULB7GunoIz8",
  authDomain: "bibidh-sastomart.firebaseapp.com",
  databaseURL: "https://bibidh-sastomart-default-rtdb.firebaseio.com",
  projectId: "bibidh-sastomart",
  storageBucket: "bibidh-sastomart.firebasestorage.app",
  messagingSenderId: "709990299466",
  appId: "1:709990299466:web:bd31c2834ce96dda3a73b3"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
