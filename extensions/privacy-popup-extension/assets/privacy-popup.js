/**
 * Privacy Popup JavaScript
 * Handles the display and interaction logic for the privacy popup
 */

(function() {
  'use strict';

  // Configuration
  const STORAGE_KEY = 'privacy_popup_accepted';
  const STORAGE_EXPIRY_DAYS = 365;

  /**
   * Set item in localStorage with expiry
   */
  function setWithExpiry(key, value, expiryDays) {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + (expiryDays * 24 * 60 * 60 * 1000)
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Privacy popup: Unable to save to localStorage');
    }
  }

  /**
   * Get item from localStorage with expiry check
   */
  function getWithExpiry(key) {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const now = new Date();

      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (e) {
      console.warn('Privacy popup: Unable to read from localStorage');
      return null;
    }
  }

  /**
   * Check if user has already accepted privacy policy
   */
  function hasAcceptedPrivacy() {
    return getWithExpiry(STORAGE_KEY) === 'true';
  }

  /**
   * Mark privacy policy as accepted
   */
  function markAsAccepted() {
    setWithExpiry(STORAGE_KEY, 'true', STORAGE_EXPIRY_DAYS);
  }

  /**
   * Apply custom styles from theme settings
   */
  function applyCustomStyles(popup, settings) {
    const container = popup.querySelector('.privacy-popup-container');
    if (!container) return;

    // Apply CSS custom properties for theming
    if (settings.backgroundColor) {
      container.style.setProperty('--popup-bg-color', settings.backgroundColor);
    }
    if (settings.textColor) {
      container.style.setProperty('--popup-text-color', settings.textColor);
    }
    if (settings.acceptButtonColor) {
      container.style.setProperty('--popup-accept-color', settings.acceptButtonColor);
    }

    // Apply position class
    if (settings.position) {
      popup.classList.add(`position-${settings.position}`);
    }
  }

  /**
   * Show the popup with animation
   */
  function showPopup(popup, delay = 0) {
    setTimeout(() => {
      popup.style.display = 'flex';
      // Force reflow before adding show class
      popup.offsetHeight;
      popup.classList.add('show');
    }, delay * 1000);
  }

  /**
   * Hide the popup with animation
   */
  function hidePopup(popup) {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  }

  /**
   * Handle accept button click
   */
  function handleAccept(popup) {
    markAsAccepted();
    hidePopup(popup);
    
    // Trigger custom event for analytics/tracking
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'privacy_popup_accepted',
        popup_id: popup.dataset.popupId
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('privacyPopupAccepted', {
      detail: { popupId: popup.dataset.popupId }
    }));
  }

  /**
   * Handle decline button click
   */
  function handleDecline(popup) {
    hidePopup(popup);
    
    // Trigger custom event for analytics/tracking
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'privacy_popup_declined',
        popup_id: popup.dataset.popupId
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('privacyPopupDeclined', {
      detail: { popupId: popup.dataset.popupId }
    }));
  }

  /**
   * Initialize popup functionality
   */
  function initializePopup(popup) {
    const popupId = popup.dataset.popupId;
    
    // Check if already accepted
    if (hasAcceptedPrivacy()) {
      return;
    }

    // Get settings from data attributes or use defaults
    const settings = {
      position: popup.classList.contains('position-top') ? 'top' : 
                popup.classList.contains('position-center') ? 'center' : 'bottom',
      delay: parseInt(popup.dataset.delay) || 2,
      backgroundColor: getComputedStyle(popup.querySelector('.privacy-popup-container')).getPropertyValue('--popup-bg-color'),
      textColor: getComputedStyle(popup.querySelector('.privacy-popup-container')).getPropertyValue('--popup-text-color'),
      acceptButtonColor: getComputedStyle(popup.querySelector('.privacy-popup-container')).getPropertyValue('--popup-accept-color')
    };

    // Apply custom styles
    applyCustomStyles(popup, settings);

    // Set up event listeners
    const acceptButton = popup.querySelector('.privacy-popup-accept');
    const declineButton = popup.querySelector('.privacy-popup-decline');

    if (acceptButton) {
      acceptButton.addEventListener('click', () => handleAccept(popup));
    }

    if (declineButton) {
      declineButton.addEventListener('click', () => handleDecline(popup));
    }

    // Close popup when clicking overlay (but not the content)
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        hidePopup(popup);
      }
    });

    // Show popup after delay
    showPopup(popup, settings.delay);
  }

  /**
   * Initialize all privacy popups on the page
   */
  function initializeAllPopups() {
    const popups = document.querySelectorAll('.privacy-popup-overlay');
    popups.forEach(initializePopup);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllPopups);
  } else {
    initializeAllPopups();
  }

  // Expose utility functions for external use
  window.PrivacyPopup = {
    hasAccepted: hasAcceptedPrivacy,
    markAsAccepted: markAsAccepted,
    showPopup: function(popupId) {
      const popup = document.querySelector(`[data-popup-id="${popupId}"]`);
      if (popup) showPopup(popup, 0);
    },
    hidePopup: function(popupId) {
      const popup = document.querySelector(`[data-popup-id="${popupId}"]`);
      if (popup) hidePopup(popup);
    }
  };

})();
