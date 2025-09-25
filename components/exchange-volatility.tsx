"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CoinData {
  opening_price: string;
  closing_price: string;
  min_price: string;
  max_price: string;
  units_traded: string;
  acc_trade_value: string;
  prev_closing_price: string;
  units_traded_24H: string;
  acc_trade_value_24H: string;
  fluctate_24H: string;
  fluctate_rate_24H: string;
  date: string;
}

interface ExchangeVolatilityProps {
  coinData: { [key: string]: CoinData };
  realTimeChangePercents: { [key: string]: string };
  loading: boolean;
}

// Safe import functions with fallbacks
let isBinanceCoin: (symbol: string) => boolean = () => false;
let isBinanceAlphaCoin: (symbol: string) => boolean = () => false;
let isUpbitCoin: (symbol: string) => boolean = () => false;
let isUpbitUsdtCoin: (symbol: string) => boolean = () => false;

try {
  const binanceModule = require('@/lib/exchange-markers/binance');
  isBinanceCoin = binanceModule.isBinanceCoin || isBinanceCoin;
  isBinanceAlphaCoin = binanceModule.isBinanceAlphaCoin || isBinanceAlphaCoin;
} catch (error) {
  console.warn('Failed to load binance markers:', error);
}

try {
  const upbitModule = require('@/lib/exchange-markers/upbit');
  isUpbitCoin = upbitModule.isUpbitCoin || isUpbitCoin;
} catch (error) {
  console.warn('Failed to load upbit markers:', error);
}

try {
  const upbitUsdtModule = require('@/lib/exchange-markers/upbit-usdt');
  isUpbitUsdtCoin = upbitUsdtModule.isUpbitUsdtCoin || isUpbitUsdtCoin;
} catch (error) {
  console.warn('Failed to load upbit USDT markers:', error);
}

export default function ExchangeVolatility({ coinData, realTimeChangePercents, loading }: ExchangeVolatilityProps) {
  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">거래소별 변동률</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 거래소별로 코인들을 분류하고 평균 변동률 계산
  const exchanges = [
    {
      name: '빗썸',
      key: 'bithumb',
      color: 'bg-red-50 text-red-700 border-red-200',
      filterFn: () => true // 빗썸은 모든 코인
    },
    {
      name: '바이낸스',
      key: 'binance',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      filterFn: isBinanceCoin
    },
    {
      name: '바이낸스 알파',
      key: 'binance-alpha',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      filterFn: isBinanceAlphaCoin
    },
    {
      name: '업비트',
      key: 'upbit',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      filterFn: isUpbitCoin
    },
    {
      name: '업비트 USDT',
      key: 'upbit-usdt',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      filterFn: isUpbitUsdtCoin
    }
  ];

  const exchangeStats = exchanges.map(exchange => {
    const coins = Object.keys(coinData).filter(symbol => exchange.filterFn(symbol));

    if (coins.length === 0) {
      return {
        ...exchange,
        avgChange: 0,
        count: 0,
        topGainers: []
      };
    }

    const changes = coins.map(symbol => {
      const change = parseFloat(realTimeChangePercents[symbol] || coinData[symbol]?.fluctate_rate_24H || '0');
      return { symbol, change };
    });

    const avgChange = changes.reduce((sum, item) => sum + item.change, 0) / changes.length;
    const topGainers = changes
      .sort((a, b) => b.change - a.change)
      .slice(0, 3)
      .filter(item => item.change > 0);

    return {
      ...exchange,
      avgChange,
      count: coins.length,
      topGainers
    };
  }).sort((a, b) => b.avgChange - a.avgChange); // 변동률 높은 순으로 정렬

  const formatPercent = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">거래소별 변동률</CardTitle>
        <p className="text-xs text-muted-foreground">평균 변동률 기준 상위 거래소</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {exchangeStats.map((exchange, index) => (
            <div key={exchange.key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                <Badge variant="outline" className={`text-xs px-2 py-1 ${exchange.color}`}>
                  {exchange.name}
                </Badge>
                <span className="text-xs text-muted-foreground">({exchange.count}개)</span>
              </div>
              <div className="flex items-center gap-1">
                {getChangeIcon(exchange.avgChange)}
                <span className={`text-sm font-medium ${getChangeColor(exchange.avgChange)}`}>
                  {formatPercent(exchange.avgChange)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 최고 상승률 코인 표시 */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">거래소별 최고 상승률</p>
          <div className="space-y-2">
            {exchangeStats.map(exchange =>
              exchange.topGainers.length > 0 && (
                <div key={`${exchange.key}-top`} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${exchange.color}`}>
                      {exchange.name}
                    </Badge>
                    <span className="font-mono">{exchange.topGainers[0].symbol}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">
                      +{exchange.topGainers[0].change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}