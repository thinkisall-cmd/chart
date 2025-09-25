"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp, TrendingDown, ChevronRight, Activity } from "lucide-react"
import { groupCoinsBySector, calculateSectorStats, MAIN_SECTORS, getSectorColor } from "@/lib/crypto-sectors"
import Link from "next/link"

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

interface SectorsPreviewProps {
  coinData: { [key: string]: CoinData }
  realTimeChangePercents: { [key: string]: string }
  loading?: boolean
}

export default function SectorsPreview({ coinData, realTimeChangePercents, loading = false }: SectorsPreviewProps) {
  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toFixed(2)
  }

  const getChangeIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-3 h-3" />
    if (rate < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  if (loading || Object.keys(coinData).length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              섹터 요약
            </CardTitle>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-2 sm:p-3 bg-muted/30 rounded-lg">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 실시간 변동률을 반영한 코인 데이터 생성
  const enhancedCoinData: { [key: string]: CoinData } = {}
  Object.entries(coinData).forEach(([symbol, data]) => {
    enhancedCoinData[symbol] = {
      ...data,
      fluctate_rate_24H: realTimeChangePercents[symbol] || data.fluctate_rate_24H
    }
  })

  const sectorGroups = groupCoinsBySector(enhancedCoinData)
  const sectorStats = calculateSectorStats(sectorGroups)

  // 주요 섹터만 필터링하고 평균 수익률 순으로 정렬
  const mainSectorStats = Object.entries(sectorStats)
    .filter(([sector]) => MAIN_SECTORS.includes(sector))
    .sort(([, a], [, b]) => b.avgChange - a.avgChange)
    .slice(0, 8) // 상위 8개 섹터만 표시

  return (
    <Card>
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            섹터 요약
          </CardTitle>
          <Link href="/sectors">
            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-6">
              전체 보기
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {mainSectorStats.map(([sector, stats]) => {
            const sectorColorClass = getSectorColor(sector)
            return (
              <Link key={sector} href={`/sectors/${encodeURIComponent(sector)}`}>
                <div className="p-2 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge
                      variant="outline"
                      className={`text-xs px-1.5 py-0.5 ${sectorColorClass} group-hover:shadow-sm`}
                    >
                      {sector}
                    </Badge>
                    <Badge
                      variant={stats.avgChange > 0 ? "default" : stats.avgChange < 0 ? "destructive" : "secondary"}
                      className="flex items-center gap-0.5 text-xs px-1 py-0.5"
                    >
                      {getChangeIcon(stats.avgChange)}
                      {stats.avgChange > 0 ? "+" : ""}{stats.avgChange.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">코인</span>
                      <div className="flex items-center gap-1">
                        <span className="text-green-600 font-medium">{stats.positiveCount}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">거래량</span>
                      <span className="font-medium">{formatVolume(stats.totalVolume)}</span>
                    </div>
                    {stats.topGainer && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">최고</span>
                        <span className="text-green-600 font-medium text-xs truncate max-w-16">
                          {stats.topGainer.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-3 pt-2 border-t text-center">
          <p className="text-xs text-muted-foreground">
            총 {Object.keys(sectorStats).length}개 섹터 • 상위 8개 주요 섹터 표시
          </p>
        </div>
      </CardContent>
    </Card>
  )
}