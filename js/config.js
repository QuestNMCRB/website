const CONFIG = {
  firebase: {
    apiKey: "AIzaSyDPwKAgzjXymEcWojrQqOGA3s1CeJAmq7o",
    authDomain: "questnmarkwebsite.firebaseapp.com",
    projectId: "questnmarkwebsite",
    storageBucket: "questnmarkwebsite.firebasestorage.app",
    messagingSenderId: "512038227993",
    appId: "1:512038227993:web:8147fc7dca151673811a88",
    measurementId: "G-TPLD1HHR4K",
    databaseURL: "https://questnmarkwebsite-default-rtdb.firebaseio.com"
  }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;

// Prevent modification of config
Object.freeze(CONFIG);
