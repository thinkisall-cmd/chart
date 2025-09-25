import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.damoabom.com'),
  title: '다모아봄 - 실시간 암호화폐 추적기',
  description: '빗썸 API를 활용한 실시간 암호화폐 가격 추적 및 섹터 분석 서비스. PWA로 모바일에서도 앱처럼 사용 가능합니다.',
  generator: 'NextChart - 다모아봄',
  keywords: '암호화폐, 비트코인, 이더리움, 실시간 가격, 빗썸, 섹터 분석, PWA, 다모아봄',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '다모아봄'
  },
  openGraph: {
    title: '다모아봄 - 실시간 암호화폐 추적기',
    description: '빗썸 API를 활용한 실시간 암호화폐 가격 추적 및 섹터 분석',
    url: 'https://www.damoabom.com',
    siteName: '다모아봄',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '다모아봄 - 실시간 암호화폐 추적기',
    description: '빗썸 API를 활용한 실시간 암호화폐 가격 추적',
    images: ['/icons/icon-512x512.png'],
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#10b981',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        {/* PWA 메타 태그들 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="background-color" content="#0f1419" />
        
        {/* iOS PWA 설정 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="다모아봄" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        
        {/* Android/Chrome PWA 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="다모아봄" />
        
        {/* 기본 파비콘들 */}
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="shortcut icon" href="/icons/icon-72x72.png" />
        
        {/* Windows Tile */}
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="다모아봄 RSS Feed"
          href="/rss.xml"
        />

        {/* Google AdSense */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3000971739024587"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
