import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { coinDescriptions, blockchainInfo } from "@/lib/blockchain-info"
import { getCoinSector, getSectorColor } from "@/lib/crypto-sectors"
import { ExchangeMarkers } from "./exchange-markers"
import { BlockchainMarkers } from "./blockchain-markers"

interface CoinDetailModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: string
  koreanName: string
  price: string
  change: string
  changePercent: string
}

export function CoinDetailModal({
  isOpen,
  onClose,
  symbol,
  koreanName,
  price,
  change,
  changePercent,
}: CoinDetailModalProps) {
  const description = coinDescriptions[symbol]
  const blockchain = blockchainInfo[symbol]
  const sector = getCoinSector(symbol)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div>
              <div className="text-xl font-bold">{koreanName}</div>
              <div className="text-sm text-muted-foreground">{symbol}</div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <ExchangeMarkers symbol={symbol} />
              <BlockchainMarkers symbol={symbol} />
            </div>
          </DialogTitle>
          <DialogDescription>
            {symbol} 코인의 상세 정보와 현재 시세를 확인하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 가격 정보 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">현재가</div>
              <div className="text-lg font-semibold">{price}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">변동가</div>
              <div
                className={`text-lg font-semibold ${Number.parseFloat(change) >= 0 ? "text-red-600" : "text-blue-600"}`}
              >
                {change}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">변동률</div>
              <div
                className={`text-lg font-semibold ${Number.parseFloat(changePercent) >= 0 ? "text-red-600" : "text-blue-600"}`}
              >
                {changePercent}%
              </div>
            </div>
          </div>

          {/* 섹터 정보 */}
          {sector && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">섹터</div>
              <Badge variant="outline" className={`text-sm px-3 py-1 ${getSectorColor(sector)}`}>
                {sector}
              </Badge>
            </div>
          )}

          {/* 블록체인 정보 */}
          {blockchain && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">기반 블록체인</div>
              <div className="text-sm bg-muted/50 p-3 rounded-lg">{blockchain}</div>
            </div>
          )}

          {/* 프로젝트 설명 */}
          {description && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">프로젝트 설명</div>
              <div className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">{description}</div>
            </div>
          )}

          {/* 정보가 없는 경우 */}
          {!description && !blockchain && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">해당 코인에 대한 상세 정보가 없습니다.</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
