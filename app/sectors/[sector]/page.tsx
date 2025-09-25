import SectorDetailClient from './SectorDetailClient'

// Static params generation for static export
export async function generateStaticParams() {
  const sectors = [
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
    "기타" // Default sector
  ];

  return sectors.map((sector) => ({
    sector: encodeURIComponent(sector)
  }));
}

export default function SectorDetail({ params }: { params: { sector: string } }) {
  const sectorName = decodeURIComponent(params.sector)

  return <SectorDetailClient sectorName={sectorName} />
}