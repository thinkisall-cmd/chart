# TradingView 알림 시스템 사용 가이드

로컬스토리지 기반으로 구현된 TradingView 알림 시스템의 완전한 사용 가이드입니다.

## 🚀 주요 기능

- **로컬스토리지 기반**: 데이터베이스 없이 브라우저 로컬스토리지 사용
- **실시간 알림**: TradingView Webhook을 통한 즉시 알림
- **관심 종목 관리**: RSI 기준별 종목 추가/삭제/관리
- **브라우저 알림**: 데스크톱 알림 및 소리 알림
- **데이터 백업**: JSON 형태로 데이터 내보내기/가져오기
- **Slack 연동**: 선택적 Slack 알림 지원

## 📋 설정 방법

### 1. 기본 설정

1. `/chart-trading` 페이지 접속
2. 우측 상단 설정(⚙️) 버튼 클릭
3. 알림 설정 활성화:
   - **브라우저 알림**: 데스크톱 알림 활성화
   - **소리 알림**: 알림음 활성화
4. Webhook 토큰 확인 (자동 생성됨)

### 2. TradingView Pine Script 설정

#### Pine Script 코드
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

#### 차트에 적용
1. TradingView에서 Pine Editor 열기
2. 위 코드 복사하여 붙여넣기
3. "차트에 추가" 클릭

### 3. TradingView 알림 설정

1. **알림 생성**:
   - 차트 우측 상단 알림(🔔) 아이콘 클릭
   - 조건: "RSI30 하향" 선택
   - 빈도: "매번" 선택

2. **Webhook 설정**:
   - 알림 방식: "Webhook URL" 선택
   - URL: `https://yourdomain.com/api/trading-alert`
   - 메시지 형식: 아래 JSON 사용

#### Webhook 메시지 형식
```json
{
  "ticker": "{{ticker}}",
  "time": "{{timenow}}",
  "rsi": "{{plot_0}}",
  "price": "{{close}}",
  "message": "{{ticker}} RSI가 {{plot_0}}로 하향 돌파했습니다."
}
```

## 🔧 API 엔드포인트

### 1. 알림 수신 API
```
POST /api/trading-alert
```

**헤더**:
```
Content-Type: application/json
x-webhook-token: your-token (선택)
```

**요청 예시**:
```json
{
  "ticker": "BTCUSDT",
  "time": "2025-01-20T10:30:00Z",
  "rsi": "25.5",
  "price": "45000",
  "message": "BTCUSDT RSI가 25.5로 하향 돌파했습니다."
}
```

### 2. 관심 종목 API
```
GET /api/watchlist       // 목록 조회
POST /api/watchlist      // 백업/동기화
```

### 3. 알림 내역 API
```
GET /api/alerts          // 알림 조회
POST /api/alerts         // 알림 관리 (읽음처리, 백업 등)
```

## 💾 데이터 관리

### 로컬스토리지 구조
```typescript
// 관심 종목 (trading-watchlist)
interface WatchlistItem {
  id: string;
  ticker: string;
  description: string;
  rsiThreshold: number;
  createdAt: string;
  isActive: boolean;
}

// 알림 내역 (trading-alerts)
interface AlertItem {
  id: string;
  ticker: string;
  time: string;
  rsi: number;
  price: number;
  message: string;
  isRead: boolean;
}

// 설정 (trading-settings)
interface TradingSettings {
  webhookToken: string;
  slackWebhookUrl?: string;
  notificationEnabled: boolean;
  soundEnabled: boolean;
}
```

### 데이터 백업/복원
1. **내보내기**: 우측 상단 다운로드(⬇️) 버튼
2. **가져오기**: 우측 상단 업로드(⬆️) 버튼으로 JSON 파일 선택
3. **초기화**: 설정 → "모든 데이터 삭제"

## 🔔 알림 종류

### 1. 브라우저 알림
- 데스크톱 알림 표시
- 권한 요청 후 자동 활성화
- 설정에서 on/off 가능

### 2. 소리 알림
- 알림음 재생 (`/alert-sound.mp3`)
- 설정에서 on/off 가능

### 3. Slack 알림 (선택사항)
```json
{
  "text": "📉 *BTCUSDT* RSI 하향 돌파 알림",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*BTCUSDT* RSI가 25.5로 하향 돌파했습니다."
      }
    }
  ]
}
```

## 🧪 테스트 방법

### 1. 테스트 알림 생성
- 우측 상단 "테스트" 버튼 클릭
- 샘플 알림이 생성되어 동작 확인 가능

### 2. 수동 Webhook 테스트
```bash
curl -X POST https://yourdomain.com/api/trading-alert \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "BTCUSDT",
    "time": "2025-01-20T10:30:00Z",
    "rsi": "25.5",
    "price": "45000"
  }'
```

## 🚨 문제 해결

### 1. 알림이 오지 않는 경우
- 브라우저 알림 권한 확인
- Webhook URL이 올바른지 확인
- 네트워크 연결 상태 확인
- 개발자 도구 콘솔에서 오류 메시지 확인

### 2. 데이터가 사라진 경우
- 브라우저 캐시/쿠키 삭제 여부 확인
- 백업 파일로 복원
- 시크릿 모드에서는 데이터가 저장되지 않음

### 3. TradingView 연동 문제
- Pine Script 문법 오류 확인
- 알림 조건 설정 재확인
- Webhook URL 형식 확인

## 🔒 보안 고려사항

### 1. 토큰 관리
- Webhook 토큰을 안전하게 보관
- 필요시 토큰 재생성
- 환경변수로 서버 토큰 관리

### 2. CORS 설정
- 필요한 도메인만 허용
- 프로덕션에서는 와일드카드(*) 사용 금지

### 3. 데이터 보호
- 민감한 정보는 로컬스토리지에 저장하지 않음
- 정기적인 데이터 백업 권장

## 📈 확장 가능성

### 1. 추가 지표 지원
- MACD, 볼린저 밴드 등 추가
- 복합 조건 알림

### 2. 다중 거래소 지원
- 바이낸스, 코인베이스 등 API 연동
- 가격 비교 알림

### 3. 고급 알림
- 이메일 알림
- 텔레그램 봇 연동
- 디스코드 웹훅

이 가이드를 참고하여 TradingView 알림 시스템을 효과적으로 활용하세요!