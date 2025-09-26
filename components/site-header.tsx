'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function SiteHeader() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [debugInfo, setDebugInfo] = useState('초기화 중...');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('SiteHeader 마운트됨');

      // 개발 환경에서는 항상 설치 버튼 표시
      const isDev = process.env.NODE_ENV === 'development' || location.hostname === 'localhost';

      if (isDev) {
        console.log('개발 환경 감지 - 설치 버튼 강제 표시');
        setShowInstallButton(true);
        setDebugInfo('개발 모드');
      } else {
        setDebugInfo('프로덕션 모드');
      }

      // PWA가 이미 설치되어 있는지 확인
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        console.log('PWA가 이미 설치됨');
        setShowInstallButton(false);
        setDebugInfo('이미 설치됨');
      }
    }
  }, []);

  const handleInstallClick = () => {
    alert('개발 모드에서는 실제 설치가 불가능합니다.\n\nPWA 설치는 다음 조건에서 가능합니다:\n- HTTPS 환경\n- Service Worker 등록됨\n- Web App Manifest 파일 존재\n\n배포된 사이트에서 테스트해주세요!');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold">다모아봄</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {/* 디버그 정보 */}
          <span className="text-xs text-gray-500 hidden lg:inline">
            {debugInfo}
          </span>

          {/* PWA 설치 버튼 */}
          {showInstallButton && (
            <Button
              onClick={handleInstallClick}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-xs"
            >
              <Download className="h-3 w-3" />
              앱 설치
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}