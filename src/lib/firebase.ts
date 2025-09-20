import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, type Firestore, getFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { firebaseConfig } from './firebase-config';

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
