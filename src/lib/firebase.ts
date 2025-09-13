import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, type Firestore, getFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDhXH5v9VknuSLZclH4NmQcL6ZZMNNTic0",
    authDomain: "studio-7376954909-7abc4.firebaseapp.com",
    projectId: "studio-7376954909-7abc4",
    storageBucket: "studio-7376954909-7abc4.appspot.com",
    messagingSenderId: "131083878984",
    appId: "1:131083878984:web:0b73c0919373959b85c2c5",
    measurementId: "G-9T325DLBHR",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

// Initialize Firebase on the client side
if (typeof window !== 'undefined') {
    if (!getApps().length) {
        // Ensure all config values are present before initializing
        if (
            firebaseConfig.apiKey &&
            firebaseConfig.authDomain &&
            firebaseConfig.projectId &&
            firebaseConfig.storageBucket &&
            firebaseConfig.messagingSenderId &&
            firebaseConfig.appId
        ) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = initializeFirestore(app, {
                localCache: persistentLocalCache({})
            });
            if (firebaseConfig.measurementId) {
                analytics = getAnalytics(app);
            }
        } else {
            console.error("Firebase configuration is missing or incomplete. Please check your environment variables.");
        }
    } else {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        if (firebaseConfig.measurementId) {
            analytics = getAnalytics(app);
        }
    }
}

// Export the initialized instances
export { app, auth, db, analytics };
