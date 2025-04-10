// Importe as funções que você precisa dos SDKs que você precisa
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// Initializa o Firebase
const app = initializeApp(firebaseConfig);

// Initializa o Firebase Analytics
const analytics = getAnalytics(app);

// inicializa o Firestore
const db = getFirestore(app);


db.collection("Usuario").doc("1").get().then(function(doc) {
  if (doc.exists) {
    console.log("Documento exixtente");
  } else {
    console.log("Documento não existe");
  }

})