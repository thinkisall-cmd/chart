"use client";

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: any[];
  navigationType: string;
};

export function sendToAnalytics(metric: WebVitalsMetric) {
  // 여기서 분석 서버로 전송 (예: Google Analytics, 자체 서버)
  console.log('[Web Vitals]', metric);

  // 로컬 스토리지에 저장하여 모니터링
  const webVitalsData = JSON.parse(localStorage.getItem('web-vitals') || '[]');
  webVitalsData.push({
    ...metric,
    timestamp: Date.now(),
    url: window.location.href
  });

  // 최대 100개 항목만 유지
  if (webVitalsData.length > 100) {
    webVitalsData.splice(0, webVitalsData.length - 100);
  }

  localStorage.setItem('web-vitals', JSON.stringify(webVitalsData));
}

export function initWebVitals() {
  if (typeof window === 'undefined') return;

  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

export function getWebVitalsThresholds() {
  return {
    LCP: { good: 2500, poor: 4000 }, // ms
    CLS: { good: 0.1, poor: 0.25 }, // score
    FCP: { good: 1800, poor: 3000 }, // ms
    TTFB: { good: 800, poor: 1800 }, // ms
    INP: { good: 200, poor: 500 }, // ms
  };
}

export function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = getWebVitalsThresholds();
  const threshold = thresholds[name as keyof typeof thresholds];

  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function getWebVitalsData() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('web-vitals') || '[]');
}