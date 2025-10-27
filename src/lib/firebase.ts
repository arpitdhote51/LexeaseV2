import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, type Firestore, getFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined = undefined;

const firebaseConfig = {
    apiKey: "AIzaSyDcFJTJnGLI-uVStqI8uuQVcQMY34ilMJg",
    authDomain: "studio-7376954909-7abc4.firebaseapp.com",
    projectId: "studio-7376954909-7abc4",
    storageBucket: "studio-7376954909-7abc4.appspot.com",
    messagingSenderId: "131083878984",
    appId: "1:131083878984:web:0b73c0919373959b85c2c5",
    measurementId: "G-9T325DLBHR"
};

function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
            try {
                db = initializeFirestore(app, {
                    localCache: persistentLocalCache({})
                });
            } catch (e) {
                console.warn("Could not initialize persistent cache. Falling back to in-memory cache.", e);
                db = getFirestore(app);
            }
            if (firebaseConfig.measurementId) {
                try {
                    analytics = getAnalytics(app);
                } catch(e) {
                    console.error("Failed to initialize Analytics", e);
                }
            }
        } else {
            app = getApp();
            db = getFirestore(app);
        }
        auth = getAuth(app);
    }
}

initializeFirebase();

export { app, auth, db, analytics };
