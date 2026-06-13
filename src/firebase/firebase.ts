import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Configuração oficial do seu projeto Firebase.
 * Agora integrada com Auth e Firestore.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDcex1FGDWEOtRRzyzpSEombUxbyWQPxPU",
  authDomain: "fake-store-49520.firebaseapp.com",
  projectId: "fake-store-49520",
  storageBucket: "fake-store-49520.firebasestorage.app",
  messagingSenderId: "686103626361",
  appId: "1:686103626361:web:32280d2903ff9f7fbc0aa8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as instâncias para uso nos Contexts e Services
export const auth = getAuth(app);
auth.languageCode = 'pt-BR';
export const db = getFirestore(app);
