// Cloudflare Pages Functions API
export async function onRequest(context: any) {
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
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        // 캐시 완전 비활성화
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Bithumb API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from Bithumb API" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  }
}