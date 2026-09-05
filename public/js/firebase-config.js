// Configuração do projeto Firebase (plano Spark - gratuito).
// Estes valores são públicos por natureza (chave de identificação do
// app no navegador, não um segredo) e ficam protegidos pelas
// Firestore Security Rules (firestore.rules), não por sigilo aqui.
const firebaseConfig = {
  apiKey: "AIzaSyA_hZRQq1SF0PV58aeQwSaPvzqYtxXjIBo",
  authDomain: "ponto-de-apoio-2026.firebaseapp.com",
  projectId: "ponto-de-apoio-2026",
  storageBucket: "ponto-de-apoio-2026.firebasestorage.app",
  messagingSenderId: "600635442646",
  appId: "1:600635442646:web:5112b6833d05c3493b1077",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
