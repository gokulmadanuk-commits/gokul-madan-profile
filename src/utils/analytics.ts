
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  event_type: 'page_view' | 'click' | 'download';
  event_name: string;
  page_url: string;
  user_agent?: string;
  referrer?: string;
}

export const trackEvent = async (event: Omit<AnalyticsEvent, 'page_url' | 'user_agent' | 'referrer'>) => {
  try {
    const eventData: AnalyticsEvent = {
      ...event,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
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
