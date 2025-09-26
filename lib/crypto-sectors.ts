// 섹터별 코인 매핑 - 12개 주요 섹터로 분류
export const CRYPTO_SECTORS: { [key: string]: string } = {
  // AI 섹터
  VIRTUAL: "AI",
  ZEREBRO: "AI",
  SAHARA: "AI",
  SOPH: "AI",
  AI16Z: "AI",
  VIRTUALS: "AI",
  NEWT: "AI",
  AIXBT: "AI",
  ACT: "AI",
  WLD: "AI",
  FET: "AI",
  AGIX: "AI",
  OCEAN: "AI",
  TAO: "AI",
  ARKM: "AI",
  LA: "AI",
  SHELL: "AI",
  STAT: "AI",
  AWE: "AI",
  NMR: "AI",
  PROMPT: "AI",
  FLOCK: "AI",
  CTXC: "AI",
  AGI: "AI",
  KAITO: "AI",
  DEEP: "AI",
  OPEN: "AI",
  C: "AI",
  EPT: "AI",
  XTER: "AI",
  TURBO: "AI",
  HOLO: "AI",
  "0G": "AI",
  THE: "AI",
  COOKIE: "AI",

  // DeFi 섹터
  BARD: "DeFi",
  UNI: "DeFi",
  SUSHI: "DeFi",
  CRV: "DeFi",
  BAL: "DeFi",
  CAKE: "DeFi",
  JOE: "DeFi",
  JUP: "DeFi",
  RAY: "DeFi",
  ORCA: "DeFi",
  BNT: "DeFi",
  OSMO: "DeFi",
  MAV: "DeFi",
  VELODROME: "DeFi",
  AERO: "DeFi",
  VELO: "DeFi",
  BLUE: "DeFi",
  ZETA: "DeFi",
  "1INCH": "DeFi",
  ZRX: "DeFi",
  KNC: "DeFi",
  COW: "DeFi",
  HFT: "DeFi",
  DYDX: "DeFi",
  GMX: "DeFi",
  AAVE: "DeFi",
  COMP: "DeFi",
  XVS: "DeFi",
  RDNT: "DeFi",
  JST: "DeFi",
  SYRUP: "DeFi",
  MORPHO: "DeFi",
  MKR: "DeFi",
  LISTA: "DeFi",
  YFI: "DeFi",
  BEL: "DeFi",
  PENDLE: "DeFi",
  SNX: "DeFi",
  UMA: "DeFi",
  MEV: "DeFi",
  WOO: "DeFi",
  SPK: "DeFi",
  HUMA: "DeFi",
  CTC: "DeFi",
  SXT: "DeFi",
  SUN: "DeFi",
  FIDA: "DeFi",
  AUCTION: "DeFi",
  UXLINK: "DeFi",
  HAEDAL: "DeFi",
  AVL: "DeFi",
  PUMP: "DeFi",
  SIX: "DeFi",
  SWAP: "DeFi",
  SOFI: "DeFi",
  C98: "DeFi",
  RESOLVE: "DeFi",
  EUL: "DeFi",
  KMNO: "DeFi",

  // GameFi-NFT 섹터
  AXS: "GameFi-NFT",
  SAND: "GameFi-NFT",
  MANA: "GameFi-NFT",
  GALA: "GameFi-NFT",
  MAGIC: "GameFi-NFT",
  ALICE: "GameFi-NFT",
  ILV: "GameFi-NFT",
  ZTX: "GameFi-NFT",
  RON: "GameFi-NFT",
  XAI: "GameFi-NFT",
  ACE: "GameFi-NFT",
  BIGTIME: "GameFi-NFT",
  UOS: "GameFi-NFT",
  MAY: "GameFi-NFT",
  MIX: "GameFi-NFT",
  MBX: "GameFi-NFT",
  SIGN: "GameFi-NFT",
  ENJ: "GameFi-NFT",
  IMX: "GameFi-NFT",
  BLUR: "GameFi-NFT",
  APE: "GameFi-NFT",
  WAXP: "GameFi-NFT",
  AGLD: "GameFi-NFT",
  MOCA: "GameFi-NFT",
  GAME2: "GameFi-NFT",
  NFT: "GameFi-NFT",
  D: "GameFi-NFT",
  DVI: "GameFi-NFT",
  PYR: "GameFi-NFT",
  ME: "GameFi-NFT",
  ROA: "GameFi-NFT",
  TDROP: "GameFi-NFT",
  PENGU: "GameFi-NFT",
  GMT: "GameFi-NFT",
  FITFI: "GameFi-NFT",
  GRND: "GameFi-NFT",
  YGG: "GameFi-NFT",
  A8: "GameFi-NFT",
  HIGH: "GameFi-NFT",
  MOC: "GameFi-NFT",
  NXPC: "GameFi-NFT",
  CHZ: "GameFi-NFT",
  SPURS: "GameFi-NFT",
  CARV: "GameFi-NFT",
  LBL: "GameFi-NFT",
  LWAR: "GameFi-NFT",
  TAVA: "GameFi-NFT",
  WNCG: "GameFi-NFT",
  INIT: "GameFi-NFT",
  LM: "GameFi-NFT",
  LWA: "GameFi-NFT",
  // 거래소 섹터
  AVNT: "Exchange",
  DRIFT: "Exchange",
  F: "Exchange",

  // Infra 섹터
  ZKC: "Infra",
  ACX: "Infra",
  B3T: "Infra",
  DBR: "Infra",
  KSM: "Infra",
  DKA: "Infra",
  FANC: "Infra",
  AZIT: "Infra",
  GRT: "Infra",
  ANKR: "Infra",
  RAD: "Infra",
  RLC: "Infra",
  FLUX: "Infra",
  POKT: "Infra",
  RSS3: "Infra",
  ORDER: "Infra",
  FCT2: "Infra",
  POLA: "Infra",
  THETA: "Infra",
  BAT: "Infra",
  LPT: "Infra",
  TFUEL: "Infra",
  LIVEPEER: "Infra",
  SLF: "Infra",
  KEY: "Infra",
  SFP: "Infra",
  BICO: "Infra",
  BIOT: "Infra",
  CTK: "Infra",
  FORT: "Infra",
  NCT: "Infra",
  BOUNTY: "Infra",
  OBT: "Infra",
  ZRO: "Infra",
  STG: "Infra",
  W: "Infra",
  CELR: "Infra",
  REN: "Infra",
  OMNI: "Infra",
  MAPO: "Infra",
  ASTR: "Infra",
  WAXL: "Infra",
  LINK: "Infra",
  BAND: "Infra",
  API3: "Infra",
  PYTH: "Infra",
  REP: "Infra",
  RED: "Infra",
  IOTA: "Infra",
  JASMY: "Infra",
  IOTX: "Infra",
  FIL: "Infra",
  AR: "Infra",
  STORJ: "Infra",
  BTT: "Infra",
  SC: "Infra",
  WAL: "Infra",
  VET: "Infra",
  TEMCO: "Infra",
  HP: "Infra",
  NIL: "Infra", //
  BMT: "Infra", //
  TREE: "Infra", //
  EVZ: "Infra", //
  OBSR: "Infra", //
  ELX: "Infra", //
  PARTI: "Infra", //
  CRTS: "DeFi", // Credits Protocol - DeFi
  AL: "AI", // Alethea AI - AI
  AHT: "Infra", // Ahab - Infrastructure
  A: "DeFi", // Alpha Finance - DeFi
  B3: "Infra", // B3 - Infrastructure
  BIO: "RWA", // BIO Protocol - RWA
  BTR: "DeFi", // Bitrue Token - L1
  GRS: "Privacy", // Groestlcoin - Privacy
  RESOLV: "DeFi", // Resolve Protocol - DeFi
  RVN: "L1", // Ravencoin - L1
  WCT: "Exchange", // Waves Community Token - Exchange

  // DePIN 섹터
  RENDER: "DePIN",
  IO: "DePIN",
  AIOZ: "DePIN",
  AKT: "DePIN",
  GLM: "DePIN",
  ATH: "DePIN",
  PEAQ: "DePIN",
  VANA: "DePIN",
  GHX: "DePIN",
  POWR: "DePIN",
  GRASS: "DePIN",

  // Korea-Payment 섹터
  ICX: "Korea-Payment",
  BFC: "Korea-Payment",
  TOKAMAK: "Korea-Payment",
  BORA: "Korea-Payment",
  META: "Korea-Payment",
  MVL: "Korea-Payment",
  MED: "Korea-Payment",
  MLK: "Korea-Payment",
  HUNT: "Korea-Payment",
  WEMIX: "Korea-Payment",
  SSX: "Korea-Payment",
  MBL: "Korea-Payment",
  XRP: "Korea-Payment",
  LTC: "Korea-Payment",
  BCH: "Korea-Payment",
  XLM: "Korea-Payment",
  DASH: "Korea-Payment",
  ACH: "Korea-Payment",
  XCN: "Korea-Payment",
  REQ: "Korea-Payment",
  AMP: "Korea-Payment",
  MTL: "Korea-Payment",
  XPR: "Korea-Payment",
  PUNDIX: "Korea-Payment",
  SXP: "Korea-Payment",
  PCI: "Korea-Payment",
  COTI: "Korea-Payment",
  APM: "Korea-Payment",
  MVC: "Korea-Payment",
  XYO: "Korea-Payment",

  // L1 섹터
  BTC: "L1",
  ETH: "L1",
  BNB: "L1",
  SOL: "L1",
  ADA: "L1",
  AVAX: "L1",
  DOT: "L1",
  TRX: "L1",
  TON: "L1",
  NEAR: "L1",
  ICP: "L1",
  ATOM: "L1",
  APT: "L1",
  SUI: "L1",
  HBAR: "L1",
  ALGO: "L1",
  CFX: "L1",
  KAIA: "L1",
  SEI: "L1",
  KLAY: "L1",
  WAVES: "L1",
  NEO: "L1",
  EOS: "L1",
  QTUM: "L1",
  ONT: "L1",
  ZIL: "L1",
  FLOW: "L1",
  ROSE: "L1",
  ONE: "L1",
  EGLD: "L1",
  FTM: "L1",
  CELO: "L1",
  MINA: "L1",
  BEAM: "L1",
  CORE: "L1",
  BSV: "L1",
  ETC: "L1",
  INJ: "L1",
  BB: "L1",
  IOST: "L1",
  ORBS: "L1",
  AERGO: "L1",
  CRO: "L1",
  CHR: "L1",
  CSPR: "L1",
  BOA: "L1",
  OAS: "L1",
  XPLA: "L1",
  REI: "L1",
  ARDR: "L1",
  CKB: "L1",
  XTZ: "L1",
  FLR: "L1",
  KAVA: "L1",
  LSK: "L1",
  STRAX: "L1",
  QKC: "L1",
  ARK: "L1",
  TT: "L1",
  ELF: "L1",
  SONIC: "L1",
  BERA: "L1",
  G: "L1",
  GAS: "L1",
  ONG: "L1",
  VTHO: "L1",
  S: "L1",
  XEC: "L1",

  // L2 섹터
  ARB: "L2",
  OP: "L2",
  MATIC: "L2",
  POL: "L2",
  STRK: "L2",
  METIS: "L2",
  BOBA: "L2",
  LRC: "L2",
  BLAST: "L2",
  SCROLL: "L2",
  SCR: "L2",
  LINEA: "L2",
  ZK: "L2",
  TAIKO: "L2",
  MNT: "L2",
  ZRC: "L2",
  MANTA: "L2",
  SKL: "L2",
  CTSI: "L2",
  CYBER: "L2",
  STX: "L2",
  MERL: "L2",
  HYPER: "L2",
  LAYER: "L2",
  MOVE: "L2",
  ES: "L2",
  H: "L2",
  AVAIL: "L2",
  TIA: "L2",
  ALT: "L2",
  ERA: "L2",
  SOON: "L2",
  PROVE: "L2",
  HEMI: "L2",

  // Meme 섹터
  DOGE: "Meme",
  SHIB: "Meme",
  PEPE: "Meme",
  BONK: "Meme",
  WIF: "Meme",
  POPCAT: "Meme",
  MEW: "Meme",
  PONKE: "Meme",
  EGG: "Meme",
  BRETT: "Meme",
  RETARDIO: "Meme",
  CHILLGUY: "Meme",
  MOODENG: "Meme",
  PNUT: "Meme",
  GOAT: "Meme",
  NEIRO: "Meme",
  SPX: "Meme",
  FARTCOIN: "Meme",
  SUNDOG: "Meme",
  FLOKI: "Meme",
  ANIME: "Meme",
  TOSHI: "Meme",
  TRUMP: "Meme",

  // RWA 섹터
  ONDO: "RWA",
  POLYX: "RWA",
  PLUME: "RWA",
  OM: "RWA",
  SOLV: "RWA",
  POLY: "RWA",
  HOME: "RWA",
  USUAL: "RWA",
  USD1: "RWA",
  FXS: "RWA",
  EL: "RWA",
  BLY: "RWA",
  AQT: "RWA",

  // Social-DAO 섹터
  ACS: "Social-DAO",
  MASK: "Social-DAO",
  ENS: "Social-DAO",
  LENS: "Social-DAO",
  HIVE: "Social-DAO",
  STEEM: "Social-DAO",
  SNT: "Social-DAO",
  CVC: "Social-DAO",
  AMO: "Social-DAO",
  TOWNS: "Social-DAO",
  ID: "Social-DAO",
  GTC: "Social-DAO",
  KERNEL: "Social-DAO",
  DAO: "Social-DAO",
  SAFE: "Social-DAO",
  GNO: "Social-DAO",
  DCR: "Social-DAO",
  AUDIO: "Social-DAO",
  COS: "Social-DAO",
  IQ: "Social-DAO",
  OGN: "Social-DAO",
  IP: "Social-DAO",
  ADP: "Social-DAO",
  HOOK: "Social-DAO",
  EDU: "Social-DAO",
  CBK: "Social-DAO",
  GRACY: "Social-DAO",
  WIKEN: "Social-DAO",
  WLFI: "Social-DAO",
  CAMP: "Social-DAO",

  // Stablecoin 섹터
  USDT: "Stablecoin",
  USDC: "Stablecoin",
  DAI: "Stablecoin",
  FRAX: "Stablecoin",
  BUSD: "Stablecoin",
  TUSD: "Stablecoin",
  USDS: "Stablecoin",
  RSR: "Stablecoin",
  ENA: "Stablecoin",
  SKY: "Stablecoin",
  PAXG: "Stablecoin",
  LDO: "Stablecoin",
  RPL: "Stablecoin",
  JTO: "Stablecoin",
  SWELL: "Stablecoin",
  SD: "Stablecoin",
  SWISE: "Stablecoin",
  FRXETH: "Stablecoin",
  STETH: "Stablecoin",
  RETH: "Stablecoin",
  EIGEN: "Stablecoin",
  ETHFI: "Stablecoin",
  PUFFER: "Stablecoin",
  REZ: "Stablecoin",
  BABY: "Stablecoin",
  PUMPBTC: "Stablecoin",

  // 프라이버시 섹터
  ZEC: "Privacy", // 프라이버시
  XMR: "Privacy", // 프라이버시
  T: "Privacy", // 프라이버시
  ARPA: "Privacy", // 프라이버시
  OXT: "Privacy", // 프라이버시
  SCRT: "Privacy", // 프라이버시

  // 코스모스 생태계
  JUNO: "L1",
  EVMOS: "L1",
  LUNA: "L1",
  UST: "Stablecoin",
  MIR: "DeFi",
  ANC: "DeFi",
  FLUID: "DeFi",
  CUDIS: "DEX",
};

// 섹터별로 코인을 그룹화하는 함수
export const groupCoinsBySector = (coinData: { [key: string]: any }) => {
  const sectorGroups: { [sector: string]: { symbol: string; data: any }[] } =
    {};

  Object.entries(coinData).forEach(([symbol, data]) => {
    const sector = CRYPTO_SECTORS[symbol] || "기타";
    if (!sectorGroups[sector]) {
      sectorGroups[sector] = [];
    }
    sectorGroups[sector].push({ symbol, data });
  });

  return sectorGroups;
};

// 섹터별 통계를 계산하는 함수
export const calculateSectorStats = (sectorGroups: {
  [sector: string]: { symbol: string; data: any }[];
}) => {
  const sectorStats: {
    [sector: string]: {
      count: number;
      avgChange: number;
      totalVolume: number;
      positiveCount: number;
      negativeCount: number;
      topGainer: { symbol: string; change: number } | null;
      topLoser: { symbol: string; change: number } | null;
    };
  } = {};

  Object.entries(sectorGroups).forEach(([sector, coins]) => {
    const changes = coins.map((coin) =>
      Number.parseFloat(coin.data.fluctate_rate_24H)
    );
    const volumes = coins.map((coin) =>
      Number.parseFloat(coin.data.units_traded_24H)
    );

    const avgChange =
      changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);
    const positiveCount = changes.filter((change) => change > 0).length;
    const negativeCount = changes.filter((change) => change < 0).length;

    const sortedByChange = coins.sort(
      (a, b) =>
        Number.parseFloat(b.data.fluctate_rate_24H) -
        Number.parseFloat(a.data.fluctate_rate_24H)
    );

    sectorStats[sector] = {
      count: coins.length,
      avgChange,
      totalVolume,
      positiveCount,
      negativeCount,
      topGainer:
        sortedByChange.length > 0
          ? {
              symbol: sortedByChange[0].symbol,
              change: Number.parseFloat(
                sortedByChange[0].data.fluctate_rate_24H
              ),
            }
          : null,
      topLoser:
        sortedByChange.length > 0
          ? {
              symbol: sortedByChange[sortedByChange.length - 1].symbol,
              change: Number.parseFloat(
                sortedByChange[sortedByChange.length - 1].data.fluctate_rate_24H
              ),
            }
          : null,
    };
  });

  return sectorStats;
};

// 실시간 변동률을 사용하는 섹터별 통계 계산 함수
export const calculateSectorStatsWithRealTime = (
  sectorGroups: { [sector: string]: { symbol: string; data: any }[] },
  realTimeChangePercents: { [key: string]: string }
) => {
  const sectorStats: {
    [sector: string]: {
      count: number;
      avgChange: number;
      totalVolume: number;
      positiveCount: number;
      negativeCount: number;
      topGainer: { symbol: string; change: number } | null;
      topLoser: { symbol: string; change: number } | null;
    };
  } = {};

  Object.entries(sectorGroups).forEach(([sector, coins]) => {
    const changes = coins.map((coin) => {
      const realTimeChange = realTimeChangePercents[coin.symbol];
      return realTimeChange
        ? Number.parseFloat(realTimeChange)
        : Number.parseFloat(coin.data.fluctate_rate_24H);
    });
    const volumes = coins.map((coin) =>
      Number.parseFloat(coin.data.units_traded_24H)
    );

    const avgChange =
      changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);
    const positiveCount = changes.filter((change) => change > 0).length;
    const negativeCount = changes.filter((change) => change < 0).length;

    const coinsWithRealTimeChange = coins.map((coin, index) => ({
      ...coin,
      realTimeChange: changes[index],
    }));

    const sortedByChange = coinsWithRealTimeChange.sort(
      (a, b) => b.realTimeChange - a.realTimeChange
    );

    sectorStats[sector] = {
      count: coins.length,
      avgChange,
      totalVolume,
      positiveCount,
      negativeCount,
      topGainer:
        sortedByChange.length > 0
          ? {
              symbol: sortedByChange[0].symbol,
              change: sortedByChange[0].realTimeChange,
            }
          : null,
      topLoser:
        sortedByChange.length > 0
          ? {
              symbol: sortedByChange[sortedByChange.length - 1].symbol,
              change: sortedByChange[sortedByChange.length - 1].realTimeChange,
            }
          : null,
    };
  });

  return sectorStats;
};

// 주요 12개 섹터 순서 정의
export const MAIN_SECTORS = [
  "AI",
  "DeFi",
  "GameFi-NFT",
  "Infra",
  "DePIN",
  "Korea-Payment",
  "L1",
  "L2",
  "Meme",
  "RWA",
  "Social-DAO",
  "Stablecoin",
  "Exchange",
  "Privacy",
  "DEX",
];

export const getCoinSector = (symbol: string): string => {
  return CRYPTO_SECTORS[symbol] || "기타";
};

export const getSectorColor = (sector: string): string => {
  const colorMap: { [key: string]: string } = {
    AI: "bg-purple-100 text-purple-800",
    DeFi: "bg-blue-100 text-blue-800",
    "GameFi-NFT": "bg-green-100 text-green-800",
    Infra: "bg-gray-100 text-gray-800",
    DePIN: "bg-orange-100 text-orange-800",
    "Korea-Payment": "bg-red-100 text-red-800",
    L1: "bg-indigo-100 text-indigo-800",
    L2: "bg-cyan-100 text-cyan-800",
    Meme: "bg-yellow-100 text-yellow-800",
    RWA: "bg-emerald-100 text-emerald-800",
    "Social-DAO": "bg-pink-100 text-pink-800",
    Stablecoin: "bg-slate-100 text-slate-800",
    Exchange: "bg-neutral-100 text-neutral-800",
    Privacy: "bg-teal-100 text-teal-800",
    DEX: "bg-pink-100 text-pink-800",
  };
  return colorMap[sector] || "bg-neutral-100 text-neutral-800";
};
