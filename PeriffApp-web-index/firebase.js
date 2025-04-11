// Importe as funções que você precisa dos SDKs que você precisa
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRD_qENa8o4HkeOBED50CLCxWvvVZfUNA",
  authDomain: "periff-app.firebaseapp.com",
  projectId: "periff-app",
  storageBucket: "periff-app.firebasestorage.app",
  messagingSenderId: "455048533449",
  appId: "1:455048533449:web:084953a178214cf1c04418",
  measurementId: "G-5QE8HQS97D"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Analytics
const analytics = getAnalytics(app);
// inicializa o Firestore
const db = getFirestore(app);