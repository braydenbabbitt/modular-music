import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBRJ0qvjuR6xZFECN3Z-qNqXJ9t-zeqNd0',
  authDomain: 'modular-music.firebaseapp.com',
  projectId: 'modular-music',
  storageBucket: 'modular-music.appspot.com',
  messagingSenderId: '321874823664',
  appId: '1:321874823664:web:24f9d62fb8d11956b3f535',
};

const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
