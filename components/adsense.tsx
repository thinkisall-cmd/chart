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
// 프로덕션에서는 항상 활성화, 개발에서는 환경변수 확인
const ADSENSE_ENABLED = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true"


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

    // 광고를 로드하는 함수
    const loadAd = () => {
      try {
        // AdSense 스크립트가 로드되었는지 확인
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } else {
          // 스크립트가 로드되지 않았으면 잠시 후 재시도
          setTimeout(loadAd, 500)
        }
      } catch (error) {
        console.error('AdSense error:', error)
        // 에러 발생 시 재시도
        setTimeout(loadAd, 1000)
      }
    }

    // Intersection Observer를 사용해 광고가 화면에 보일 때만 로드
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 광고가 화면에 보이면 즉시 로드
            setTimeout(loadAd, 100)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    // 현재 광고 요소를 관찰
    const adElement = document.querySelector(`[data-ad-slot="${adSlot}"]`)
    if (adElement) {
      observer.observe(adElement)
    } else {
      // 요소를 찾지 못했으면 짧은 지연 후 로드
      setTimeout(loadAd, 300)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // ADSENSE_ENABLED가 false인 경우에만 플레이스홀더 표시
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

// 반응형 광고 (추천) - 로딩 상태 개선
export function ResponsiveAd({ className }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      {/* 광고 로딩 중일 때 placeholder */}
      <div className="relative">
        <div className="absolute inset-0 bg-gray-50 animate-pulse rounded flex items-center justify-center min-h-[100px]">
          <div className="text-xs text-gray-400">광고 로딩 중...</div>
        </div>
        <AdSense
          adSlot="6449748843" // 반응형 광고 슬롯
          adFormat="auto"
          className="w-full relative z-10"
          style={{
            display: "block",
            minHeight: "100px",
            backgroundColor: "transparent"
          }}
        />
      </div>
    </div>
  )
}
