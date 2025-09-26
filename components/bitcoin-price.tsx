"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BitcoinPriceData {
  price: number;
  change_24h: number;
  last_updated: number;
}

export default function BitcoinPrice() {
  const [bitcoinData, setBitcoinData] = useState<BitcoinPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        console.log('Fetching Bitcoin price...');
        const response = await fetch('/api/bitcoin-price');
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Bitcoin price API 요청 실패`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success && result.data) {
          setBitcoinData({
            price: result.data.price,
            change_24h: result.data.change_24h,
            last_updated: result.data.last_updated
          });
          setError(null);
          console.log('Bitcoin data updated successfully');
        } else {
          throw new Error(result.error || 'API 응답 오류');
        }
      } catch (err) {
        console.error('Bitcoin price fetch error:', err);
        setError(`가격 로드 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBitcoinPrice();
    // 30초마다 업데이트
    const interval = setInterval(fetchBitcoinPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
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

  if (loading) {
    return (
      <div>
        <div className="w-16 h-5 bg-gray-300 rounded animate-pulse mb-1" />
        <div className="text-xs text-muted-foreground">BTC 가격</div>
      </div>
    );
  }

  if (error || !bitcoinData) {
    return (
      <div>
        <div className="text-sm text-red-500">--</div>
        <div className="text-xs text-muted-foreground">BTC 가격</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm font-semibold">
        {formatPrice(bitcoinData.price)}
      </div>
      <div className={`text-xs flex items-center gap-1 ${getChangeColor(bitcoinData.change_24h)}`}>
        {getChangeIcon(bitcoinData.change_24h)}
        {bitcoinData.change_24h > 0 ? '+' : ''}
        {bitcoinData.change_24h.toFixed(2)}%
      </div>
      <div className="text-xs text-muted-foreground">BTC 가격</div>
    </div>
  );
}