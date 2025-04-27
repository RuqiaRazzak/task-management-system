// Import the Firebase SDK
import firebase from "./firebase/app"
import "./firebase/auth"
import "./firebase/firestore"

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAMj4cp4c3ui7s7fXEIJVc2XnKcU3ytOc",
    authDomain: "sign-up-login-form-74df0.firebaseapp.com",
    projectId: "sign-up-login-form-74df0",
    storageBucket: "sign-up-login-form-74df0.firebasestorage.app",
    messagingSenderId: "501337414254",
    appId: "1:501337414254:web:d35d715674835583b3247f",
    measurementId: "G-HGH9T74PV7"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = firebase.auth()
const db = firebase.firestore()
