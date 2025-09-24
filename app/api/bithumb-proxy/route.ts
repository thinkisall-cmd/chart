import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://api.bithumb.com/public/ticker/ALL_KRW", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; CryptoTracker/1.0)",
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
        // 30초 캐시
        "Cache-Control": "public, max-age=30",
      },
    })
  } catch (error) {
    console.error("Bithumb API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data from Bithumb API" }, { status: 500 })
  }
}
