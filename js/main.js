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
    
    this.waitForRecaptcha().then(() => {
      this.setupPresence();
      this.trackActiveUsers();
    });

    // Log page view
    if (window.gtag) {
      gtag('event', 'page_view');
    }
  }

  async waitForRecaptcha() {
    if (!window.recaptchaLoaded) {
      await new Promise(resolve => {
        document.addEventListener('recaptchaLoaded', resolve, { once: true });
      });
    }
  }

  async setupPresence() {
    try {
      const token = await this.verifyRecaptcha();
      if (!token) {
        // Log verification failure
        if (window.gtag) {
          gtag('event', 'recaptcha_failed');
        }
        this.updateDisplay('Verification failed');
        return;
      }

      // Log successful verification
      if (window.gtag) {
        gtag('event', 'user_verified');
      }

      // Generate a random user ID for this session
      this.userId = `user_${Math.random().toString(36).substring(2)}`;

      this.connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
          const userRef = this.presenceRef.child(this.userId);
          
          // First remove any existing presence
          userRef.remove()
            .then(() => {
              // Set up disconnect cleanup
              userRef.onDisconnect().remove();
              // Set presence
              return userRef.set(true);
            })
            .catch(error => {
              console.error('Presence error:', error);
              if (error.code === 'PERMISSION_DENIED') {
                this.updateDisplay('Access restricted');
              }
            });
        }
      });
    } catch (error) {
      // Log errors
      if (window.gtag) {
        gtag('event', 'error', {
          'error_type': 'presence_setup',
          'error_message': error.message
        });
      }
      console.error('Setup presence error:', error);
      this.updateDisplay('Connection error');
    }
  }

  async verifyRecaptcha() {
    try {
      // Wait for a small delay to ensure reCAPTCHA is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await grecaptcha.execute('6Lf-aOcqAAAAAJgoqB0KzoPnnMJtfYrCsse453xV', {action: 'presence'});
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }

  trackActiveUsers() {
    this.presenceRef.on("value", (snap) => {
      if (snap.exists()) {
        const count = snap.numChildren();
        // Log user count changes
        if (window.gtag) {
          gtag('event', 'active_users', {
            'count': count
          });
        }
        this.updateDisplay(count);
      } else {
        this.updateDisplay(0);
      }
    }, (error) => {
      console.error('Error tracking users:', error);
      if (error.code === 'PERMISSION_DENIED') {
        this.updateDisplay('Access restricted');
      }
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
