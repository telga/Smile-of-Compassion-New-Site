import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyClTXO9V4VtApWhsvVnQzh590P8D_eLwss",
  authDomain: "soc-login-3ce90.firebaseapp.com",
  projectId: "soc-login-3ce90",
  storageBucket: "soc-login-3ce90.firebasestorage.app",
  messagingSenderId: "335993224709",
  appId: "1:335993224709:web:1e58f0c486256ecf53a66c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 