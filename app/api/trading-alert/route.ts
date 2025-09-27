import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-webhook-token',
    };

    // 인증 토큰 검증 (선택사항)
    const authToken = request.headers.get('x-webhook-token');
    const expectedToken = process.env.TRADING_WEBHOOK_TOKEN || 'default-token';

    // 토큰이 있는 경우에만 검증 (개발 환경에서는 유연하게)
    if (authToken && expectedToken !== 'default-token' && authToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers }
      );
    }

    const body = await request.json();
    console.log('TradingView Alert Received:', body);

    // 알림 데이터 구조 파싱
    const {
      ticker,
      time,
      rsi,
      price,
      message,
      alert_condition,
      plot_0,
      close
    } = body;

    // TradingView에서 다양한 형태로 데이터가 올 수 있으므로 유연하게 처리
    const parsedRsi = parseFloat(rsi || plot_0 || '0');
    const parsedPrice = parseFloat(price || close || '0');
    const alertTime = time || new Date().toISOString();
    const alertMessage = message || `${ticker} RSI가 ${parsedRsi}로 하향 돌파했습니다.`;

    const alertData = {
      id: Date.now().toString(),
      ticker: (ticker || 'UNKNOWN').toUpperCase(),
      time: alertTime,
      rsi: parsedRsi,
      price: parsedPrice,
      message: alertMessage,
      isRead: false,
      timestamp: Date.now()
    };

    console.log('Processed Alert Data:', alertData);

    // 브라우저로 실시간 알림 전송 (Server-Sent Events 또는 WebSocket 대신 간단한 방법)
    // 실제로는 클라이언트에서 주기적으로 폴링하거나 WebSocket 사용

    // 추가 알림 전송 (Slack, 이메일 등)
    await sendNotifications(alertData);

    return NextResponse.json(
      {
        status: 'ok',
        message: 'Alert received and processed successfully',
        data: alertData,
        timestamp: new Date().toISOString()
      },
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Trading Alert Error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-webhook-token',
    },
  });
}

// 알림 전송 함수
async function sendNotifications(alertData: any) {
  try {
    // Slack 알림 (선택사항)
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackNotification(alertData);
    }

    // 이메일 알림 (선택사항)
    if (process.env.EMAIL_ENABLED === 'true') {
      await sendEmailNotification(alertData);
    }

    // 브라우저 알림을 위한 Server-Sent Events (실제 구현에서는 WebSocket 사용 권장)
    // 여기서는 단순히 로그 출력
    console.log('Notifications sent for:', alertData.ticker);

  } catch (error) {
    console.error('Failed to send notifications:', error);
  }
}

// Slack 알림 전송
async function sendSlackNotification(alertData: any) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) return;

  const slackMessage = {
    text: `📉 *${alertData.ticker}* RSI 하향 돌파 알림`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${alertData.ticker}* RSI가 ${alertData.rsi}로 하향 돌파했습니다.`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*RSI:* ${alertData.rsi}`
          },
          {
            type: "mrkdwn",
            text: `*가격:* $${alertData.price}`
          },
          {
            type: "mrkdwn",
            text: `*시간:* ${new Date(alertData.time).toLocaleString('ko-KR')}`
          }
        ]
      }
    ]
  };

  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });
  } catch (error) {
    console.error('Slack notification failed:', error);
  }
}

// 이메일 알림 전송 (예시)
async function sendEmailNotification(alertData: any) {
  // 실제 구현에서는 SendGrid, Nodemailer 등 사용
  console.log('Email notification would be sent for:', alertData.ticker);

  // 예시: SendGrid 사용
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: process.env.NOTIFICATION_EMAIL,
    from: 'alerts@yourdomain.com',
    subject: `${alertData.ticker} RSI 하향 돌파 알림`,
    html: `
      <h3>${alertData.ticker} RSI 하향 돌파</h3>
      <p>RSI: ${alertData.rsi}</p>
      <p>가격: $${alertData.price}</p>
      <p>시간: ${new Date(alertData.time).toLocaleString('ko-KR')}</p>
    `
  };

  await sgMail.send(msg);
  */
}