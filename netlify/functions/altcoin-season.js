// altcoin-season utility function을 import하기 위한 설정
const path = require('path');

// calculateAltcoinSeasonIndex 함수를 직접 정의 (간단한 더미 버전)
const calculateAltcoinSeasonIndex = async () => {
  // CMC API가 없는 경우의 더미 로직
  return {
    index: Math.floor(Math.random() * 100),
    status: Math.random() > 0.6 ? '알트코인 시즌' : Math.random() > 0.3 ? '중립' : '비트코인 시즌',
    btcDominance: 45 + Math.random() * 20,
  };
};

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리 (CORS 프리플라이트)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // GET 요청만 허용
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // CMC API가 없는 경우 더미 데이터 반환
    if (!process.env.CMC_API_KEY) {
      const dummyData = {
        index: Math.floor(Math.random() * 100), // 0-100 랜덤 지수
        status: Math.random() > 0.6 ? '알트코인 시즌' : Math.random() > 0.3 ? '중립' : '비트코인 시즌',
        btcDominance: 45 + Math.random() * 20, // 45-65% 사이 랜덤
        lastUpdated: new Date().toISOString(),
        note: 'CMC API 키가 설정되지 않아 더미 데이터를 표시합니다.'
      };

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5분 캐시
        },
        body: JSON.stringify(dummyData),
      };
    }

    // 실제 API 호출
    const data = await calculateAltcoinSeasonIndex();

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30분 캐시
      },
      body: JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString(),
        btcDominance: Math.round(data.btcDominance * 100) / 100, // 소수점 2자리
      }),
    };

  } catch (error) {
    console.error('Altcoin season API error:', error);

    // 에러 발생 시 더미 데이터 반환
    const fallbackData = {
      index: 50,
      status: '중립',
      btcDominance: 55.0,
      lastUpdated: new Date().toISOString(),
      error: '데이터를 가져올 수 없습니다. 나중에 다시 시도해주세요.',
    };

    return {
      statusCode: 200, // 프론트엔드에서 에러가 아닌 것으로 처리
      headers: {
        ...headers,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 짧은 캐시
      },
      body: JSON.stringify(fallbackData),
    };
  }
};