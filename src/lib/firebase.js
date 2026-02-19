import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBM2RgfzfSRMJdNrHnoRgMNqw3b-XPgE_E",
    authDomain: "maaxmybill.firebaseapp.com",
    projectId: "maaxmybill",
    storageBucket: "maaxmybill.firebasestorage.app",
    messagingSenderId: "330790294685",
    appId: "1:330790294685:web:959b7dd812c85695fbb074",
    measurementId: "G-V9R6LWCKFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
