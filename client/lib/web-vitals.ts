import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

function sendToAnalytics(metric: Metric): void {
  if (!import.meta.env.PROD) {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
    return;
  }

  const body: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: 'include',
  }).catch((error) => {
    console.error('[Web Vitals] Failed to send metric:', error);
  });
}

export function initWebVitals(): void {
  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    if (import.meta.env.DEV) {
      console.log('[Web Vitals] Tracking initialized');
    }
  } catch (error) {
    console.error('[Web Vitals] Initialization failed:', error);
  }
}
