
import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [isAtTop, setIsAtTop] = useState(true);
  
  useEffect(() => {
    const handleScroll = () => {
      // Consider "at top" when scroll position is less than 100px
      const currentScrollPosition = window.scrollY;
      setIsAtTop(currentScrollPosition < 100);
    };
    
    // Set initial state
    handleScroll();
    
    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { isAtTop };
}
