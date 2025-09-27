# 차트 트레이딩 기능 가이드

## 개요

NextChart2의 차트 트레이딩 기능은 TradingView의 Pine Script 알림과 연동하여 RSI 하향 돌파 신호를 실시간으로 받아볼 수 있는 기능입니다.

## 주요 기능

### 1. 관심 종목 관리
- 종목 코드, RSI 기준값, 설명 설정
- 종목별 활성화/비활성화 관리
- 로컬 스토리지 기반 데이터 저장

### 2. 실시간 알림 수신
- TradingView Webhook을 통한 실시간 알림
- 읽음/읽지 않음 상태 관리
- 알림 히스토리 저장

### 3. TradingView 연동
- Pine Script 자동 생성
- Webhook URL 제공
- 설정 가이드 제공

## 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# 필수: Webhook 보안 토큰
TRADING_WEBHOOK_TOKEN=your-secret-token

# 선택사항: Slack 알림
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# 선택사항: 이메일 알림
EMAIL_ENABLED=true
SENDGRID_API_KEY=your-sendgrid-api-key
NOTIFICATION_EMAIL=your-email@example.com
```

### 2. TradingView 설정

#### Pine Script 설정
1. TradingView 차트에서 Pine Editor 열기
2. 제공된 Pine Script 코드 복사
3. "차트에 추가" 클릭

#### 알림 설정
1. 차트 우측 상단 알림(🔔) 아이콘 클릭
2. 조건: "RSI30 하향" 선택
3. 알림 방식: "Webhook URL" 선택
4. Webhook URL 입력: `https://your-domain.com/api/trading-alert`
5. 메시지 형식을 JSON으로 설정

#### Webhook 메시지 형식
```json
{
  "ticker": "{{ticker}}",
  "time": "{{timenow}}",
  "rsi": "{{plot_0}}",
  "price": "{{close}}"
}
```

## API 엔드포인트

### POST /api/trading-alert

TradingView에서 보내는 알림을 수신하는 엔드포인트입니다.

#### 요청 헤더
```
Content-Type: application/json
x-webhook-token: your-secret-token (선택사항)
```

#### 요청 본문
```json
{
  "ticker": "BTCUSDT",
  "time": "2024-01-01T12:00:00Z",
  "rsi": "28.5",
  "price": "45000.00"
}
```

#### 응답
```json
{
  "status": "ok",
  "message": "Alert received successfully",
  "data": {
    "id": "1704110400000",
    "ticker": "BTCUSDT",
    "time": "2024-01-01T12:00:00Z",
    "rsi": 28.5,
    "price": 45000.00,
    "message": "BTCUSDT RSI가 28.5 아래로 하향 돌파했습니다.",
    "isRead": false,
    "timestamp": 1704110400000
  }
}
```

## Pine Script 예시

```pinescript
//@version=5
indicator("RSI30 하향 돌파 알림", overlay=false)

// 5분봉 RSI
rsiValue = ta.rsi(close, 14)

// 일별 차트 기준 50일·200일 MA
ma50 = request.security(syminfo.tickerid, "D", ta.sma(close, 50))
ma200 = request.security(syminfo.tickerid, "D", ta.sma(close, 200))

plot(rsiValue, title="RSI(14)", color=color.blue)
hline(30, "RSI30", color=color.red)
plot(ma50, title="MA50(D)", color=color.orange)
plot(ma200, title="MA200(D)", color=color.purple)

// RSI 30 하향 돌파 조건
crossDown = ta.crossunder(rsiValue, 30)
alertcondition(crossDown, title="RSI30 하향", message="{{ticker}} RSI가 30 아래로 하향 돌파했습니다.")
```

## 확장 기능

### 추가 알림 채널
- Slack 웹훅을 통한 팀 알림
- 이메일을 통한 개인 알림
- 모바일 푸시 알림 (FCM 연동 시)

### 커스터마이징
- RSI 기준값 개별 설정
- 다양한 기술적 지표 추가 (MACD, 볼린저 밴드 등)
- 다중 시간대 분석
- 백테스팅 기능

## 보안 고려사항

1. **Webhook 토큰**: `TRADING_WEBHOOK_TOKEN`을 설정하여 무단 액세스 방지
2. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS 사용
3. **Rate Limiting**: 과도한 요청 방지를 위한 속도 제한 구현
4. **입력 검증**: 모든 입력 데이터에 대한 유효성 검사

## 문제 해결

### 알림이 오지 않는 경우
1. TradingView 알림 설정 확인
2. Webhook URL 정확성 확인
3. 네트워크 연결 상태 확인
4. 서버 로그 확인

### Pine Script 오류
1. TradingView Pine Script 문법 확인
2. 차트 시간대 설정 확인
3. 데이터 피드 상태 확인

## 개발 로드맵

- [ ] 데이터베이스 연동 (PostgreSQL/MongoDB)
- [ ] 실시간 WebSocket 연결
- [ ] 모바일 앱 연동
- [ ] 고급 차트 분석 도구
- [ ] 백테스팅 시뮬레이션
- [ ] 포트폴리오 관리 기능