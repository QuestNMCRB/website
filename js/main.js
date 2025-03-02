class UserCounter {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    try {
      const app = firebase.initializeApp(CONFIG.firebase);
      
      // Initialize Firebase App Check
      const appCheck = firebase.appCheck();
      appCheck.activate('6Lf-aOcqAAAAAJgoqB0KzoPnnMJtfYrCsse453xV', true);
      
      this.db = firebase.database();
    } catch (e) {
      if (!/already exists/.test(e.message)) {
        console.error('Firebase initialization error:', e);
        this.updateDisplay('Error connecting');
        return;
      }
    }

    this.db = firebase.database();
    
    // Test database connection
    this.db.ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        console.log('Connected to Firebase');
      } else {
        console.log('Disconnected from Firebase');
        this.updateDisplay('Connecting...');
      }
    }, (error) => {
      console.error('Connection error:', error);
      this.updateDisplay('Connection error');
    });

    this.connectedRef = this.db.ref(".info/connected");
    this.presenceRef = this.db.ref("presence");
    
    this.setupPresence();
    this.trackActiveUsers();
  }

  async setupPresence() {
    try {
      // Verify user with reCAPTCHA before setting presence
      const token = await this.verifyRecaptcha();
      if (!token) {
        console.error('reCAPTCHA verification failed');
        this.updateDisplay('Verification failed');
        return;
      }

      // Generate a random user ID for this session
      this.userId = Math.random().toString(36).substring(2);

      this.connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
          const userRef = this.presenceRef.child(this.userId);
          userRef.onDisconnect().remove();
          userRef.set(true);
        }
      });
    } catch (error) {
      console.error('Setup presence error:', error);
      this.updateDisplay('Verification error');
    }
  }

  async verifyRecaptcha() {
    try {
      return await grecaptcha.execute('6Lf-aOcqAAAAAJgoqB0KzoPnnMJtfYrCsse453xV', {action: 'presence'});
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }

  trackActiveUsers() {
    this.presenceRef.on("value", (snap) => {
      const count = snap.numChildren();
      this.updateDisplay(count);
    });
  }

  updateDisplay(count) {
    if (typeof count === 'number') {
      this.element.textContent = `${count} active visitor${count !== 1 ? 's' : ''}`;
    } else {
      this.element.textContent = count;
    }
    this.element.classList.remove('loading');
  }
}

// Initialize the counter when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new UserCounter('active-users');
});
