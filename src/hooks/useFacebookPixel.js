import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const useFacebookPixel = () => {
  const location = useLocation();

  // Automatically track PageView on route change
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  // Reusable function to track any event
  const track = useCallback((event, data = {}) => {
    if (window.fbq) {
      window.fbq('track', event, data);
    }
  }, []);

  return { track };
};

export default useFacebookPixel; 