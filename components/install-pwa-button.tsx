'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    const checkIfStandalone = () => {
      if (typeof window !== 'undefined') {
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone ||
          document.referrer.includes('android-app://');
        setIsStandalone(isStandaloneMode);
      }
    };

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // 기본 브라우저 설치 프롬프트 방지
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // 사용자가 이전에 배너를 닫지 않았다면 표시
      const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!bannerDismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000); // 3초 후 표시
      }
    };

    // PWA 설치 완료 이벤트
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallBanner(false);
      console.log('PWA가 성공적으로 설치되었습니다!');
    };

    checkIfStandalone();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled);

      // 개발 환경에서 테스트를 위한 강제 설정
      const isDev = process.env.NODE_ENV === 'development' || location.hostname === 'localhost';

      if (isDev && !isStandalone) {
        console.log('개발 환경에서 PWA 배너 테스트 모드 활성화');
        setTimeout(() => {
          setIsInstallable(true);

          // 배너가 이전에 닫히지 않았다면 표시
          const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
          if (!bannerDismissed) {
            setShowInstallBanner(true);
          }
        }, 3000); // 3초 후 표시
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // 개발 모드에서는 알림만 표시
      alert('개발 모드에서는 실제 설치가 불가능합니다.\n배포된 HTTPS 사이트에서 테스트해주세요!');
      return;
    }

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 응답 대기
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('사용자가 PWA 설치를 승인했습니다.');
    } else {
      console.log('사용자가 PWA 설치를 거부했습니다.');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
    setShowInstallBanner(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // 이미 설치된 경우 아무것도 표시하지 않음
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* 설치 가능한 경우 헤더 버튼 */}
      {isInstallable && !showInstallBanner && (
        <Button
          onClick={handleInstallClick}
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          앱 설치
        </Button>
      )}

      {/* 설치 배너 */}
      {showInstallBanner && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg sm:left-auto sm:right-4 sm:max-w-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                  앱으로 설치하기 📱
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  홈 화면에 추가하고 빠르게 접근하세요
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="text-xs px-3 py-1 h-7"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    설치
                  </Button>
                  <Button
                    onClick={dismissBanner}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 py-1 h-7 text-gray-500"
                  >
                    나중에
                  </Button>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 모바일에서는 간단한 플로팅 버튼 */}
      {isInstallable && !showInstallBanner && (
        <button
          onClick={() => setShowInstallBanner(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors sm:hidden z-40"
          aria-label="앱 설치"
        >
          <Download className="h-5 w-5" />
        </button>
      )}
    </>
  );
}