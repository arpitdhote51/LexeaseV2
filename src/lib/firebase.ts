import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, type Firestore, getFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

// This configuration is dynamically built from environment variables
// and is safe to be used on the client-side.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined = undefined;

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
            try {
                db = initializeFirestore(app, {
                    localCache: persistentLocalCache({})
                });
            } catch (e) {
                // Firestore can only be initialized once
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
            console.error("Firebase configuration is missing or incomplete. Please check your environment variables.");
        }
    } else {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        if (firebaseConfig.measurementId) {
            try {
                analytics = getAnalytics(app);
            } catch(e) {
                 console.error("Failed to initialize Analytics", e);
            }
        }
    }
}

// Export the initialized instances
export { app, auth, db, analytics };
