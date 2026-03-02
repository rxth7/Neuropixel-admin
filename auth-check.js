import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
    getFirestore
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export const firebaseConfig = {
    apiKey: "AIzaSyBTJ87liOWDstTyypJU0iKfyCqu6be5cos",
    authDomain: "neuropixel-admin.firebaseapp.com",
    projectId: "neuropixel-admin",
    storageBucket: "neuropixel-admin.firebasestorage.app",
    messagingSenderId: "956747718610",
    appId: "1:956747718610:web:f1545d0ff783b5f147320b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Check authentication and redirect if not logged in
export function requireAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'login.html';
                reject('Not authenticated');
            }
        });
    });
}

// Setup logout button
export function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'login.html';
        });
    }
}