import SectorDetailClient from './SectorDetailClient'

// Static params generation for static export
export async function generateStaticParams() {
  const sectors = [
    "DeFi", "GameFi", "NFT", "Layer 1", "Layer 2", "Meme", "AI",
    "Storage", "Oracle", "Privacy", "Social", "Exchange Token",
    "Stablecoin", "Wrapped Token", "Metaverse", "Web3"
  ];

  return sectors.map((sector) => ({
    sector: encodeURIComponent(sector)
  }));
}

export default function SectorDetail({ params }: { params: { sector: string } }) {
  const sectorName = decodeURIComponent(params.sector)

  return <SectorDetailClient sectorName={sectorName} />
}