import { NextResponse } from 'next/server';

// CoinMarketCap API에서 글로벌 데이터 가져오기
async function fetchCMCGlobalData() {
  const response = await fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
    headers: {
      'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || '',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`CoinMarketCap global API error: ${response.status}`);
  }

  return response.json();
}

// CoinMarketCap에서 상위 100개 코인 데이터 가져오기 (시가총액 기준)
async function fetchTop100CoinsData() {
  const response = await fetch(
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD&sort=market_cap&sort_dir=desc',
    {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || '',
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`CoinMarketCap listings API error: ${response.status}`);
  }

  return response.json();
}

// 알트코인 시즌 지수 계산 (표준 방법론 기준)
function calculateAltcoinSeasonIndex(globalData: any, coinsData: any[]) {
  // 비트코인 도미넌스 가져오기
  const btcDominance = globalData.data.btc_dominance || 55;

  // 비트코인의 90일 성과 가져오기
  const bitcoin = coinsData.find(coin => coin.symbol === 'BTC');
  const btcChange90d = bitcoin?.quote?.USD?.percent_change_90d || 0;

  // 스테이블코인과 래핑토큰 제외 리스트
  const excludeSymbols = [
    'BTC', 'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'USDD', 'FRAX',
    'WBTC', 'WETH', 'STETH', 'RETH', 'CBETH', 'WSTETH'
  ];

  // 알트코인 필터링 (스테이블코인, 래핑토큰 제외)
  const altcoins = coinsData.filter(coin =>
    !excludeSymbols.includes(coin.symbol) &&
    coin.quote?.USD?.percent_change_90d !== null &&
    coin.quote?.USD?.percent_change_90d !== undefined
  );

  // 90일 기준으로 비트코인을 능가한 알트코인 계산
  const outperformingCoins = altcoins.filter(coin => {
    const altChange90d = coin.quote?.USD?.percent_change_90d;
    return altChange90d && altChange90d > btcChange90d;
  }).length;

  // 알트코인 시즌 지수 계산 (0-100)
  const totalAltcoins = altcoins.length;
  const index = totalAltcoins > 0 ? Math.round((outperformingCoins / totalAltcoins) * 100) : 0;

  // 상태 결정 (표준 기준)
  let status: string;
  let statusEmoji: string;

  if (index >= 75) {
    status = '알트코인 시즌';
    statusEmoji = '🚀';
  } else if (index >= 50) {
    status = '알트코인 모멘텀';
    statusEmoji = '📈';
  } else if (index >= 26) {
    status = '전환기';
    statusEmoji = '⚖️';
  } else {
    status = '비트코인 시즌';
    statusEmoji = '₿';
  }

  return {
    index,
    status,
    statusEmoji,
    btcDominance: Math.round(btcDominance * 100) / 100,
    btcChange90d: Math.round(btcChange90d * 100) / 100,
    outperformingCoins,
    totalAltcoins,
    methodology: '90일 기준 비트코인 대비 상대성과'
  };
}

// Static export를 위한 generateStaticParams
export function generateStaticParams() {
  return []
}

export async function GET() {
  try {
    // CoinMarketCap에서 글로벌 데이터와 코인 데이터 가져오기
    const [globalData, coinsResponse] = await Promise.all([
      fetchCMCGlobalData(),
      fetchTop100CoinsData()
    ]);

    const result = calculateAltcoinSeasonIndex(globalData, coinsResponse.data);

    return NextResponse.json({
      ...result,
      lastUpdated: new Date().toISOString(),
      source: 'CoinMarketCap API',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30분 캐시
      },
    });

  } catch (error) {
    console.error('Altcoin season API error:', error);

    // 에러 발생 시 계산중 상태 반환
    const calculatingData = {
      status: '계산중',
      lastUpdated: new Date().toISOString(),
      error: 'CoinMarketCap API 호출 실패. 잠시 후 다시 시도해주세요.',
      calculating: true,
    };

    return NextResponse.json(calculatingData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 에러시 5분 캐시
      },
    });
  }
}