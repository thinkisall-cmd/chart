"use client"

import { useEffect } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: string
  adLayout?: string
  adLayoutKey?: string
  className?: string
  style?: React.CSSProperties
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3000971739024587"
const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true"

// 디버깅을 위한 로그
console.log('ADSENSE_CLIENT_ID:', ADSENSE_CLIENT_ID)
console.log('ADSENSE_ENABLED:', ADSENSE_ENABLED)
console.log('NEXT_PUBLIC_ADSENSE_ENABLED:', process.env.NEXT_PUBLIC_ADSENSE_ENABLED)

export default function AdSense({
  adSlot,
  adFormat = "auto",
  adLayout,
  adLayoutKey,
  className = "",
  style = { display: "block" }
}: AdSenseProps) {
  useEffect(() => {
    if (!ADSENSE_ENABLED) return
    
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // 개발 환경에서 AdSense가 비활성화된 경우 플레이스홀더 표시
  if (!ADSENSE_ENABLED) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 mx-auto max-w-full ${className}`}
        style={{ minHeight: '60px', maxWidth: '100vw', ...style }}
      >
        <div className="text-center px-2">
          <div className="text-xs font-medium">광고 영역</div>
          <div className="text-xs opacity-70">AdSense ID: {adSlot}</div>
        </div>
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-ad-layout={adLayout}
      data-ad-layout-key={adLayoutKey}
      data-full-width-responsive="true"
    />
  )
}

// 미리 정의된 광고 슬롯들
export function BannerAd({ className }: { className?: string }) {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <AdSense
        adSlot="4888258657" // 배너 광고 슬롯
        adFormat="auto"
        className="w-full max-w-4xl"
        style={{ display: "block", minHeight: "90px" }}
      />
    </div>
  )
}

export function SquareAd({ className }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <AdSense
        adSlot="2688496950" // 사각형 광고 슬롯
        adFormat="auto"
        className="w-80 h-80"
        style={{ display: "block", width: "300px", height: "300px" }}
      />
    </div>
  )
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <div className={`${className}`}>
      <AdSense
        adSlot="9663590188" // 사이드바 광고 슬롯
        adFormat="auto"
        className="w-full"
        style={{ display: "block", width: "300px", height: "600px" }}
      />
    </div>
  )
}

// 반응형 광고 (추천)
export function ResponsiveAd({ className }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <AdSense
        adSlot="6449748843" // 반응형 광고 슬롯
        adFormat="auto"
        className="w-full"
        style={{ display: "block" }}
      />
    </div>
  )
}
