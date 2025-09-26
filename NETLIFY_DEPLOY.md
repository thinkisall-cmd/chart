# Netlify 배포 가이드

이 프로젝트는 Netlify에 배포하도록 최적화되어 있습니다.

## 자동 배포 설정

1. **Netlify에서 새 사이트 생성**
   - GitHub 저장소 연결
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **환경 변수 설정 (선택사항)**
   ```
   CMC_API_KEY=your_coinmarketcap_api_key (선택사항)
   ```

## 수동 배포

```bash
# 프로젝트 빌드
npm run build

# Netlify CLI 설치 (없는 경우)
npm install -g netlify-cli

# 배포
netlify deploy --prod --dir=.next
```

## 주요 설정 파일

- `netlify.toml`: Netlify 배포 설정
- `netlify/functions/`: 서버리스 함수들
  - `bitcoin-price.js`: 비트코인 가격 API
  - `bithumb-proxy.js`: 빗썸 API 프록시
  - `altcoin-season.js`: 알트코인 시즌 지수 API

## API 엔드포인트

배포 후 다음 API들을 사용할 수 있습니다:

- `/.netlify/functions/bitcoin-price` - 비트코인 실시간 가격
- `/.netlify/functions/bithumb-proxy` - 빗썸 암호화폐 데이터
- `/.netlify/functions/altcoin-season` - 알트코인 시즌 지수

## 주의사항

1. **API 제한**: CoinGecko API는 무료 플랜에서 분당 10-50 요청으로 제한됩니다.
2. **캐싱**: Netlify Functions에서는 적절한 캐싱 헤더를 설정했습니다.
3. **CORS**: 모든 API에 CORS 헤더가 설정되어 있습니다.

## 문제 해결

**빌드 실패 시:**
- Node.js 버전이 18 이상인지 확인
- `netlify.toml`에서 환경 설정 확인

**API 호출 실패 시:**
- 함수 로그를 Netlify 대시보드에서 확인
- CORS 정책 확인