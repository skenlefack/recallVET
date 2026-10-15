import { useState, useEffect } from 'react';

/**
 * Detect if the user is on a mobile screen.
 */
export function useMobile() {
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: isMobileScreen,
    isMobileScreen,
    isWeb: true
  };
}
