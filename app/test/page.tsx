"use client";

import BitcoinPrice from "@/components/bitcoin-price";
import NasdaqTradingView from "@/components/nasdaq-index";

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">컴포넌트 테스트</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">비트코인 가격</h2>
          <BitcoinPrice />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">나스닥 차트</h2>
          <NasdaqTradingView />
        </div>
      </div>
    </div>
  );
}