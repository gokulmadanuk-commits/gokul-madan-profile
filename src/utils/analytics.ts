
// Lightweight analytics - logs to console only.
// Replace with Google Analytics or similar if you want tracking later.

export const trackPageView = (pageName: string) => {
  console.log('[Analytics] Page view:', pageName);
};

export const trackClick = (elementName: string) => {
  console.log('[Analytics] Click:', elementName);
};

export const trackDownload = (fileName: string) => {
  console.log('[Analytics] Download:', fileName);
};
