import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true',
      {
        headers: {
          'User-Agent': 'NextChart2/1.0'
        },
        next: { revalidate: 30 } // 30초 캐싱
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        price: data.bitcoin?.usd || 0,
        change_24h: data.bitcoin?.usd_24h_change || 0,
        last_updated: data.bitcoin?.last_updated_at || Math.floor(Date.now() / 1000)
      }
    });

  } catch (error) {
    console.error('Bitcoin price API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Bitcoin price',
      data: {
        price: 0,
        change_24h: 0,
        last_updated: Math.floor(Date.now() / 1000)
      }
    }, { status: 500 });
  }
}