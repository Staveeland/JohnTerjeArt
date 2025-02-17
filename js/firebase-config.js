// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyBs_6nLPAuBL96Y7epkU_85FQE99uk7AiA",
    authDomain: "johnterjeart.firebaseapp.com",
    projectId: "johnterjeart",
    storageBucket: "johnterjeart.firebasestorage.app",
    messagingSenderId: "1001316994773",
    appId: "1:1001316994773:web:d683b5210ecd5772fe1c5c",
    measurementId: "G-MT18C8N6B1"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();