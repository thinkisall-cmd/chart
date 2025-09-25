import { NextResponse } from 'next/server';
import { calculateAltcoinSeasonIndex } from '@/lib/altcoin-season';

// Static export를 위한 generateStaticParams
export function generateStaticParams() {
  return []
}

export async function GET() {
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

      return NextResponse.json(dummyData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5분 캐시
        },
      });
    }

    // 실제 API 호출
    const data = await calculateAltcoinSeasonIndex();

    return NextResponse.json({
      ...data,
      lastUpdated: new Date().toISOString(),
      btcDominance: Math.round(data.btcDominance * 100) / 100, // 소수점 2자리
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30분 캐시
      },
    });

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

    return NextResponse.json(fallbackData, {
      status: 200, // 프론트엔드에서 에러가 아닌 것으로 처리
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 짧은 캐시
      },
    });
  }
}