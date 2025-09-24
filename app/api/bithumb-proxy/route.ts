import { NextResponse } from "next/server"

// 이 API 라우트를 동적으로 설정 (정적 빌드 시 실행되지 않도록)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`https://api.bithumb.com/public/ticker/ALL_KRW?_t=${timestamp}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; CryptoTracker/1.0)",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      // 캐시 비활성화로 최신 데이터 보장
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        // 캐시 완전 비활성화
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("Bithumb API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data from Bithumb API" }, { status: 500 })
  }
}
