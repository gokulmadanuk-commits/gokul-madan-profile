
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  event_type: 'page_view' | 'click' | 'download';
  event_name: string;
  page_url: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  region?: string;
  city?: string;
  ip_address?: string;
  channel?: string;
  browser?: string;
  operating_system?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  session_id?: string;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Function to detect browser from user agent
const getBrowserInfo = (userAgent: string): { browser: string; os: string } => {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Other';
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opr') || ua.includes('opera')) {
    browser = 'Opera';
  }
  
  // Operating system detection
  let os = 'Other';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }
  
  return { browser, os };
};

// Function to detect device type based on user agent
const getDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  // Check for mobile devices
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    // Check specifically for tablets
    if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
      return 'Tablet';
    }
    return 'Mobile';
  }
  
  // Check for desktop
  if (/windows|macintosh|linux/i.test(ua)) {
    return 'Desktop';
  }
  
  return 'Other';
};

// Function to get user's location based on IP
const getLocationData = async () => {
  try {
    // Using ipapi.co for location detection (free tier allows 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      country: data.country_name || null,
      region: data.region || null,
      city: data.city || null,
      ip_address: data.ip || null,
    };
  } catch (error) {
    console.error('Failed to get location data:', error);
    return {
      country: null,
      region: null,
      city: null,
      ip_address: null,
    };
  }
};

export const trackEvent = async (event: Omit<AnalyticsEvent, 'page_url' | 'user_agent' | 'referrer' | 'country' | 'region' | 'city' | 'ip_address' | 'channel' | 'browser' | 'operating_system' | 'screen_resolution' | 'timezone' | 'language' | 'session_id'>) => {
  try {
    // Get location data
    const locationData = await getLocationData();
    
    // Get user agent and device info
    const userAgent = navigator.userAgent;
    const { browser, os } = getBrowserInfo(userAgent);
    const channel = getDeviceType(userAgent);
    
    // Get screen resolution
    const screenResolution = `${screen.width}x${screen.height}`;
    
    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get language
    const language = navigator.language || navigator.languages?.[0] || 'en-US';
    
    // Get session ID
    const sessionId = getSessionId();
    
    const eventData: AnalyticsEvent = {
      ...event,
      page_url: window.location.href,
      user_agent: userAgent,
      referrer: document.referrer || null,
      channel,
      browser,
      operating_system: os,
      screen_resolution: screenResolution,
      timezone,
      language,
      session_id: sessionId,
      ...locationData,
    };

    console.log('Tracking analytics event:', eventData);

    const { error } = await supabase
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('Analytics tracking error:', error);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Convenience functions for common events
export const trackPageView = (pageName: string) => {
  trackEvent({
    event_type: 'page_view',
    event_name: pageName,
  });
};

export const trackClick = (elementName: string) => {
  trackEvent({
    event_type: 'click',
    event_name: elementName,
  });
};

export const trackDownload = (fileName: string) => {
  trackEvent({
    event_type: 'download',
    event_name: fileName,
  });
};
