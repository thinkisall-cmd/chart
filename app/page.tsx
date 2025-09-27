"use client";

import React from "react";
import { useState, useEffect } from "react";
// import { useBithumbWebSocket } from "@/hooks/useBithumbWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FullPageSkeleton, CoinListSkeleton, ChartSkeleton, SectorsSkeleton } from "@/components/ui/loading-skeleton";
import { Watchlist, WatchlistButton } from "@/components/watchlist";
import { WebVitalsMonitor } from "@/components/web-vitals-monitor";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity,
  Filter,
  ExternalLink,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";
import { BannerAd, ResponsiveAd } from "@/components/adsense";
import AltcoinSeasonCard from "@/components/altcoin-season-card";
import ServiceWorkerRegistration from "@/components/service-worker-registration";
import { BackButton } from "@/components/back-button";
import { SiteHeader } from "@/components/site-header";

// 지연 로딩으로 초기 번들 사이즈 줄이기
import dynamic from "next/dynamic";

const SectorsPreview = dynamic(() => import("@/components/sectors-preview"), {
  loading: () => <SectorsSkeleton />,
});

const ExchangeVolatility = dynamic(
  () => import("@/components/exchange-volatility"),
  {
    loading: () => <ChartSkeleton />,
  }
);

const NasdaqTradingView = dynamic(() => import("@/components/nasdaq-index"), {
  loading: () => <ChartSkeleton />,
});

// Safe imports with fallbacks
let CRYPTO_KOREAN_NAMES: any = {};
let FALLBACK_KOREAN_NAMES: any = {};
let ExchangeMarkers: any = null;
let ExchangeMarkersLegend: any = null;
let BlockchainMarkersLegend: any = null;
let CoinDetailModal: any = null;
let getCoinSector: any = () => "기타";
let getSectorColor: any = () => "bg-neutral-100 text-neutral-800";

try {
  const koreanNamesModule = require("@/lib/crypto-korean-names");
  CRYPTO_KOREAN_NAMES = koreanNamesModule.CRYPTO_KOREAN_NAMES || {};
  FALLBACK_KOREAN_NAMES = koreanNamesModule.FALLBACK_KOREAN_NAMES || {};
} catch (error) {
  console.warn("Failed to load Korean names:", error);
}

try {
  const exchangeModule = require("@/components/exchange-markers");
  ExchangeMarkers = exchangeModule.ExchangeMarkers;
  ExchangeMarkersLegend = exchangeModule.ExchangeMarkersLegend;
} catch (error) {
  console.warn("Failed to load exchange markers:", error);
}

try {
  const blockchainModule = require("@/components/blockchain-markers");
  BlockchainMarkersLegend = blockchainModule.BlockchainMarkersLegend;
} catch (error) {
  console.warn("Failed to load blockchain markers:", error);
}

try {
  const modalModule = require("@/components/coin-detail-modal");
  CoinDetailModal = modalModule.CoinDetailModal;
} catch (error) {
  console.warn("Failed to load coin detail modal:", error);
}

try {
  const sectorsModule = require("@/lib/crypto-sectors");
  getCoinSector = sectorsModule.getCoinSector || getCoinSector;
  getSectorColor = sectorsModule.getSectorColor || getSectorColor;
} catch (error) {
  console.warn("Failed to load sector utilities:", error);
}

// 블록체인 기반 필터링을 위한 함수들
let getBlockchainMarker: any = () => null;

try {
  const blockchainModule = require("@/lib/blockchain-info");
  getBlockchainMarker =
    blockchainModule.getBlockchainMarker || getBlockchainMarker;
} catch (error) {
  console.warn("Failed to load blockchain info:", error);
}

// 필터링을 위한 함수들
let isBinanceCoin: any = () => false;
let isBinanceAlphaCoin: any = () => false;
let isUpbitCoin: any = () => false;
let isUpbitUsdtCoin: any = () => false;

try {
  const binanceModule = require("@/lib/exchange-markers/binance");
  isBinanceCoin = binanceModule.isBinanceCoin || isBinanceCoin;
  isBinanceAlphaCoin = binanceModule.isBinanceAlphaCoin || isBinanceAlphaCoin;
} catch (error) {
  console.warn("Failed to load binance markers:", error);
}

try {
  const upbitModule = require("@/lib/exchange-markers/upbit");
  isUpbitCoin = upbitModule.isUpbitCoin || isUpbitCoin;
} catch (error) {
  console.warn("Failed to load upbit markers:", error);
}

try {
  const upbitUsdtModule = require("@/lib/exchange-markers/upbit-usdt");
  isUpbitUsdtCoin = upbitUsdtModule.isUpbitUsdtCoin || isUpbitUsdtCoin;
} catch (error) {
  console.warn("Failed to load upbit USDT markers:", error);
}

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

interface BithumbResponse {
  status: string;
  data: {
    [key: string]: CoinData;
  };
}

export default function CryptoTracker() {
  const [coinData, setCoinData] = useState<{ [key: string]: CoinData }>({});
  const [previousPrices, setPreviousPrices] = useState<{
    [key: string]: string;
  }>({});
  const [priceChanges, setPriceChanges] = useState<{
    [key: string]: "up" | "down" | "same";
  }>({});
  const [realTimeChanges, setRealTimeChanges] = useState<{
    [key: string]: string;
  }>({});
  const [realTimeChangePercents, setRealTimeChangePercents] = useState<{
    [key: string]: string;
  }>({});
  const [updateCount, setUpdateCount] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedCoin, setSelectedCoin] = useState<{
    symbol: string;
    koreanName: string;
    price: string;
    change: string;
    changePercent: string;
  } | null>(null);

  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true); // REST API 연결 상태

  // 마커 필터링 상태
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // 워치리스트 상태
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("crypto-watchlist");
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(parsed.map((item: any) => item.symbol));
      } catch (error) {
        console.error("Failed to parse watchlist:", error);
      }
    }
  }, []);

  const toggleWatchlist = (symbol: string) => {
    const newWatchlist = watchlist.includes(symbol)
      ? watchlist.filter(s => s !== symbol)
      : [...watchlist, symbol];

    setWatchlist(newWatchlist);

    const watchlistData = newWatchlist.map(s => ({
      symbol: s,
      koreanName: getKoreanName(s),
      addedAt: Date.now()
    }));

    localStorage.setItem("crypto-watchlist", JSON.stringify(watchlistData));
  };

  // 필터 토글 함수
  const toggleFilter = (filterKey: string) => {
    const newFilters = new Set(activeFilters);

    // 블록체인 필터들 정의
    const blockchainFilters = [
      "ethereum",
      "solana",
      "bnb-chain",
      "bitcoin",
      "tron",
      "base",
      "avalanche",
      "layer2",
      "native",
    ];

    if (blockchainFilters.includes(filterKey)) {
      // 블록체인 필터는 단일 선택 (다른 블록체인 필터들 모두 해제)
      blockchainFilters.forEach((filter) => newFilters.delete(filter));

      // 현재 필터가 이미 활성화되어 있지 않았다면 추가
      if (!activeFilters.has(filterKey)) {
        newFilters.add(filterKey);
      }
    } else {
      // 거래소 필터는 다중 선택 가능
      if (newFilters.has(filterKey)) {
        newFilters.delete(filterKey);
      } else {
        newFilters.add(filterKey);
      }
    }

    setActiveFilters(newFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 필터 클리어 함수
  const clearFilters = () => {
    setActiveFilters(new Set());
    setCurrentPage(1);
  };

  // 블록체인별 필터 함수들
  const isEthereumCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "ETH";
  };

  const isSolanaCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "SOL";
  };

  const isBnbChainCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "BNB";
  };

  const isBitcoinCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "BTC";
  };

  const isTronCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "TRX";
  };

  const isBaseCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "BASE";
  };

  const isAvalancheCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "AVAX";
  };

  const isLayer2Coin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "L2" || marker === "BASE" || marker === "ARB";
  };

  const isNativeCoin = (symbol: string): boolean => {
    const marker = getBlockchainMarker(symbol);
    return marker === "NATIVE";
  };

  // 코인이 현재 활성 필터에 맞는지 확인하는 함수
  const coinMatchesFilters = (symbol: string): boolean => {
    if (activeFilters.size === 0) return true;

    const filters = Array.from(activeFilters);

    // 블록체인 필터들과 거래소 필터들 분리
    const blockchainFilters = [
      "ethereum",
      "solana",
      "bnb-chain",
      "bitcoin",
      "tron",
      "base",
      "avalanche",
      "layer2",
      "native",
    ];
    const exchangeFilters = ["binance", "binance-alpha", "upbit", "upbit-usdt"];

    const activeBlockchainFilters = filters.filter((f) =>
      blockchainFilters.includes(f)
    );
    const activeExchangeFilters = filters.filter((f) =>
      exchangeFilters.includes(f)
    );

    // 블록체인 필터 체크 (단일 선택이므로 하나만 있을 것)
    let blockchainMatch = activeBlockchainFilters.length === 0; // 블록체인 필터가 없으면 true
    if (activeBlockchainFilters.length > 0) {
      const blockchainFilter = activeBlockchainFilters[0];
      switch (blockchainFilter) {
        case "ethereum":
          blockchainMatch = isEthereumCoin(symbol);
          break;
        case "solana":
          blockchainMatch = isSolanaCoin(symbol);
          break;
        case "bnb-chain":
          blockchainMatch = isBnbChainCoin(symbol);
          break;
        case "bitcoin":
          blockchainMatch = isBitcoinCoin(symbol);
          break;
        case "tron":
          blockchainMatch = isTronCoin(symbol);
          break;
        case "base":
          blockchainMatch = isBaseCoin(symbol);
          break;
        case "avalanche":
          blockchainMatch = isAvalancheCoin(symbol);
          break;
        case "layer2":
          blockchainMatch = isLayer2Coin(symbol);
          break;
        case "native":
          blockchainMatch = isNativeCoin(symbol);
          break;
      }
    }

    // 거래소 필터 체크 (다중 선택 가능하므로 OR 로직)
    let exchangeMatch = activeExchangeFilters.length === 0; // 거래소 필터가 없으면 true
    if (activeExchangeFilters.length > 0) {
      exchangeMatch = activeExchangeFilters.some((filter) => {
        switch (filter) {
          case "binance":
            return isBinanceCoin(symbol);
          case "binance-alpha":
            return isBinanceAlphaCoin(symbol);
          case "upbit":
            return isUpbitCoin(symbol);
          case "upbit-usdt":
            return isUpbitUsdtCoin(symbol);
          default:
            return false;
        }
      });
    }

    // 블록체인 필터와 거래소 필터 모두 만족해야 함 (AND 로직)
    return blockchainMatch && exchangeMatch;
  };

  // 전체 코인 목록 가져오기 (최적화)
  useEffect(() => {
    const fetchAllCoins = async () => {
      try {
        // 캐시된 데이터가 있으면 먼저 사용
        const cachedData = sessionStorage.getItem("coinsList");
        const cacheTime = sessionStorage.getItem("coinsListTime");
        const now = Date.now();

        // 캐시가 1분 이내라면 사용
        if (cachedData && cacheTime && now - parseInt(cacheTime) < 60000) {
          const coinList = JSON.parse(cachedData);
          setAvailableCoins(coinList);
          return;
        }

        const response = await fetch(`/api/bithumb-proxy?_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("API 요청 실패");

        const data = await response.json();
        if (data.status === "0000" && data.data) {
          const coinList = Object.keys(data.data)
            .filter((symbol) => symbol !== "date") // date 필드 제외
            .map((symbol) => `${symbol}_KRW`);

          // 캐시에 저장
          sessionStorage.setItem("coinsList", JSON.stringify(coinList));
          sessionStorage.setItem("coinsListTime", now.toString());

          setAvailableCoins(coinList);
        }
      } catch (err) {
        console.error("코인 목록 가져오기 실패:", err);
        setError("코인 목록을 가져올 수 없습니다");
      }
    };

    fetchAllCoins();
  }, []);

  // REST API로 초기 데이터 가져오기 (WebSocket 대신)
  useEffect(() => {
    if (availableCoins.length === 0) return;

    const fetchAllCoinData = async () => {
      try {
        setError(null);
        const fetchStart = Date.now();
        const response = await fetch(`/api/bithumb-proxy?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const fetchEnd = Date.now();

        if (!response.ok) throw new Error("API 요청 실패");

        const result = await response.json();

        if (result.status === "0000" && result.data) {
          setUpdateCount((prev) => prev + 1);

          const newCoinData: { [key: string]: CoinData } = {};
          const newPriceChanges: { [key: string]: "up" | "down" | "same" } = {};
          const newRealTimeChanges: { [key: string]: string } = {};
          const newRealTimeChangePercents: { [key: string]: string } = {};
          let changeCount = 0;

          Object.keys(result.data).forEach((symbol) => {
            if (symbol === "date") return; // date 필드 제외

            const data = result.data[symbol];

            // API 응답 그대로 사용
            newCoinData[symbol] = data;

            // closing_price가 0이면 prev_closing_price 사용 (빗썸 12시 초기화 대응)
            const currentPrice =
              Number.parseFloat(data.closing_price) ||
              Number.parseFloat(data.prev_closing_price);
            const previousPrice = previousPrices[symbol];

            // 강제로 변화 감지하기 위해 더 민감한 비교
            const hasDataChanged =
              !previousPrice ||
              currentPrice !== Number.parseFloat(previousPrice) ||
              data.fluctate_24H !== (coinData[symbol]?.fluctate_24H || "") ||
              data.fluctate_rate_24H !==
                (coinData[symbol]?.fluctate_rate_24H || "");

            if (hasDataChanged) {
              // 가격 변동 상태 (이전 호출 대비)
              if (previousPrice) {
                const previous = Number.parseFloat(previousPrice);

                if (currentPrice > previous) {
                  newPriceChanges[symbol] = "up";
                  changeCount++;
                } else if (currentPrice < previous) {
                  newPriceChanges[symbol] = "down";
                  changeCount++;
                } else {
                  // 가격은 같지만 다른 데이터가 변했으면 깜빡임
                  newPriceChanges[symbol] = Math.random() > 0.5 ? "up" : "down";
                  changeCount++;
                }
              } else {
                newPriceChanges[symbol] = "up"; // 첫 로드는 상승으로 표시
                changeCount++;
              }
            } else {
              newPriceChanges[symbol] = "same";
            }

            // 12시 초기화 체크 (한국 시간 기준)
            const now = new Date();
            const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
            const currentHour = koreaTime.getHours();
            const currentMinute = koreaTime.getMinutes();

            // 자정 직후 5분간은 변동률을 0으로 강제 설정 (빗썸 초기화 시간 고려)
            const isAfterMidnight = currentHour === 0 && currentMinute < 5;

            // 실제 변동률 직접 계산 (빗썸 초기화 이슈 해결)
            const openingPrice =
              Number.parseFloat(data.opening_price) ||
              Number.parseFloat(data.prev_closing_price);
            const actualChange = currentPrice - openingPrice;
            const actualChangePercent =
              openingPrice > 0 ? (actualChange / openingPrice) * 100 : 0;

            if (
              isAfterMidnight ||
              (Number.parseFloat(data.opening_price) === 0 &&
                Number.parseFloat(data.closing_price) === 0)
            ) {
              // 자정 직후이거나 데이터가 초기화된 상태
              newRealTimeChanges[symbol] = "0";
              newRealTimeChangePercents[symbol] = "0.00";
            } else if (openingPrice > 0 && currentPrice > 0) {
              // 정상적인 데이터가 있을 때는 직접 계산한 값 사용
              newRealTimeChanges[symbol] = actualChange.toString();
              newRealTimeChangePercents[symbol] =
                actualChangePercent.toFixed(2);
            } else {
              // 계산할 수 없는 경우 API 값 사용
              newRealTimeChanges[symbol] = data.fluctate_24H || "0";
              newRealTimeChangePercents[symbol] =
                data.fluctate_rate_24H || "0.00";
            }
          });

          // 이전 가격 상태 업데이트
          const newPreviousPrices: { [key: string]: string } = {};
          Object.keys(newCoinData).forEach((symbol) => {
            const data = newCoinData[symbol];
            const currentPrice =
              Number.parseFloat(data.closing_price) ||
              Number.parseFloat(data.prev_closing_price);
            newPreviousPrices[symbol] = currentPrice.toString();
          });

          // 강제 리렌더링
          setForceUpdate((prev) => prev + 1);

          setCoinData(newCoinData);
          setPreviousPrices(newPreviousPrices);
          setPriceChanges(newPriceChanges);
          setRealTimeChanges(newRealTimeChanges);
          setRealTimeChangePercents(newRealTimeChangePercents);
          setLastUpdate(new Date());
          setLoading(false);

          // 2초 후 변동 표시 제거 (더 빠르게)
          setTimeout(() => {
            setPriceChanges((prev) => {
              const reset: { [key: string]: "up" | "down" | "same" } = {};
              Object.keys(prev).forEach((symbol) => {
                reset[symbol] = "same";
              });
              return reset;
            });
            setForceUpdate((prev) => prev + 1); // 초기화도 강제 렌더링
          }, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
        setLoading(false);
      }
    };

    // 초기 데이터 로드
    fetchAllCoinData();

    // 1초마다 업데이트
    const interval = setInterval(fetchAllCoinData, 1000);

    return () => clearInterval(interval);
  }, [availableCoins]);

  const formatPrice = (price: string) => {
    const num = Number.parseFloat(price);
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  // 현재가 표시용 함수 (0일 때 이전 종가 사용)
  const getCurrentPrice = (data: CoinData) => {
    return (
      Number.parseFloat(data.closing_price) ||
      Number.parseFloat(data.prev_closing_price)
    );
  };

  const formatVolume = (volume: string) => {
    const num = Number.parseFloat(volume);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(2);
  };

  const getChangeColor = (rate: string) => {
    const num = Number.parseFloat(rate);
    if (num > 0) return "text-green-600";
    if (num < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (rate: string) => {
    const num = Number.parseFloat(rate);
    if (num > 0) return <TrendingUp className="w-4 h-4" />;
    if (num < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const sortedCoins = Object.entries(coinData)
    .filter(([symbol]) => coinMatchesFilters(symbol))
    .sort(([symbolA, dataA], [symbolB, dataB]) => {
      const changeA = Number.parseFloat(
        realTimeChangePercents[symbolA] || dataA.fluctate_rate_24H || "0"
      );
      const changeB = Number.parseFloat(
        realTimeChangePercents[symbolB] || dataB.fluctate_rate_24H || "0"
      );
      return changeB - changeA;
    });

  const totalPages = Math.ceil(sortedCoins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoins = sortedCoins.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    const coinListElement = document.getElementById("coin-list");
    if (coinListElement) {
      coinListElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const getKoreanName = (symbol: string) => {
    try {
      // Dynamic import로 로드된 객체들을 안전하게 사용
      if (typeof CRYPTO_KOREAN_NAMES === "object" && CRYPTO_KOREAN_NAMES) {
        const koreanNames = CRYPTO_KOREAN_NAMES as any;
        if (koreanNames[symbol]) return koreanNames[symbol];
      }

      if (typeof FALLBACK_KOREAN_NAMES === "object" && FALLBACK_KOREAN_NAMES) {
        const fallbackNames = FALLBACK_KOREAN_NAMES as any;
        if (fallbackNames[symbol]) return fallbackNames[symbol];
      }

      return symbol;
    } catch (error) {
      console.warn("Error loading Korean names:", error);
      return symbol;
    }
  };

  const handleCoinClick = (symbol: string, data: CoinData) => {
    const koreanName = getKoreanName(symbol);
    const realTimeChange = realTimeChanges[symbol] || data.fluctate_24H || "0";
    const realTimeChangePercent =
      realTimeChangePercents[symbol] || data.fluctate_rate_24H || "0.00";

    setSelectedCoin({
      symbol,
      koreanName,
      price: formatPrice(getCurrentPrice(data).toString()),
      change: formatPrice(realTimeChange),
      changePercent: realTimeChangePercent,
    });
  };

  if (loading) {
    return <FullPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>연결 오류</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                새로고침
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BackButton />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate">
                실시간 암호화폐
              </h1>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                  }`}
                ></div>
                <p>
                  {lastUpdate &&
                    `업데이트: ${lastUpdate.toLocaleTimeString("ko-KR")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs">총 {sortedCoins.length}개</span>
                <span className="text-xs">
                  업데이트 #{updateCount} (렌더 #{forceUpdate})
                </span>
                <span className="text-xs">
                  {currentPage}/{totalPages}
                </span>
                {loading && (
                  <span className="text-xs text-yellow-600 animate-pulse">
                    업데이트 중...
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/sectors">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent px-2 py-1.5"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">섹터 분석</span>
                <span className="sm:hidden">섹터</span>
              </Button>
            </Link>
            <Link href="/chart-trading">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent px-2 py-1.5"
              >
                <TrendingUpIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">차트 트레이딩</span>
                <span className="sm:hidden">차트</span>
              </Button>
            </Link>
            <Button
              onClick={() => window.location.reload()}
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent px-2 py-1.5"
            >
              <RefreshCw
                className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">새로고침</span>
              <span className="sm:hidden">새로</span>
            </Button>
          </div>
        </div>

        <Card className="mb-3 sm:mb-4">
          <CardHeader className="pb-1 px-3 sm:px-6 pt-3">
            <CardTitle className="text-xs font-medium">범례</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 sm:px-6 pb-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                거래소
              </div>
              {ExchangeMarkersLegend ? (
                <div className="overflow-x-auto">
                  <ExchangeMarkersLegend />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">로딩 중...</div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                블록체인
              </div>
              {BlockchainMarkersLegend ? (
                <div className="overflow-x-auto">
                  <BlockchainMarkersLegend />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">로딩 중...</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 광고 - 범례 아래 */}
        <div className="mb-3 sm:mb-4">
          <ResponsiveAd />
        </div>

        {/* 워치리스트 */}
        <Watchlist
          className="mb-4 sm:mb-6"
          coinData={coinData}
          realTimeChangePercents={realTimeChangePercents}
          getKoreanName={getKoreanName}
          formatPrice={formatPrice}
        />

        {/* Web Vitals 모니터 */}
        <WebVitalsMonitor className="mb-4 sm:mb-6" />

        {/* 알트코인 시즌 지수 */}
        <AltcoinSeasonCard />

        {/* NASDAQ 지수 */}
        <NasdaqTradingView />

        {/* 바로가기 섹션 */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              바로가기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 워뇨띠 포지션 보러가기 */}
              <a
                href="https://www.binance.com/en/futures-activity/leaderboard/user/um?encryptedUid=14EA12E7412DC5A21DFF5E7EAC6013B9"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left justify-start hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      <TrendingUpIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">워뇨띠 포지션</div>
                      <div className="text-xs text-muted-foreground truncate">
                        바이낸스 선물 리더보드
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Button>
              </a>

              {/* 바이낸스 알파 거래소 */}
              <a
                href="https://www.binance.com/en/alpha/bsc/0xb994882a1b9bd98a71dd6ea5f61577c42848b0e8"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left justify-start hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">바이낸스 알파</div>
                      <div className="text-xs text-muted-foreground truncate">
                        알파 거래소 바로가기
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 거래소별 변동률 */}
        <ExchangeVolatility
          coinData={coinData}
          realTimeChangePercents={realTimeChangePercents}
          loading={loading}
        />

        {/* 광고 배너 */}
        <BannerAd className="my-6" />

        {/* 섹터 요약 */}
        <SectorsPreview
          coinData={coinData}
          realTimeChangePercents={realTimeChangePercents}
          loading={loading}
        />

        {/* 마커 필터 */}
        <Card className="mb-3 sm:mb-4">
          <CardHeader className="pb-1 px-3 sm:px-6 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" />
                마커 필터
              </CardTitle>
              {activeFilters.size > 0 && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                >
                  전체 보기
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 space-y-3">
            {/* 거래소 필터 */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                거래소
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={() => toggleFilter("binance")}
                  variant={activeFilters.has("binance") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 data-[state=on]:bg-orange-200"
                >
                  BN (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isBinanceCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("binance-alpha")}
                  variant={
                    activeFilters.has("binance-alpha") ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs h-7 px-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 data-[state=on]:bg-yellow-200"
                >
                  Alpha (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isBinanceAlphaCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("upbit")}
                  variant={activeFilters.has("upbit") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 data-[state=on]:bg-purple-200"
                >
                  UP (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isUpbitCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("upbit-usdt")}
                  variant={
                    activeFilters.has("upbit-usdt") ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs h-7 px-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 data-[state=on]:bg-blue-200"
                >
                  UPusdt (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isUpbitUsdtCoin(symbol)
                    ).length
                  }
                  )
                </Button>
              </div>
            </div>

            {/* 블록체인 필터 */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                블록체인
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={() => toggleFilter("ethereum")}
                  variant={
                    activeFilters.has("ethereum") ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs h-7 px-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 data-[state=on]:bg-blue-200"
                >
                  ETH (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isEthereumCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("solana")}
                  variant={activeFilters.has("solana") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 data-[state=on]:bg-purple-200"
                >
                  SOL (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isSolanaCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("bnb-chain")}
                  variant={
                    activeFilters.has("bnb-chain") ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs h-7 px-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 data-[state=on]:bg-yellow-200"
                >
                  BNB (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isBnbChainCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("bitcoin")}
                  variant={activeFilters.has("bitcoin") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 data-[state=on]:bg-orange-200"
                >
                  BTC (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isBitcoinCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("tron")}
                  variant={activeFilters.has("tron") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 data-[state=on]:bg-red-200"
                >
                  TRX (
                  {
                    Object.keys(coinData).filter((symbol) => isTronCoin(symbol))
                      .length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("base")}
                  variant={activeFilters.has("base") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 data-[state=on]:bg-cyan-200"
                >
                  BASE (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isBaseCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("avalanche")}
                  variant={
                    activeFilters.has("avalanche") ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs h-7 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 data-[state=on]:bg-red-200"
                >
                  AVAX (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isAvalancheCoin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("layer2")}
                  variant={activeFilters.has("layer2") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 data-[state=on]:bg-violet-200"
                >
                  L2 (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isLayer2Coin(symbol)
                    ).length
                  }
                  )
                </Button>
                <Button
                  onClick={() => toggleFilter("native")}
                  variant={activeFilters.has("native") ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 data-[state=on]:bg-green-200"
                >
                  Native (
                  {
                    Object.keys(coinData).filter((symbol) =>
                      isNativeCoin(symbol)
                    ).length
                  }
                  )
                </Button>
              </div>
            </div>

            {activeFilters.size > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {sortedCoins.length}개 코인 표시 중 (전체{" "}
                {Object.keys(coinData).length}개 중)
              </div>
            )}
          </CardContent>
        </Card>

        <div id="coin-list" className="space-y-6 mt-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>코인</TableHead>
                    <TableHead>섹터</TableHead>
                    <TableHead>마커</TableHead>
                    <TableHead className="text-right">현재가</TableHead>
                    <TableHead className="text-right">24시간 변동</TableHead>
                    <TableHead className="text-right">24시간 거래량</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCoins.map(([symbol, data], index) => {
                    const changeRate = Number.parseFloat(
                      data.fluctate_rate_24H
                    );
                    const isPositive = changeRate > 0;
                    const isNegative = changeRate < 0;
                    const koreanName = getKoreanName(symbol);
                    const sector = getCoinSector(symbol);
                    const sectorColorClass = getSectorColor(sector);
                    const globalIndex = startIndex + index + 1;

                    return (
                      <TableRow
                        key={symbol}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCoinClick(symbol, data)}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {globalIndex}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="font-semibold">{koreanName}</div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {symbol}
                              </div>
                            </div>
                            <WatchlistButton
                              symbol={symbol}
                              isInWatchlist={watchlist.includes(symbol)}
                              onToggle={toggleWatchlist}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${sectorColorClass}`}
                          >
                            {sector}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ExchangeMarkers ? (
                            <ExchangeMarkers
                              symbol={symbol}
                              showBlockchain={true}
                            />
                          ) : (
                            <div className="w-16 h-6 bg-gray-100 rounded animate-pulse"></div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className="font-semibold font-mono">
                              ₩{formatPrice(getCurrentPrice(data).toString())}
                            </div>
                            <div
                              className={`text-sm ${getChangeColor(
                                realTimeChanges[symbol] || "0"
                              )}`}
                            >
                              {Number.parseFloat(
                                realTimeChanges[symbol] || "0"
                              ) > 0
                                ? "+"
                                : ""}
                              ₩{formatPrice(realTimeChanges[symbol] || "0")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              Number.parseFloat(
                                realTimeChangePercents[symbol] || "0"
                              ) > 0
                                ? "default"
                                : Number.parseFloat(
                                    realTimeChangePercents[symbol] || "0"
                                  ) < 0
                                ? "destructive"
                                : "secondary"
                            }
                            className="flex items-center gap-1 w-fit ml-auto"
                          >
                            {getChangeIcon(
                              realTimeChangePercents[symbol] || "0"
                            )}
                            {Number.parseFloat(
                              realTimeChangePercents[symbol] || "0"
                            ) > 0
                              ? "+"
                              : ""}
                            {realTimeChangePercents[symbol] || "0.00"}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatVolume(data.units_traded_24H)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {currentCoins.map(([symbol, data], index) => {
              const changeRate = Number.parseFloat(
                realTimeChangePercents[symbol] || "0"
              );
              const isPositive = changeRate > 0;
              const isNegative = changeRate < 0;
              const koreanName = getKoreanName(symbol);
              const sector = getCoinSector(symbol);
              const sectorColorClass = getSectorColor(sector);
              const globalIndex = startIndex + index + 1;

              return (
                <Card
                  key={symbol}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => handleCoinClick(symbol, data)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs text-muted-foreground font-medium">
                            #{globalIndex}
                          </span>
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {koreanName}
                          </h3>
                          <WatchlistButton
                            symbol={symbol}
                            isInWatchlist={watchlist.includes(symbol)}
                            onToggle={toggleWatchlist}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {symbol}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0.5 ${sectorColorClass}`}
                          >
                            {sector}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          {ExchangeMarkers ? (
                            <ExchangeMarkers
                              symbol={symbol}
                              showBlockchain={true}
                            />
                          ) : (
                            <div className="w-16 h-6 bg-gray-100 rounded animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          isPositive
                            ? "default"
                            : isNegative
                            ? "destructive"
                            : "secondary"
                        }
                        className="flex items-center gap-1 shrink-0 text-xs px-2 py-1"
                      >
                        {getChangeIcon(realTimeChangePercents[symbol] || "0")}
                        {changeRate > 0 ? "+" : ""}
                        {realTimeChangePercents[symbol] || "0.00"}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 px-2">
            <Button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>

            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs shrink-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}

        {/* 하단 반응형 광고 */}
        <ResponsiveAd className="my-8" />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>1초마다 실시간 업데이트 • 빗썸 API 제공</p>
          <div className="mt-1">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span>
              {activeFilters.size > 0
                ? `${sortedCoins.length}개 코인 표시 중 (전체 ${
                    Object.keys(coinData).length
                  }개 중)`
                : `총 ${Object.keys(coinData).length}개 코인`}
            </span>
          </div>
        </div>

        {selectedCoin && CoinDetailModal && (
          <CoinDetailModal
            isOpen={!!selectedCoin}
            onClose={() => setSelectedCoin(null)}
            symbol={selectedCoin.symbol}
            koreanName={selectedCoin.koreanName}
            price={selectedCoin.price}
            change={selectedCoin.change}
            changePercent={selectedCoin.changePercent}
          />
        )}

        {/* Service Worker 등록 */}
        <ServiceWorkerRegistration />
      </div>
    </div>
  );
}
