"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const NASDAQ_SYMBOLS = [
  {
    symbol: 'NASDAQ:NDX',
    name: 'NASDAQ-100',
    description: '나스닥 100 지수'
  },
  {
    symbol: 'NASDAQ:IXIC',
    name: 'NASDAQ Composite',
    description: '나스닥 종합지수'
  }
];

const NasdaqTradingView: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            NASDAQ 지수
            <Badge variant="outline" className="text-xs px-1 py-0">
              로딩중
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3">
          <div className="bg-gray-100 rounded-lg h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">차트 로딩중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            NASDAQ 지수
            <Badge variant="outline" className="text-xs px-1 py-0">
              실시간
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3">
        <div className="space-y-3">
          {/* 지수 선택 */}
          <div className="flex gap-1.5">
            {NASDAQ_SYMBOLS.map((index, i) => (
              <Button
                key={index.symbol}
                onClick={() => setSelectedIndex(i)}
                variant={selectedIndex === i ? "default" : "outline"}
                size="sm"
                className="text-xs px-2 py-1 h-6"
              >
                {index.name}
              </Button>
            ))}
          </div>

          {/* TradingView 차트 (iframe) */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              key={selectedIndex}
              src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_${selectedIndex}&symbol=${encodeURIComponent(NASDAQ_SYMBOLS[selectedIndex].symbol)}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=America%2FNew_York&withdateranges=1&allow_symbol_change=true&referral_id=2588&utm_source=localhost&utm_medium=widget&utm_campaign=chart`}
              width="100%"
              height="300"
              frameBorder="0"
              allowTransparency={true}
              scrolling="no"
              allowFullScreen={true}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              style={{
                display: 'block',
                width: '100%',
                height: '300px',
                margin: '0px',
                padding: '0px'
              }}
              onError={() => {
                console.error('TradingView iframe failed to load');
              }}
            />
          </div>

          {/* 선택된 지수 정보 */}
          <div className="text-center text-xs text-muted-foreground">
            <p className="font-medium">{NASDAQ_SYMBOLS[selectedIndex].description}</p>
            <p>실시간 데이터 제공: TradingView</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NasdaqTradingView;