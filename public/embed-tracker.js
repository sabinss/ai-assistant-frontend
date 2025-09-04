/**
 * Embeddable Customer Tracking System
 * 
 * Usage:
 * <script src="https://your-domain.com/embed-tracker.js"></script>
 * 
 * Then call:
 * window.EmbedTracker.trackEvent("event_name", { customer_data });
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    endpoint: 'http://localhost:5001/api/events',
    authToken: '666158fe71bfe10b58cb23eea',
    version: '1.0.0',
    debug: false
  };

  // Utility functions
  const utils = {
    log: function(message, data) {
      if (CONFIG.debug) {
      }
    },

    generateId: function() {
      return 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    getDeviceInfo: function() {
      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };
    },

    getPageInfo: function() {
      return {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Core tracking class
  class EmbedTracker {
    constructor() {
      this.sessionId = this.generateSessionId();
      this.initialized = false;
      this.queue = [];
      this.init();
    }

    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
      try {
        // Set up session tracking
        this.trackSessionStart();
        
        // Track page load
        this.trackPageView();
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        utils.log('EmbedTracker initialized successfully');
        
        // Process any queued events
        this.processQueue();
      } catch (error) {
        utils.log('Error initializing EmbedTracker:', error);
      }
    }

    setupEventListeners() {
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackEvent('page_hidden', {});
        } else {
          this.trackEvent('page_visible', {});
        }
      });

      // Track before unload
      window.addEventListener('beforeunload', () => {
        this.trackEvent('page_unload', {});
      });

      // Track clicks on elements with data-track attributes
      document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-track]');
        if (target) {
          const eventName = target.getAttribute('data-track');
          const eventData = target.getAttribute('data-track-data');
          let parsedData = {};
          
          try {
            if (eventData) {
              parsedData = JSON.parse(eventData);
            }
          } catch (e) {
            utils.log('Error parsing data-track-data:', e);
          }

          this.trackEvent(eventName, {
            element: target.tagName.toLowerCase(),
            element_id: target.id || null,
            element_class: target.className || null,
            element_text: target.textContent?.substring(0, 100) || null,
            ...parsedData
          });
        }
      });
    }

    trackSessionStart() {
      this.trackEvent('session_start', {
        session_id: this.sessionId,
        device_info: utils.getDeviceInfo(),
        page_info: utils.getPageInfo()
      });
    }

    trackPageView() {
      this.trackEvent('page_view', {
        session_id: this.sessionId,
        page_info: utils.getPageInfo()
      });
    }

    trackEvent(eventName, eventData = {}) {
      if (!this.initialized) {
        this.queue.push({ eventName, eventData });
        return;
      }

      const payload = {
        feature_id: eventName,
        feature_date: new Date().toISOString(),
        device: "web",
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        session_id: this.sessionId,
        embed_version: CONFIG.version,
        ...eventData
      };

      utils.log('Sending tracking event:', payload);

      // Send to server
      fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.authToken}`
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        utils.log('Tracking event sent successfully:', data);
      })
      .catch(error => {
        utils.log('Error sending tracking event:', error);
      });
    }

    processQueue() {
      while (this.queue.length > 0) {
        const { eventName, eventData } = this.queue.shift();
        this.trackEvent(eventName, eventData);
      }
    }

    // Convenience methods for common tracking scenarios
    trackCustomerEvent(customerData) {
      this.trackEvent('customer_interaction', {
        customer_id: customerData.customer_id,
        customer_name: customerData.customer_name,
        interaction_type: customerData.interaction_type,
        ...customerData
      });
    }

    trackFeatureUsage(featureName, userData = {}) {
      this.trackEvent('feature_usage', {
        feature_name: featureName,
        user_id: userData.user_id,
        email: userData.email,
        organization: userData.organization,
        ...userData
      });
    }

    trackLoginEvent(userData) {
      this.trackEvent('login_event', {
        user_id: userData.user_id,
        email: userData.email,
        organization: userData.organization,
        login_method: userData.login_method || 'unknown',
        ...userData
      });
    }

    // Configuration methods
    configure(options) {
      Object.assign(CONFIG, options);
      utils.log('Configuration updated:', CONFIG);
    }

    setDebug(enabled) {
      CONFIG.debug = enabled;
      utils.log('Debug mode:', enabled ? 'enabled' : 'disabled');
    }
  }

  // Create global instance
  window.EmbedTracker = new EmbedTracker();

  // Expose configuration methods
  window.EmbedTracker.configure = window.EmbedTracker.configure.bind(window.EmbedTracker);
  window.EmbedTracker.setDebug = window.EmbedTracker.setDebug.bind(window.EmbedTracker);

  // Expose convenience methods
  window.EmbedTracker.trackCustomerEvent = window.EmbedTracker.trackCustomerEvent.bind(window.EmbedTracker);
  window.EmbedTracker.trackFeatureUsage = window.EmbedTracker.trackFeatureUsage.bind(window.EmbedTracker);
  window.EmbedTracker.trackLoginEvent = window.EmbedTracker.trackLoginEvent.bind(window.EmbedTracker);

  utils.log('EmbedTracker loaded and ready');
})(); 