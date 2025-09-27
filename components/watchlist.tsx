"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, TrendingUp, TrendingDown } from "lucide-react";

interface WatchlistCoin {
  symbol: string;
  koreanName: string;
  price: string;
  change: string;
  changePercent: string;
  addedAt: number;
}

interface WatchlistProps {
  className?: string;
  coinData?: { [key: string]: any };
  realTimeChangePercents?: { [key: string]: string };
  getKoreanName?: (symbol: string) => string;
  formatPrice?: (price: string) => string;
}

export function Watchlist({
  className = "",
  coinData = {},
  realTimeChangePercents = {},
  getKoreanName = (symbol) => symbol,
  formatPrice = (price) => price
}: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("crypto-watchlist");
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (error) {
        console.error("Failed to parse watchlist:", error);
      }
    }
  }, []);

  const saveWatchlist = (newWatchlist: WatchlistCoin[]) => {
    setWatchlist(newWatchlist);
    localStorage.setItem("crypto-watchlist", JSON.stringify(newWatchlist));
  };

  const addToWatchlist = (symbol: string) => {
    const data = coinData[symbol];
    if (!data) return;

    const newCoin: WatchlistCoin = {
      symbol,
      koreanName: getKoreanName(symbol),
      price: data.closing_price || data.prev_closing_price,
      change: data.fluctate_24H || "0",
      changePercent: realTimeChangePercents[symbol] || data.fluctate_rate_24H || "0",
      addedAt: Date.now()
    };

    const newWatchlist = [...watchlist, newCoin];
    saveWatchlist(newWatchlist);
  };

  const removeFromWatchlist = (symbol: string) => {
    const newWatchlist = watchlist.filter(coin => coin.symbol !== symbol);
    saveWatchlist(newWatchlist);
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(coin => coin.symbol === symbol);
  };

  const updateWatchlistPrices = () => {
    const updatedWatchlist = watchlist.map(coin => {
      const data = coinData[coin.symbol];
      if (data) {
        return {
          ...coin,
          price: data.closing_price || data.prev_closing_price,
          change: data.fluctate_24H || "0",
          changePercent: realTimeChangePercents[coin.symbol] || data.fluctate_rate_24H || "0"
        };
      }
      return coin;
    });

    if (JSON.stringify(updatedWatchlist) !== JSON.stringify(watchlist)) {
      setWatchlist(updatedWatchlist);
    }
  };

  useEffect(() => {
    updateWatchlistPrices();
  }, [coinData, realTimeChangePercents]);

  const getChangeColor = (rate: string) => {
    const num = parseFloat(rate);
    if (num > 0) return "text-green-600";
    if (num < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (rate: string) => {
    const num = parseFloat(rate);
    if (num > 0) return <TrendingUp className="w-3 h-3" />;
    if (num < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  if (watchlist.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            내 워치리스트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">관심 코인을 추가해보세요</p>
            <p className="text-xs mt-1">코인을 클릭하여 워치리스트에 추가할 수 있습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          내 워치리스트 ({watchlist.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchlist.map((coin) => (
          <div
            key={coin.symbol}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">
                  {coin.koreanName}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {coin.symbol}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                ₩{formatPrice(coin.price)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  parseFloat(coin.changePercent) > 0
                    ? "default"
                    : parseFloat(coin.changePercent) < 0
                    ? "destructive"
                    : "secondary"
                }
                className="flex items-center gap-1 text-xs"
              >
                {getChangeIcon(coin.changePercent)}
                {parseFloat(coin.changePercent) > 0 ? "+" : ""}
                {coin.changePercent}%
              </Badge>

              <Button
                onClick={() => removeFromWatchlist(coin.symbol)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function WatchlistButton({
  symbol,
  isInWatchlist,
  onToggle,
  className = ""
}: {
  symbol: string;
  isInWatchlist: boolean;
  onToggle: (symbol: string) => void;
  className?: string;
}) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(symbol);
      }}
      variant="ghost"
      size="sm"
      className={`h-6 w-6 p-0 ${className}`}
    >
      <Star
        className={`w-3 h-3 ${
          isInWatchlist
            ? "fill-yellow-500 text-yellow-500"
            : "text-muted-foreground hover:text-yellow-500"
        }`}
      />
    </Button>
  );
}