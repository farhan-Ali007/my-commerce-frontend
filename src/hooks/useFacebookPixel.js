import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useFacebookPixel() {
  const location = useLocation();

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);
} 