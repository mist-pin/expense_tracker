import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { ref, push, get, set, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBZuNtoMgy77mvk165vuzBhOecjBQRULVA",
    authDomain: "expensetracker-27c8f.firebaseapp.com",
    databaseURL: "https://expensetracker-27c8f-default-rtdb.firebaseio.com",
    projectId: "expensetracker-27c8f",
    storageBucket: "expensetracker-27c8f.appspot.com",
    messagingSenderId: "487606584678",
    appId: "1:487606584678:web:5f7316bd18dcc913fb74a7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, set, push, child };