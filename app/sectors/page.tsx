"use client"

import { useState, useEffect } from "react"
import { useBithumbWebSocket } from "@/hooks/useBithumbWebSocket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, Users, ChevronRight, Activity } from "lucide-react"
import { groupCoinsBySector, calculateSectorStatsWithRealTime, MAIN_SECTORS } from "@/lib/crypto-sectors"
import { useRouter } from "next/navigation"
import { BannerAd, SquareAd } from "@/components/adsense"
import { BackButton } from "@/components/back-button"

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

type SortType = "avgChange" | "count" | "volume" | "positive"
export default function SectorOverview() {
  const [coinData, setCoinData] = useState<{ [key: string]: CoinData }>({})
  const [previousPrices, setPreviousPrices] = useState<{ [key: string]: string }>({})
  const [priceChanges, setPriceChanges] = useState<{ [key: string]: 'up' | 'down' | 'same' }>({})
  const [realTimeChanges, setRealTimeChanges] = useState<{ [key: string]: string }>({})
  const [realTimeChangePercents, setRealTimeChangePercents] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortType>("avgChange")
  const router = useRouter()

  const fetchCoinData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/bithumb-proxy")
      if (!response.ok) throw new Error("API 요청 실패")
      
      const data: BithumbResponse = await response.json()
      if (data.status === "0000" && data.data) {
        const newData = data.data
        
        // 이전 가격과 비교하여 변동 상태 계산 및 당일 시가 대비 실시간 변동 계산
        const newPriceChanges: { [key: string]: 'up' | 'down' | 'same' } = {}
        const newRealTimeChanges: { [key: string]: string } = {}
        const newRealTimeChangePercents: { [key: string]: string } = {}
        
        Object.keys(newData).forEach(symbol => {
          if (symbol === "date") return; // date 필드 제외

          const data = newData[symbol];

          // closing_price가 0이면 prev_closing_price 사용 (빗썸 12시 초기화 대응)
          const currentPrice = Number.parseFloat(data.closing_price) || Number.parseFloat(data.prev_closing_price);
          const previousPrice = previousPrices[symbol];

          // 강제로 변화 감지하기 위해 더 민감한 비교
          const hasDataChanged =
            !previousPrice ||
            currentPrice !== Number.parseFloat(previousPrice) ||
            data.fluctate_24H !== (coinData[symbol]?.fluctate_24H || "") ||
            data.fluctate_rate_24H !== (coinData[symbol]?.fluctate_rate_24H || "");

          if (hasDataChanged) {
            // 가격 변동 상태 (이전 호출 대비)
            if (previousPrice) {
              const previous = Number.parseFloat(previousPrice);

              if (currentPrice > previous) {
                newPriceChanges[symbol] = "up";
              } else if (currentPrice < previous) {
                newPriceChanges[symbol] = "down";
              } else {
                // 가격은 같지만 다른 데이터가 변했으면 깜빡임
                newPriceChanges[symbol] = Math.random() > 0.5 ? "up" : "down";
              }
            } else {
              newPriceChanges[symbol] = "up"; // 첫 로드는 상승으로 표시
            }
          } else {
            newPriceChanges[symbol] = "same";
          }

          // 12시 초기화 체크 (한국 시간 기준)
          const now = new Date();
          const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
          const currentHour = koreaTime.getHours();
          const currentMinute = koreaTime.getMinutes();

          // 자정 직후 5분간은 변동률을 0으로 강제 설정 (빗썸 초기화 시간 고려)
          const isAfterMidnight = currentHour === 0 && currentMinute < 5;

          // 실제 변동률 직접 계산 (빗썸 초기화 이슈 해결)
          const openingPrice = Number.parseFloat(data.opening_price) || Number.parseFloat(data.prev_closing_price);
          const actualChange = currentPrice - openingPrice;
          const actualChangePercent = openingPrice > 0 ? ((actualChange / openingPrice) * 100) : 0;

          if (isAfterMidnight || (Number.parseFloat(data.opening_price) === 0 && Number.parseFloat(data.closing_price) === 0)) {
            // 자정 직후이거나 데이터가 초기화된 상태
            newRealTimeChanges[symbol] = "0";
            newRealTimeChangePercents[symbol] = "0.00";
          } else if (openingPrice > 0 && currentPrice > 0) {
            // 정상적인 데이터가 있을 때는 직접 계산한 값 사용
            newRealTimeChanges[symbol] = actualChange.toString();
            newRealTimeChangePercents[symbol] = actualChangePercent.toFixed(2);
          } else {
            // 계산할 수 없는 경우 API 값 사용
            newRealTimeChanges[symbol] = data.fluctate_24H || "0";
            newRealTimeChangePercents[symbol] = data.fluctate_rate_24H || "0.00";
          }
        })
        
        // 이전 가격 상태 업데이트
        const newPreviousPrices: { [key: string]: string } = {}
        Object.keys(newData).forEach(symbol => {
          if (symbol === "date") return; // date 필드 제외
          const data = newData[symbol];
          const currentPrice = Number.parseFloat(data.closing_price) || Number.parseFloat(data.prev_closing_price);
          newPreviousPrices[symbol] = currentPrice.toString();
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toFixed(2)
  }

  const getChangeIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4" />
    if (rate < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  const handleSectorClick = (sector: string) => {
    router.push(`/sectors/${encodeURIComponent(sector)}`)
  }

  const sectorGroups = groupCoinsBySector(coinData)
  const sectorStats = calculateSectorStatsWithRealTime(sectorGroups, realTimeChangePercents)
  
  const sortedSectors = Object.entries(sectorStats).sort(([sectorA, a], [sectorB, b]) => {
    const isMainSectorA = MAIN_SECTORS.includes(sectorA)
    const isMainSectorB = MAIN_SECTORS.includes(sectorB)
    if (isMainSectorA && !isMainSectorB) return -1
    if (!isMainSectorA && isMainSectorB) return 1

    switch (sortBy) {
      case "avgChange": return b.avgChange - a.avgChange
      case "count": return b.count - a.count
      case "volume": return b.totalVolume - a.totalVolume
      case "positive": return b.positiveCount - a.positiveCount
      default: return b.avgChange - a.avgChange
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-full" /></CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>연결 오류</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchCoinData} className="w-full">다시 시도</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h1 className="text-base sm:text-lg lg:text-xl font-bold">섹터 분석</h1>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>{lastUpdate && `업데이트: ${lastUpdate.toLocaleTimeString("ko-KR")}`}</p>
              <p>{Object.keys(sectorGroups).length}개 섹터 • {Object.keys(coinData).length}개 코인</p>
            </div>
          </div>
          <Button onClick={fetchCoinData} disabled={loading} variant="outline" size="sm" className="text-xs h-8 px-2 sm:px-3 shrink-0">
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            <span>새로</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
          {[
            { key: "avgChange", icon: TrendingUp, label: "수익률" },
            { key: "count", icon: Users, label: "개수" },
            { key: "volume", icon: BarChart3, label: "거래량" },
            { key: "positive", icon: Activity, label: "상승" }
          ].map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              onClick={() => setSortBy(key as SortType)}
              variant={sortBy === key ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-1.5 h-7"
            >
              <Icon className="w-3 h-3 mr-1" />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        <BannerAd className="my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          {sortedSectors.map(([sector, stats]) => {
            const isMainSector = MAIN_SECTORS.includes(sector)
            return (
              <Card
                key={sector}
                className={`cursor-pointer hover:shadow-sm active:scale-[0.98] transition-all duration-200 ${isMainSector ? "ring-1 ring-primary/20" : ""}`}
                onClick={() => handleSectorClick(sector)}
              >
                <CardHeader className="pb-2 px-3 sm:px-6 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base truncate">{sector}</CardTitle>
                      {isMainSector && <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shrink-0">주요</Badge>}
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 sm:space-y-3 px-3 sm:px-6 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">평균 수익률</span>
                    <Badge
                      variant={stats.avgChange > 0 ? "default" : stats.avgChange < 0 ? "destructive" : "secondary"}
                      className="flex items-center gap-0.5 text-xs px-1.5 py-0.5"
                    >
                      {getChangeIcon(stats.avgChange)}
                      {stats.avgChange > 0 ? "+" : ""}{stats.avgChange.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center">
                    <div className="p-1.5 bg-muted/50 rounded">
                      <div className="font-semibold text-xs sm:text-sm">{stats.count}</div>
                      <div className="text-xs text-muted-foreground">총</div>
                    </div>
                    <div className="p-1.5 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="font-semibold text-green-600 text-xs sm:text-sm">{stats.positiveCount}</div>
                      <div className="text-xs text-muted-foreground">상승</div>
                    </div>
                    <div className="p-1.5 bg-red-50 dark:bg-red-950/20 rounded">
                      <div className="font-semibold text-red-600 text-xs sm:text-sm">{stats.negativeCount}</div>
                      <div className="text-xs text-muted-foreground">하락</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">거래량</span>
                      <span className="font-medium">{formatVolume(stats.totalVolume)}</span>
                    </div>
                    {stats.topGainer && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">최고 상승</span>
                        <span className="text-green-600 font-medium">
                          {stats.topGainer.symbol} +{stats.topGainer.change.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <SquareAd className="my-8" />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>섹터를 클릭하면 해당 섹터의 코인 목록을 볼 수 있습니다</p>
        </div>
      </div>
    </div>
  )
}
