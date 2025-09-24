import { Badge } from "@/components/ui/badge"
import { getBlockchainMarker, getBlockchainMarkerColor } from "@/lib/blockchain-info"

interface BlockchainMarkersProps {
  symbol: string
  className?: string
}

export function BlockchainMarkers({ symbol, className = "" }: BlockchainMarkersProps) {
  const marker = getBlockchainMarker(symbol)

  if (!marker) return null

  return (
    <Badge variant="outline" className={`text-xs px-1 py-0.5 ${getBlockchainMarkerColor(marker)} ${className}`}>
      {marker}
    </Badge>
  )
}

// 블록체인 마커 범례 컴포넌트
export function BlockchainMarkersLegend() {
  const markers = [
    { marker: "ETH", label: "이더리움" },
    { marker: "SOL", label: "솔라나" },
    { marker: "BNB", label: "BNB 체인" },
    { marker: "BTC", label: "비트코인" },
    { marker: "BASE", label: "Base" },
    { marker: "ARB", label: "Arbitrum" },
    { marker: "NATIVE", label: "자체 체인" },
    { marker: "L2", label: "레이어 2" },
  ]

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
      {markers.map(({ marker, label }) => (
        <div key={marker} className="flex items-center gap-1.5">
          <Badge variant="outline" className={`text-xs px-1 py-0.5 ${getBlockchainMarkerColor(marker)}`}>
            {marker}
          </Badge>
          <span className="truncate">{label}</span>
        </div>
      ))}
    </div>
  )
}
