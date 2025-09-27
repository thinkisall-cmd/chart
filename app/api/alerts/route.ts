import { NextRequest, NextResponse } from 'next/server';

// 알림 내역 조회 API
// 로컬스토리지 기반이므로 클라이언트에서 데이터 관리
// 서버는 백업/동기화 및 실시간 알림 전달 역할

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 클라이언트 사이드에서 관리하므로 빈 배열 반환
    // 실제 환경에서는 서버 데이터베이스나 캐시에서 조회
    return NextResponse.json({
      status: 'success',
      message: 'Use client-side storage for alerts',
      data: {
        alerts: [],
        total: 0,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Alerts GET Error:', error);
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

    switch (action) {
      case 'backup':
        // 알림 데이터 백업
        console.log('Alerts backup received:', {
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        });

        return NextResponse.json({
          status: 'success',
          message: 'Alerts backup completed',
          timestamp: new Date().toISOString()
        });

      case 'mark_read':
        // 읽음 처리 (서버 동기화용)
        const { alertId } = data;
        console.log('Alert marked as read:', alertId);

        return NextResponse.json({
          status: 'success',
          message: 'Alert marked as read'
        });

      case 'mark_all_read':
        // 모두 읽음 처리
        console.log('All alerts marked as read');

        return NextResponse.json({
          status: 'success',
          message: 'All alerts marked as read'
        });

      case 'clear':
        // 알림 삭제
        console.log('Alerts cleared');

        return NextResponse.json({
          status: 'success',
          message: 'Alerts cleared'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Alerts POST Error:', error);
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

// 실시간 알림을 위한 Server-Sent Events 엔드포인트
export async function PUT(request: NextRequest) {
  try {
    // SSE 스트림 생성
    const stream = new ReadableStream({
      start(controller) {
        // 연결 확인 메시지
        const data = `data: ${JSON.stringify({
          type: 'connection',
          message: 'Connected to alert stream',
          timestamp: new Date().toISOString()
        })}\n\n`;

        controller.enqueue(new TextEncoder().encode(data));

        // 주기적으로 ping 메시지 전송 (연결 유지)
        const interval = setInterval(() => {
          try {
            const pingData = `data: ${JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(pingData));
          } catch (error) {
            clearInterval(interval);
            controller.close();
          }
        }, 30000); // 30초마다 ping

        // 클린업
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('SSE Error:', error);
    return NextResponse.json(
      { error: 'SSE Setup Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    },
  });
}