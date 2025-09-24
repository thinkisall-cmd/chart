"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, BarChart3, Activity } from "lucide-react"
import Link from "next/link"
import { BannerAd, ResponsiveAd } from "@/components/adsense"
import PWAInstaller from "@/components/pwa-installer"
import ServiceWorkerRegistration from "@/components/service-worker-registration"

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

interface CoinData {
  opening_price: string
  closing_price: string
  min_price: string
  max_price: string
  units_traded: string
  acc_trade_value: string
  prev_closing_price: string
  units_traded_24H: string
  acc_trade_value_24H: string
  fluctate_24H: string
  fluctate_rate_24H: string
  date: string
}

interface BithumbResponse {
  status: string
  data: {
    [key: string]: CoinData
  }
}

export default function CryptoTracker() {
  const [coinData, setCoinData] = useState<{ [key: string]: CoinData }>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [selectedCoin, setSelectedCoin] = useState<{
    symbol: string
    koreanName: string
    price: string
    change: string
    changePercent: string
  } | null>(null)

  const fetchCoinData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/bithumb-proxy")

      if (!response.ok) {
        throw new Error("API 요청 실패")
      }

      const data: BithumbResponse = await response.json()

      if (data.status === "0000" && data.data) {
        const { date, ...coins } = data.data
        setCoinData(coins)
        setLastUpdate(new Date())
      } else {
        throw new Error("API 응답 오류")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoinData()

    const interval = setInterval(fetchCoinData, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: string) => {
    const num = Number.parseFloat(price)
    return new Intl.NumberFormat("ko-KR").format(num)
  }

  const formatVolume = (volume: string) => {
    const num = Number.parseFloat(volume)
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toFixed(2)
  }

  const getChangeColor = (rate: string) => {
    const num = Number.parseFloat(rate)
    if (num > 0) return "text-green-600"
    if (num < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getChangeIcon = (rate: string) => {
    const num = Number.parseFloat(rate)
    if (num > 0) return <TrendingUp className="w-4 h-4" />
    if (num < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  const sortedCoins = Object.entries(coinData).sort(
    ([, a], [, b]) => Number.parseFloat(b.fluctate_rate_24H) - Number.parseFloat(a.fluctate_rate_24H),
  )

  const totalPages = Math.ceil(sortedCoins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCoins = sortedCoins.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const getKoreanName = (symbol: string) => {
    try {
      // Dynamic import로 로드된 객체들을 안전하게 사용
      if (typeof CRYPTO_KOREAN_NAMES === 'object' && CRYPTO_KOREAN_NAMES) {
        const koreanNames = CRYPTO_KOREAN_NAMES as any;
        if (koreanNames[symbol]) return koreanNames[symbol];
      }
      
      if (typeof FALLBACK_KOREAN_NAMES === 'object' && FALLBACK_KOREAN_NAMES) {
        const fallbackNames = FALLBACK_KOREAN_NAMES as any;
        if (fallbackNames[symbol]) return fallbackNames[symbol];
      }
      
      return symbol;
    } catch (error) {
      console.warn('Error loading Korean names:', error);
      return symbol;
    }
  }

  const handleCoinClick = (symbol: string, data: CoinData) => {
    const koreanName = getKoreanName(symbol)
    setSelectedCoin({
      symbol,
      koreanName,
      price: formatPrice(data.closing_price),
      change: formatPrice(data.fluctate_24H),
      changePercent: data.fluctate_rate_24H,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
              <Button onClick={fetchCoinData} className="w-full">
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate">실시간 암호화폐</h1>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{lastUpdate && `업데이트: ${lastUpdate.toLocaleTimeString("ko-KR")}`}</p>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs">총 {sortedCoins.length}개</span>
                <span className="text-xs">
                  {currentPage}/{totalPages}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/sectors">
              <Button variant="outline" size="sm" className="text-xs bg-transparent px-2 py-1.5">
                <BarChart3 className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">섹터 분석</span>
                <span className="sm:hidden">섹터</span>
              </Button>
            </Link>
            <Button
              onClick={fetchCoinData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent px-2 py-1.5"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
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
              <div className="text-xs font-medium text-muted-foreground mb-1.5">거래소</div>
              {ExchangeMarkersLegend ? (
                <div className="overflow-x-auto">
                  <ExchangeMarkersLegend />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">로딩 중...</div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">블록체인</div>
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

        {/* 광고 배너 */}
        <BannerAd className="my-6" />

        <div className="space-y-6">
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
                    const changeRate = Number.parseFloat(data.fluctate_rate_24H)
                    const isPositive = changeRate > 0
                    const isNegative = changeRate < 0
                    const koreanName = getKoreanName(symbol)
                    const sector = getCoinSector(symbol)
                    const sectorColorClass = getSectorColor(sector)
                    const globalIndex = startIndex + index + 1

                    return (
                      <TableRow
                        key={symbol}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCoinClick(symbol, data)}
                      >
                        <TableCell className="font-medium text-muted-foreground">{globalIndex}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold">{koreanName}</div>
                            <div className="text-sm text-muted-foreground font-mono">{symbol}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${sectorColorClass}`}>
                            {sector}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ExchangeMarkers ? (
                            <ExchangeMarkers symbol={symbol} showBlockchain={true} />
                          ) : (
                            <div className="w-16 h-6 bg-gray-100 rounded animate-pulse"></div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className="font-semibold font-mono">₩{formatPrice(data.closing_price)}</div>
                            <div className={`text-sm ${getChangeColor(data.fluctate_24H)}`}>
                              {Number.parseFloat(data.fluctate_24H) > 0 ? "+" : ""}₩{formatPrice(data.fluctate_24H)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
                            className="flex items-center gap-1 w-fit ml-auto"
                          >
                            {getChangeIcon(data.fluctate_rate_24H)}
                            {changeRate > 0 ? "+" : ""}
                            {changeRate.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatVolume(data.units_traded_24H)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {currentCoins.map(([symbol, data], index) => {
              const changeRate = Number.parseFloat(data.fluctate_rate_24H)
              const isPositive = changeRate > 0
              const isNegative = changeRate < 0
              const koreanName = getKoreanName(symbol)
              const sector = getCoinSector(symbol)
              const sectorColorClass = getSectorColor(sector)
              const globalIndex = startIndex + index + 1

              return (
                <Card
                  key={symbol}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => handleCoinClick(symbol, data)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs text-muted-foreground font-medium">#{globalIndex}</span>
                          <h3 className="font-semibold text-sm sm:text-base truncate">{koreanName}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs text-muted-foreground font-mono">{symbol}</span>
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${sectorColorClass}`}>
                            {sector}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          {ExchangeMarkers ? (
                            <ExchangeMarkers symbol={symbol} showBlockchain={true} />
                          ) : (
                            <div className="w-16 h-6 bg-gray-100 rounded animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
                        className="flex items-center gap-1 shrink-0 text-xs px-2 py-1"
                      >
                        {getChangeIcon(data.fluctate_rate_24H)}
                        {changeRate > 0 ? "+" : ""}
                        {changeRate.toFixed(2)}%
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">현재가</span>
                        <span className="font-semibold font-mono text-sm">₩{formatPrice(data.closing_price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">24시간 변동</span>
                        <span className={`text-xs font-medium ${getChangeColor(data.fluctate_24H)}`}>
                          {Number.parseFloat(data.fluctate_24H) > 0 ? "+" : ""}₩{formatPrice(data.fluctate_24H)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">거래량</span>
                        <span className="text-xs font-mono">{formatVolume(data.units_traded_24H)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 px-2">
            <Button onClick={goToPrevPage} disabled={currentPage === 1} variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>

            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
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
                )
              })}
            </div>

            <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}

        {/* 하단 반응형 광고 */}
        <ResponsiveAd className="my-8" />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>데이터는 1초마다 자동으로 업데이트됩니다 • 빗썸 API 제공</p>
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

        {/* PWA 설치 배너 */}
        <PWAInstaller />
        
        {/* Service Worker 등록 */}
        <ServiceWorkerRegistration />
      </div>
    </div>
  )
}
