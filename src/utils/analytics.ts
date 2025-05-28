
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
}

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

export const trackEvent = async (event: Omit<AnalyticsEvent, 'page_url' | 'user_agent' | 'referrer' | 'country' | 'region' | 'city' | 'ip_address'>) => {
  try {
    // Get location data
    const locationData = await getLocationData();
    
    const eventData: AnalyticsEvent = {
      ...event,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
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
