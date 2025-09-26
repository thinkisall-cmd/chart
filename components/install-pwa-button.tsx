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
      console.log('🎉 beforeinstallprompt 이벤트 발생!', e);
      // 기본 브라우저 설치 프롬프트 방지
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // 사용자가 이전에 배너를 닫지 않았다면 표시
      const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!bannerDismissed) {
        setTimeout(() => setShowInstallBanner(true), 2000); // 2초 후 표시 (더 빠르게)
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

      if (!isStandalone) {
        // PWA 조건 확인 후 배너 표시
        const checkPWAConditions = () => {
          const hasServiceWorker = 'serviceWorker' in navigator;
          const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
          const hasManifest = document.querySelector('link[rel="manifest"]');

          console.log('🔍 PWA 조건 확인:', {
            hasServiceWorker,
            isHTTPS,
            hasManifest: !!hasManifest,
            protocol: location.protocol,
            hostname: location.hostname,
            manifestHref: hasManifest?.getAttribute('href')
          });

          if (hasServiceWorker && isHTTPS && hasManifest) {
            // 개발환경에서는 빠르게, 프로덕션에서도 빠르게 표시
            const delay = location.hostname === 'localhost' ? 2000 : 4000;
            setTimeout(() => {
              if (!(window as any).deferredPrompt) {
                console.log('PWA 조건 충족 - 배너 강제 표시');
                setIsInstallable(true);

                const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
                if (!bannerDismissed) {
                  setShowInstallBanner(true);
                }
              }
            }, delay);
          }
        };

        checkPWAConditions();
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const showEasyInstallGuide = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    // 디버깅 정보 추가
    console.log('PWA 설치 디버깅:', {
      deferredPrompt: !!deferredPrompt,
      isInstallable,
      userAgent,
      isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
      hasServiceWorker: 'serviceWorker' in navigator,
      hasManifest: !!document.querySelector('link[rel="manifest"]')
    });

    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      // 주소창 설치 아이콘을 강조해서 안내
      alert('📱 설치 프롬프트가 없습니다!\n\n🔍 주소창을 확인하세요!\n주소창 맨 오른쪽에 "설치" 아이콘(📱)이 보이면 클릭하세요.\n\n💡 만약 아이콘이 없다면:\n- 페이지를 새로고침해보세요\n- 몇 초 더 기다려보세요\n- 개발자도구 Console 탭을 확인해보세요');
    } else if (userAgent.includes('safari')) {
      alert('📱 iPhone/iPad 앱 설치\n\n1. 📤 화면 아래 공유 버튼 터치\n2. 📋 "홈 화면에 추가" 선택\n3. ✅ "추가" 버튼 터치\n\n💡 설치 후 홈 화면에서 일반 앱처럼 사용 가능!');
    } else if (userAgent.includes('firefox')) {
      alert('📱 Firefox 앱 설치\n\n1. 🏠 홈 아이콘 옆 "..." 메뉴 클릭\n2. 📱 "이 사이트 설치" 선택\n3. ✅ "설치" 버튼 클릭');
    } else {
      alert('📱 앱으로 설치하기\n\n브라우저 메뉴에서\n"앱 설치" 또는 "홈 화면에 추가"를 찾으세요!\n\n💡 설치하면 더 빠르고 편리하게 이용할 수 있어요!');
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showEasyInstallGuide();
      return;
    }

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt();

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

    } catch (error) {
      console.error('PWA 설치 오류:', error);
      alert('PWA 설치 중 오류가 발생했습니다.');
    }
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
                  🚀 앱으로 더 빠르게!
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  홈 화면에서 바로 실행 • 오프라인 사용 가능 • 알림 지원
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="text-xs px-3 py-1 h-7 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    무료 설치
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

      {/* 모바일에서는 더 눈에 띄는 플로팅 버튼 */}
      {isInstallable && !showInstallBanner && (
        <button
          onClick={() => setShowInstallBanner(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transform transition-all duration-300 sm:hidden z-40 animate-bounce"
          aria-label="앱 설치"
        >
          <Download className="h-5 w-5" />
        </button>
      )}
    </>
  );
}