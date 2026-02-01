import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyB6f1kgrBT9Bsdj4ri6KOY_rnwA2eiDWEE",
    authDomain: "memorymap-ameer.firebaseapp.com",
    projectId: "memorymap-ameer",
    storageBucket: "memorymap-ameer.firebasestorage.app",
    messagingSenderId: "305904878472",
    appId: "1:305904878472:web:aef3892ee80b290d4f703d",
    measurementId: "G-1GVXMX5K6G"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const FirebaseApp = {
    async save(data) {
        const docRef = await addDoc(collection(db, "memories"), data);
        return docRef.id;
    },
    async load() {
        const snap = await getDocs(collection(db, "memories"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}
export const MemoryApp = FirebaseApp ;
console.log('Firebase ready.');