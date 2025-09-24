/**
 * 업비트 USDT 마켓 코인 목록 관리
 * 2025년 1월 기준 업비트에서 실제 USDT 마켓에서 거래되는 코인들
 *
 * 마커: ✅ = 빗썸과 공통, 🔄 = 업비트만, 📈 = 새로 추가
 */

export const UPBIT_USDT_COINS = new Set([
  // 메이저 코인들
  "BTC", // ✅ 비트코인
  "ETH", // ✅ 이더리움
  "ADA", // ✅ 카르다노
  "XRP", // ✅ 리플
  "SOL", // ✅ 솔라나
  "BCH", // ✅ 비트코인캐시
  "ETC", // ✅ 이더리움클래식
  "TRX", // ✅ 트론
  "XLM", // ✅ 스텔라루멘
  "NEO", // ✅ 네오

  // DeFi 토큰들
  "UNI", // ✅ 유니스왑
  "NEAR", // ✅ 니어프로토콜
  "INJ", // ✅ 인젝티브프로토콜
  "OP", // ✅ 옵티미즘
  "ZETA", // ✅ 제타체인
  "ZRX", // ✅ 제로엑스
  "ZRO", // ✅ 레이어제로
  "BNT", // ✅ 밴코르
  "API3", // ✅ API3
  "ASTR", // ✅ 아스타
  "AGLD", // ✅ 어드벤처골드
  "ARKM", // ✅ 아카엠

  // AI & Gaming 토큰들
  "RENDER", // ✅ 렌더토큰
  "WLD", // ✅ 월드코인
  "LPT", // ✅ 라이브피어
  "BIGTIME", // ✅ 빅타임
  "JASMY", // ✅ 재스미
  "BEAM", // ✅ 빔
  "FIL", // ✅ 파일코인
  "ARPA", // ✅ 아르파체인
  "ANIME", // ✅ 애니메
  "0G", //

  // 밈 코인들
  "DOGE", // ✅ 도지코인
  "PEPE", // ✅ 페페
  "BONK", // ✅ 봉크
  "MEW", // ✅ 고양이모자쓴개
  "MOODENG", // ✅ 무뎅
  "BABY", // ✅ 베이비독코인
  "BRETT", // ✅ 브렛

  // 레이어2 & 체인들
  "MNT", // ✅ 맨틀
  "LAYER", // ✅ 레이어0
  "ERA", // ✅ 이라
  "LINEA", // ✅ 리니어
  "TAIKO", // ✅ 타이코
  "BLAST", // ✅ 블라스트
  "ALT", // ✅ 알트레이어
  "CYBER", // ✅ 사이버커넥트
  "EGLD", // ✅ 멀티버스엑스
  "GAS", // ✅ 가스
  "SC", // ✅ 시아코인
  "CKB", // ✅ 너보스

  // 새로운 프로젝트들
  "TIA", // ✅ 셀레스티아
  "W", // ✅ 웜홀
  "JUP", // ✅ 주피터
  "JTO", // ✅ 지토
  "RAY", // ✅ 레이디움
  "ORCA", // ✅ 오르카
  "DRIFT", // ✅ 드리프트
  "IO", // ✅ 아이오
  "ENA", // ✅ 이더나
  "OMNI", // ✅ 옴니네트워크
  "ONDO", // ✅ 온도파이낸스
  "BAT", // ✅ 베이직어텐션토큰
  "RVN", // ✅ 레이븐코인
  "DGB", // ✅ 디지바이트
  "AKT", // ✅ 아카시네트워크
  "VTHO", // ✅ 비체인토르에너지
  "POKT", // ✅ 포켓네트워크
  "RAD", // ✅ 라디클
  "SAFE", // ✅ 세이프
  "OXT", // ✅ 옥텍스

  // 스테이블코인들
  "USDC", // ✅ USD코인
  "TUSD", // ✅ 트루USD
  "USD1", // ✅ USD1

  // 기타 유틸리티 토큰들
  "OAS", // ✅ 오아시스
  "SCR", // ✅ 스크롤
  "TREE", // ✅ 트리
  "CARV", // ✅ 카브
  "NEWT", // ✅ 뉴턴
  "LWA", // ✅ 라이브레이션
  "WAL", // ✅ 월렛
  "WCT", // ✅ 웨이브스커뮤니티토큰
  "AXL", // ✅ 악셀라
  "WLFI", // ✅ 월드리버티파이낸셜
  "OBSR", // ✅ 옵저버
  "HYPER", // ✅ 하이퍼리퀴드
  "SWELL", // ✅ 스웰
  "SONIC", // ✅ 소닉
  "SHELL", // ✅ 셸프로토콜
  "AERO", // ✅ 에어로드롬파이낸스
  "UXLINK", // ✅ UXLINK
  "MOCA", // ✅ 모카네트워크
  "NXPC", // ✅ 넥스프로토콜
  "VIRTUAL", // ✅ 버추얼프로토콜
  "TRUMP", // ✅ 트럼프
  "PUMP", // ✅ 펌프펀
  "HAEDAL", // ✅ 해달
  "OPEN", // ✅ 오픈소스네트워크
  "SAHARA", // ✅ 사하라AI
  "ACS", // ✅ 액세스프로토콜
  "RED", // ✅ 레드키노
  "AHT", // ✅ 아트하이드
  "EPT", // ✅ 에픽토큰
  "LA", // ✅ 라이센티움
  "HOLO", // ✅ 홀로토큰
  "FORT", // ✅ 포티스
  "IP", // ✅ 인터넷컴퓨터프로토콜
  "FLOCK", // ✅ 플록
  "KERNEL", // ✅ 커널
  "PUFFER", // ✅ 퍼퍼파이낸스
  "GO", // ✅ 고네트워크
  "KAITO", // ✅ 카이토
  "COW", // ✅ 카우프로토콜
  "RLY", // ✅ 랠리
  "MOVE", // ✅ 무브
  "ME", // ✅ 매직에덴
  "NCT", // ✅ 넥트
  "VANA", // ✅ 바나
  "SIGN", // ✅ 사인프로토콜
  "BERA", // ✅ 베라체인
  "SOPH", // ✅ 소피아
  "PROVE", // ✅ 프루브
  "SOON", // ✅ 순네트워크
  "DEEP", // ✅ 딥북
  "SYRUP", // ✅ 시럽
  "PENGU", // ✅ 펭구

  // 📈 최신 추가 코인들 (2025년 1월 기준)
  "OM", // ✅ 맨트라
  "1INCH", // 📈 원인치
  "AAVE", // 📈 아베
  "COMP", // 📈 컴파운드
  "CRV", // 📈 커브DAO토큰
  "LDO", // 📈 리도DAO
  "MKR", // 📈 메이커
  "SUSHI", // 📈 스시스왑
  "YFI", // 📈 연파이낸스
  "SNX", // 📈 신세틱스
  "STORJ", // 📈 스토리지
  "THETA", // 📈 시타토큰
  "VET", // 📈 비체인
  "IOTA", // 📈 아이오타
  "ATOM", // 📈 코스모스
  "DOT", // 📈 폴카닷
  "AVAX", // 📈 아발란체
  "MATIC", // 📈 폴리곤
  "FTM", // 📈 팬텀
  "HBAR", // 📈 헤데라
  "ALGO", // 📈 알고랜드
  "XTZ", // 📈 테조스
  "FLOW", // 📈 플로우
  "ICP", // 📈 인터넷컴퓨터
  "SAND", // 📈 더샌드박스
  "MANA", // 📈 디센트럴랜드
  "APE", // 📈 에이프코인
  "AXS", // 📈 액시인피니티
  "GALA", // 📈 갈라게임즈
  "ENJ", // 📈 엔진코인
  "CHZ", // 📈 칠리즈
  "BAL", // 📈 밸런서
  "BAND", // 📈 밴드프로토콜
  "KNC", // 📈 카이버네트워크
  "REN", // 📈 렌
  "OCEAN", // 📈 오션프로토콜
  "GRT", // 📈 더그래프
  "MASK", // 📈 마스크네트워크
  "DYDX", // 📈 dYdX
  "GMX", // 📈 GMX
])

/**
 * 업비트 USDT 마켓에서 거래 가능한 코인인지 확인
 */
export function isUpbitUsdtCoin(symbol: string): boolean {
  // _KRW 제거한 순수 심볼로 확인
  const cleanSymbol = symbol.replace("_KRW", "")
  return UPBIT_USDT_COINS.has(cleanSymbol)
}

/**
 * 업비트 USDT 심볼 생성 (USDT-XXX 형태)
 */
export function getUpbitUsdtSymbol(symbol: string): string | null {
  const cleanSymbol = symbol.replace("_KRW", "")
  return isUpbitUsdtCoin(symbol) ? `USDT-${cleanSymbol}` : null
}

/**
 * 빗썸 심볼이 업비트 USDT 마켓에서 거래 가능한지 확인 (기존 API 호환)
 */
export function hasUpbitUsdtPair(bithumbSymbol: string): boolean {
  return isUpbitUsdtCoin(bithumbSymbol)
}
