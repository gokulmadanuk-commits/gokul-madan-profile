
import { useEffect } from 'react';
import { trackPageView, trackClick, trackDownload } from '@/utils/analytics';

export const useAnalytics = () => {
  const trackPageViewOnMount = (pageName: string) => {
    useEffect(() => {
      trackPageView(pageName);
    }, [pageName]);
  };

  return {
    trackPageView,
    trackClick,
    trackDownload,
    trackPageViewOnMount,
  };
};
