
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

export const firebaseConfig = {
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

// This function ensures that Firebase is initialized only once.
function initializeFirebase() {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        if (typeof window !== 'undefined') {
            try {
                // These services should only be initialized on the client-side.
                auth = getAuth(app);
                db = getFirestore(app);
                if (firebaseConfig.measurementId) {
                    analytics = getAnalytics(app);
                }
            } catch (e) {
                console.error("Failed to initialize Firebase client services", e);
            }
        }
    } else {
        app = getApp();
        if (typeof window !== 'undefined') {
            // Ensure services are available on subsequent calls too
            auth = getAuth(app);
            db = getFirestore(app);
        }
    }
}

// Initialize Firebase immediately when this module is loaded.
initializeFirebase();

// Export the initialized services.
export { app, auth, db, analytics };
