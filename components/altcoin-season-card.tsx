"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

interface AltcoinSeasonData {
  index: number;
  status: string;
  btcDominance: number;
  lastUpdated?: string;
  error?: string;
  note?: string;
}

export default function AltcoinSeasonCard() {
  const [data, setData] = useState<AltcoinSeasonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/altcoin-season');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch altcoin season data:', error);
        // 에러 시 더미 데이터
        setData({
          index: 50,
          status: '중립',
          btcDominance: 55.0,
          error: '데이터 로드 실패'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 10분마다 데이터 갱신
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '알트코인 시즌':
        return 'bg-green-100 text-green-800 border-green-200';
      case '비트코인 시즌':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '알트코인 시즌':
        return <TrendingUp className="w-4 h-4" />;
      case '비트코인 시즌':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getIndexColor = (index: number) => {
    if (index >= 75) return 'text-green-600';
    if (index <= 25) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
            알트코인 시즌 지수
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="w-20 h-8 bg-gray-300 rounded animate-pulse" />
            <div className="w-24 h-6 bg-gray-300 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getStatusIcon(data.status)}
          알트코인 시즌 지수
          {data.error && (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* 지수 */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${getIndexColor(data.index)}`}>
              {data.index}
            </div>
            <div className="text-xs text-muted-foreground">지수</div>
          </div>

          {/* 상태 */}
          <div className="text-center">
            <Badge
              variant="outline"
              className={`text-xs px-2 py-1 ${getStatusColor(data.status)}`}
            >
              {data.status}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">상태</div>
          </div>

          {/* BTC 도미넌스 */}
          <div className="text-center">
            <div className="text-lg font-semibold">
              {data.btcDominance.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">BTC 도미넌스</div>
          </div>

          {/* 설명 */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              {data.index >= 75 ? '🚀 알트 강세' :
               data.index <= 25 ? '₿ 비트 강세' :
               '⚖️ 균형'}
            </div>
            <div className="text-xs text-muted-foreground opacity-75">
              90일 기준
            </div>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>비트코인 시즌</span>
            <span>알트코인 시즌</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                data.index >= 75 ? 'bg-green-500' :
                data.index <= 25 ? 'bg-orange-500' : 'bg-gray-400'
              }`}
              style={{ width: `${data.index}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span className="text-center">50</span>
            <span>100</span>
          </div>
        </div>

        {/* 업데이트 시간 및 알림 */}
        <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {data.lastUpdated ?
                `업데이트: ${new Date(data.lastUpdated).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}` :
                '업데이트 시간 불명'
              }
            </span>
            {(data.error || data.note) && (
              <span className="text-yellow-600 text-xs">
                ⚠️ {data.error || data.note}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}