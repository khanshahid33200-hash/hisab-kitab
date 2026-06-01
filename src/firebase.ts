import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "com-example-merahisabkit-81bcf",
  appId: "1:465230318413:web:ad02a01d1484563fe78504",
  storageBucket: "com-example-merahisabkit-81bcf.firebasestorage.app",
  apiKey: "AIzaSyCe-Ij4ymPX7fIpNHqZWUWY4sV6DBePYqY",
  authDomain: "com-example-merahisabkit-81bcf.firebaseapp.com",
  messagingSenderId: "465230318413",
  projectNumber: "465230318413"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
