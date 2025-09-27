import { NextRequest, NextResponse } from 'next/server';

// 로컬스토리지는 클라이언트 사이드에서만 사용 가능하므로
// 서버 사이드에서는 간단한 인메모리 저장소나 파일 시스템 사용
// 여기서는 클라이언트에서 POST 요청으로 전체 데이터를 보내는 방식 사용

export async function GET(request: NextRequest) {
  try {
    // 클라이언트에서 관리하는 방식이므로 빈 배열 반환
    // 실제 데이터는 클라이언트 로컬스토리지에서 관리
    return NextResponse.json({
      status: 'success',
      message: 'Use client-side storage for watchlist management',
      data: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // 액션별 처리 (클라이언트에서 백업/동기화용)
    switch (action) {
      case 'backup':
        // 클라이언트 데이터 백업 (로그만 출력)
        console.log('Watchlist backup received:', data);
        return NextResponse.json({
          status: 'success',
          message: 'Watchlist backup received',
          timestamp: new Date().toISOString()
        });

      case 'sync':
        // 동기화 요청 처리
        console.log('Watchlist sync requested');
        return NextResponse.json({
          status: 'success',
          message: 'Sync completed',
          data: [] // 서버에 저장된 데이터가 있다면 여기서 반환
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Watchlist API Error:', error);
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}