import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const useFacebookPixel = () => {
  const location = useLocation();
  const lastTrackedPath = useRef(null);

  // Automatically track PageView on route change (with deduplication)
  useEffect(() => {
    // Avoid duplicate tracking for same path
    if (lastTrackedPath.current === location.pathname) {
      return;
    }

    // Use requestIdleCallback to avoid blocking main thread
    const trackPageView = () => {
      if (window.fbq && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
        lastTrackedPath.current = location.pathname;
      }
    };

    // Defer tracking to idle time or fallback to timeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(trackPageView, { timeout: 1000 });
    } else {
      setTimeout(trackPageView, 100);
    }
  }, [location.pathname]);

  // Optimized reusable function to track any event
  const track = useCallback((event, data = {}) => {
    // Validate inputs
    if (!event || typeof event !== 'string') {
      console.warn('Facebook Pixel: Invalid event name');
      return;
    }

    // Use requestIdleCallback for non-critical events
    const trackEvent = () => {
      if (window.fbq && typeof window.fbq === 'function') {
        try {
          window.fbq('track', event, data);
        } catch (error) {
          console.warn('Facebook Pixel tracking error:', error);
        }
      }
    };

    // Critical events (AddToCart, Purchase) track immediately
    const criticalEvents = ['AddToCart', 'Purchase', 'InitiateCheckout'];
    if (criticalEvents.includes(event)) {
      trackEvent();
    } else {
      // Non-critical events can be deferred
      if (window.requestIdleCallback) {
        window.requestIdleCallback(trackEvent, { timeout: 2000 });
      } else {
        setTimeout(trackEvent, 50);
      }
    }
  }, []);

  return { track };
};

export default useFacebookPixel;