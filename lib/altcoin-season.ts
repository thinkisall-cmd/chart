// lib/altcoin-season.ts
interface CoinData {
  id: number;
  symbol: string;
  quote: {
    USD: {
      percent_change_90d: number;
    };
  };
}

interface GlobalMetrics {
  data: {
    btc_dominance: number;
  };
}

export async function calculateAltcoinSeasonIndex(): Promise<{
  index: number;
  status: string;
  btcDominance: number;
}> {
  const CMC_API_KEY = process.env.CMC_API_KEY;

  if (!CMC_API_KEY) {
    throw new Error('CMC API key is required');
  }

  try {
    // 1. 상위 100개 코인 데이터 가져오기
    const coinsResponse = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&convert=USD',
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    // 2. 글로벌 메트릭스 가져오기 (BTC dominance 포함)
    const globalResponse = await fetch(
      'https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!coinsResponse.ok || !globalResponse.ok) {
      throw new Error('Failed to fetch data from CoinMarketCap');
    }

    const coinsData = await coinsResponse.json();
    const globalData: GlobalMetrics = await globalResponse.json();

    // 3. 비트코인 90일 성과 찾기
    const bitcoin = coinsData.data.find((coin: CoinData) => coin.symbol === 'BTC');
    const btcChange90d = bitcoin?.quote.USD.percent_change_90d || 0;

    // 4. 스테이블코인과 래핑토큰 제외
    const excludedSymbols = ['USDT', 'USDC', 'BUSD', 'DAI', 'WBTC', 'STETH', 'WETH'];

    const filteredCoins = coinsData.data.filter((coin: CoinData) =>
      !excludedSymbols.includes(coin.symbol) && coin.symbol !== 'BTC'
    );

    // 5. 비트코인보다 성과가 좋은 코인 계산
    const outperformingCoins = filteredCoins.filter((coin: CoinData) => {
      const coinChange90d = coin.quote.USD.percent_change_90d;
      return coinChange90d > btcChange90d;
    });

    // 6. 알트코인 시즌 지수 계산
    const index = Math.round((outperformingCoins.length / filteredCoins.length) * 100);

    // 7. 상태 결정
    let status = '중립';
    if (index >= 75) {
      status = '알트코인 시즌';
    } else if (index <= 25) {
      status = '비트코인 시즌';
    }

    return {
      index,
      status,
      btcDominance: globalData.data.btc_dominance,
    };
  } catch (error) {
    throw new Error(`Failed to calculate altcoin season index: ${error}`);
  }
}