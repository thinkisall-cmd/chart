"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Clock, MousePointer, TrendingUp, Trash2 } from "lucide-react";
import { initWebVitals, getWebVitalsData, type WebVitalsMetric } from "@/lib/web-vitals";

interface WebVitalsMonitorProps {
  className?: string;
}

export function WebVitalsMonitor({ className = "" }: WebVitalsMonitorProps) {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    initWebVitals();

    const loadMetrics = () => {
      const data = getWebVitalsData();
      setMetrics(data);
    };

    loadMetrics();

    // 10초마다 업데이트
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const clearMetrics = () => {
    localStorage.removeItem('web-vitals');
    setMetrics([]);
  };

  const getLatestMetrics = () => {
    const latest: { [key: string]: any } = {};

    metrics.forEach(metric => {
      if (!latest[metric.name] || metric.timestamp > latest[metric.name].timestamp) {
        latest[metric.name] = metric;
      }
    });

    return Object.values(latest);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'LCP': return <Clock className="w-4 h-4" />;
      case 'FID':
      case 'INP': return <MousePointer className="w-4 h-4" />;
      case 'CLS': return <TrendingUp className="w-4 h-4" />;
      case 'FCP': return <Activity className="w-4 h-4" />;
      case 'TTFB': return <BarChart3 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getMetricDescription = (name: string) => {
    switch (name) {
      case 'LCP': return 'Largest Contentful Paint';
      case 'FID': return 'First Input Delay';
      case 'INP': return 'Interaction to Next Paint';
      case 'CLS': return 'Cumulative Layout Shift';
      case 'FCP': return 'First Contentful Paint';
      case 'TTFB': return 'Time to First Byte';
      default: return name;
    }
  };

  const latestMetrics = getLatestMetrics();

  if (!isVisible && latestMetrics.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Core Web Vitals
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsVisible(!isVisible)}
              variant="ghost"
              size="sm"
              className="text-xs h-6"
            >
              {isVisible ? '숨기기' : '보기'}
            </Button>
            {metrics.length > 0 && (
              <Button
                onClick={clearMetrics}
                variant="ghost"
                size="sm"
                className="text-xs h-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="space-y-3">
          {latestMetrics.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Activity className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">측정 데이터가 없습니다</p>
              <p className="text-xs mt-1">페이지 상호작용 후 데이터가 수집됩니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {latestMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className="p-3 bg-gray-50 rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric.name)}
                    <span className="text-xs font-medium">{metric.name}</span>
                    <div className={`w-2 h-2 rounded-full ${getRatingColor(metric.rating)}`} />
                  </div>

                  <div>
                    <div className="text-sm font-semibold">
                      {formatValue(metric.name, metric.value)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getMetricDescription(metric.name)}
                    </div>
                  </div>

                  <Badge
                    variant={
                      metric.rating === 'good'
                        ? 'default'
                        : metric.rating === 'needs-improvement'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {metric.rating === 'good' && '좋음'}
                    {metric.rating === 'needs-improvement' && '개선 필요'}
                    {metric.rating === 'poor' && '나쁨'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {metrics.length > 0 && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              총 {metrics.length}개 측정 데이터 수집됨
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}