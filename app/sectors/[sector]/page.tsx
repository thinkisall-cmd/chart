"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react"
import {
  groupCoinsBySector,
  calculateSectorStats,
  MAIN_SECTORS,
  getCoinSector,
  getSectorColor,
} from "@/lib/crypto-sectors"
import { CRYPTO_KOREAN_NAMES, FALLBACK_KOREAN_NAMES } from "@/lib/crypto-korean-names"
import { ExchangeMarkers, ExchangeMarkersLegend } from "@/components/exchange-markers"
import { BlockchainMarkersLegend } from "@/components/blockchain-markers"
import { CoinDetailModal } from "@/components/coin-detail-modal"
import { useRouter, useParams } from "next/navigation"

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

export default function SectorDetail() {
  const [coinData, setCoinData] = useState<{ [key: string]: CoinData }>({})
  const [previousPrices, setPreviousPrices] = useState<{ [key: string]: string }>({})
  const [priceChanges, setPriceChanges] = useState<{ [key: string]: 'up' | 'down' | 'same' }>({})
  const [realTimeChanges, setRealTimeChanges] = useState<{ [key: string]: string }>({})
  const [realTimeChangePercents, setRealTimeChangePercents] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const coinsPerPage = 20

  const router = useRouter()
  const params = useParams()
  const sectorName = decodeURIComponent(params.sector as string)

  const fetchCoinData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/bithumb-proxy")

      if (!response.ok) {
        throw new Error("API 요청 실패")
      }

      const data: BithumbResponse = await response.json()

      if (data.status === "0000" && data.data) {
        const newData = data.data
        
        // 이전 가격과 비교하여 변동 상태 계산 및 당일 시가 대비 실시간 변동 계산
        const newPriceChanges: { [key: string]: 'up' | 'down' | 'same' } = {}
        const newRealTimeChanges: { [key: string]: string } = {}
        const newRealTimeChangePercents: { [key: string]: string } = {}
        
        Object.keys(newData).forEach(symbol => {
          const currentPrice = Number.parseFloat(newData[symbol].closing_price)
          const openingPrice = Number.parseFloat(newData[symbol].opening_price)
          const previousPrice = previousPrices[symbol]
          
          // 가격 변동 상태 (이전 API 호출 대비)
          if (previousPrice) {
            const previous = Number.parseFloat(previousPrice)
            
            if (currentPrice > previous) {
              newPriceChanges[symbol] = 'up'
            } else if (currentPrice < previous) {
              newPriceChanges[symbol] = 'down'
            } else {
              newPriceChanges[symbol] = 'same'
            }
          } else {
            newPriceChanges[symbol] = 'same'
          }
          
          // 당일 시가 대비 실시간 변동량 및 변동률 계산
          const dailyChange = currentPrice - openingPrice
          const dailyChangePercent = openingPrice !== 0 ? (dailyChange / openingPrice) * 100 : 0
          
          newRealTimeChanges[symbol] = dailyChange.toFixed(0)
          newRealTimeChangePercents[symbol] = dailyChangePercent.toFixed(2)
        })
        
        // 이전 가격 상태 업데이트
        const newPreviousPrices: { [key: string]: string } = {}
        Object.keys(newData).forEach(symbol => {
          newPreviousPrices[symbol] = newData[symbol].closing_price
        })
        
        setCoinData(newData)
        setPreviousPrices(newPreviousPrices)
        setPriceChanges(newPriceChanges)
        setRealTimeChanges(newRealTimeChanges)
        setRealTimeChangePercents(newRealTimeChangePercents)
        setLastUpdate(new Date())
        
        // 3초 후 변동 표시 제거
        setTimeout(() => {
          setPriceChanges(prev => {
            const reset: { [key: string]: 'up' | 'down' | 'same' } = {}
            Object.keys(prev).forEach(symbol => {
              reset[symbol] = 'same'
            })
            return reset
          })
        }, 3000)
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toFixed(2)
  }

  const getChangeIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4" />
    if (rate < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  const getKoreanName = (symbol: string) => {
    return CRYPTO_KOREAN_NAMES[symbol] || FALLBACK_KOREAN_NAMES[symbol] || symbol
  }

  const sectorGroups = groupCoinsBySector(coinData)
  const sectorStats = calculateSectorStats(sectorGroups)
  const sectorCoins = sectorGroups[sectorName] || []
  const sectorStat = sectorStats[sectorName]

  // Sort coins by change rate (highest first)
  const sortedCoins = sectorCoins.sort(
    (a, b) => Number.parseFloat(b.data.fluctate_rate_24H) - Number.parseFloat(a.data.fluctate_rate_24H),
  )

  // Pagination
  const totalPages = Math.ceil(sortedCoins.length / coinsPerPage)
  const startIndex = (currentPage - 1) * coinsPerPage
  const endIndex = startIndex + coinsPerPage
  const currentCoins = sortedCoins.slice(startIndex, endIndex)

  const isMainSector = MAIN_SECTORS.includes(sectorName)

  const [selectedCoin, setSelectedCoin] = useState<{
    symbol: string
    koreanName: string
    price: string
    change: string
    changePercent: string
  } | null>(null)

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
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-lg">코인 데이터를 불러오는 중...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-red-600 text-lg">오류: {error}</div>
            <Button onClick={fetchCoinData}>다시 시도</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!sectorStat) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-lg">섹터를 찾을 수 없습니다: {sectorName}</div>
            <Button onClick={() => router.push("/sectors")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              섹터 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <Button
              onClick={() => router.push("/sectors")}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs shrink-0"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">섹터 목록</span>
              <span className="sm:hidden">목록</span>
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-balance truncate">{sectorName}</h1>
                {isMainSector && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 shrink-0">
                    주요
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {lastUpdate && `업데이트: ${lastUpdate.toLocaleTimeString("ko-KR")}`}
              </p>
            </div>
          </div>
          <Button
            onClick={fetchCoinData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-xs shrink-0 bg-transparent"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">새로고침</span>
            <span className="sm:hidden">새로</span>
          </Button>
        </div>

        {/* Legend */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="text-xs font-medium mb-2">범례</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">거래소</div>
                <ExchangeMarkersLegend />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">블록체인</div>
                <BlockchainMarkersLegend />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sector Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold">{sectorStat.count}</div>
              <div className="text-xs text-muted-foreground">총 코인</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div
                className={`text-lg sm:text-xl font-bold flex items-center justify-center gap-1 ${
                  sectorStat.avgChange > 0
                    ? "text-green-600"
                    : sectorStat.avgChange < 0
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {getChangeIcon(sectorStat.avgChange)}
                {sectorStat.avgChange > 0 ? "+" : ""}
                {sectorStat.avgChange.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">평균 수익률</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600">{sectorStat.positiveCount}</div>
              <div className="text-xs text-muted-foreground">상승 코인</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-600">{sectorStat.negativeCount}</div>
              <div className="text-xs text-muted-foreground">하락 코인</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold">{formatVolume(sectorStat.totalVolume)}</div>
              <div className="text-xs text-muted-foreground">총 거래량</div>
            </CardContent>
          </Card>
        </div>

        {/* Coins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
          {currentCoins.map(({ symbol, data }) => {
            const changeRate = Number.parseFloat(data.fluctate_rate_24H)
            const volume = Number.parseFloat(data.acc_trade_value_24H)
            const sector = getCoinSector(symbol)
            const sectorColorClass = getSectorColor(sector)

            return (
              <Card
                key={symbol}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCoinClick(symbol, data)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="font-semibold text-sm truncate">{getKoreanName(symbol)}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{symbol}</div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${sectorColorClass}`}>
                          {sector}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <ExchangeMarkers symbol={symbol} showBlockchain={true} />
                      </div>
                    </div>
                    <Badge
                      variant={changeRate > 0 ? "default" : changeRate < 0 ? "destructive" : "secondary"}
                      className="flex items-center gap-1 shrink-0 text-xs px-2 py-1"
                    >
                      {getChangeIcon(changeRate)}
                      {changeRate > 0 ? "+" : ""}
                      {changeRate.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-bold">₩{formatPrice(data.closing_price)}</div>
                    <div className="text-xs text-muted-foreground">거래량: {formatVolume(volume)}</div>
                    <div className="text-xs text-muted-foreground">고가: ₩{formatPrice(data.max_price)}</div>
                    <div className="text-xs text-muted-foreground">저가: ₩{formatPrice(data.min_price)}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-6">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              이전
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
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
                    onClick={() => setCurrentPage(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              다음
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>
            {startIndex + 1}-{Math.min(endIndex, sortedCoins.length)} / {sortedCoins.length}개 코인 표시
          </p>
          <p>수익률 순으로 정렬되며, 데이터는 1초마다 자동으로 업데이트됩니다.</p>
        </div>

        {selectedCoin && (
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
      </div>
    </div>
  )
}
