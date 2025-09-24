import { Badge } from "@/components/ui/badge";
import {
  isBinanceCoin,
  isBinanceAlphaCoin,
} from "@/lib/exchange-markers/binance";
import { isUpbitCoin } from "@/lib/exchange-markers/upbit";
import { isUpbitUsdtCoin } from "@/lib/exchange-markers/upbit-usdt";
import { BlockchainMarkers } from "./blockchain-markers";

interface ExchangeMarkersProps {
  symbol: string;
  className?: string;
  showBlockchain?: boolean;
}

export function ExchangeMarkers({
  symbol,
  className = "",
  showBlockchain = false,
}: ExchangeMarkersProps) {
  const markers = [];

  if (isBinanceAlphaCoin(symbol)) {
    markers.push(
      <Badge
        key="binance-alpha"
        variant="outline"
        className="text-xs px-1 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
      >
        Alpha
      </Badge>
    );
  }
  // 바이낸스 일반
  else if (isBinanceCoin(symbol)) {
    markers.push(
      <Badge
        key="binance"
        variant="outline"
        className="text-xs px-1 py-0.5 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
      >
        BN
      </Badge>
    );
  }

  // 업비트 USDT
  if (isUpbitUsdtCoin(symbol)) {
    markers.push(
      <Badge
        key="upbit-usdt"
        variant="outline"
        className="text-xs px-1 py-0.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      >
        UPusdt
      </Badge>
    );
  }
  // 업비트 일반
  else if (isUpbitCoin(symbol)) {
    markers.push(
      <Badge
        key="upbit"
        variant="outline"
        className="text-xs px-1 py-0.5 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
      >
        UP
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-0.5 sm:gap-1 ${className}`}>
      {markers}
      {showBlockchain && <BlockchainMarkers symbol={symbol} />}
    </div>
  );
}

// 마커 설명을 위한 범례 컴포넌트
export function ExchangeMarkersLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="text-xs px-1 py-0.5 bg-orange-50 text-orange-700 border-orange-200"
        >
          BN
        </Badge>
        <span>바이낸스</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="text-xs px-1 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Alpha
        </Badge>
        <span className="hidden sm:inline">바이낸스 알파</span>
        <span className="sm:hidden">BA</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="text-xs px-1 py-0.5 bg-purple-50 text-purple-700 border-purple-200"
        >
          Up
        </Badge>
        <span>업비트</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="text-xs px-1 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
        >
          UpUSDT
        </Badge>
        <span className="hidden sm:inline">업비트 USDT</span>
        <span className="sm:hidden">UU</span>
      </div>
    </div>
  );
}
