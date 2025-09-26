"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function SiteHeader() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [debugInfo, setDebugInfo] = useState("초기화 중...");

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("SiteHeader 마운트됨");

      // PWA가 이미 설치되어 있는지 확인
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      if (isStandalone) {
        console.log("PWA가 이미 설치됨");
        setShowInstallButton(false);
        setDebugInfo("이미 설치됨");
        return;
      }

      // beforeinstallprompt 이벤트 리스너
      const handleBeforeInstallPrompt = (e: any) => {
        console.log("beforeinstallprompt 이벤트 발생!", e);
        e.preventDefault();
        setShowInstallButton(true);
        setDebugInfo("설치 가능");

        // 전역적으로 저장
        (window as any).deferredPrompt = e;
      };

      // PWA 설치 완료 이벤트
      const handleAppInstalled = () => {
        console.log("PWA 설치 완료!");
        setShowInstallButton(false);
        setDebugInfo("설치 완료");
        (window as any).deferredPrompt = null;
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // PWA 조건 확인
      const checkPWAConditions = () => {
        const hasServiceWorker = 'serviceWorker' in navigator;
        const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
        const hasManifest = document.querySelector('link[rel="manifest"]');

        console.log('PWA 조건 확인:', {
          hasServiceWorker,
          isHTTPS,
          hasManifest: !!hasManifest
        });

        setDebugInfo(`조건: SW=${hasServiceWorker} HTTPS=${isHTTPS} MF=${!!hasManifest}`);

        // PWA 조건이 충족되면 일정 시간 후 버튼 표시 (beforeinstallprompt 이벤트가 안 올 경우 대비)
        if (hasServiceWorker && isHTTPS && hasManifest) {
          const delay = location.hostname === 'localhost' ? 2000 : 3000;
          setTimeout(() => {
            if (!(window as any).deferredPrompt) {
              console.log('beforeinstallprompt 이벤트가 없어서 강제 표시');
              setShowInstallButton(true);
              setDebugInfo('설치 가능');
            }
          }, delay);
        }
      };

      checkPWAConditions();

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    const deferredPrompt = (window as any).deferredPrompt;

    if (!deferredPrompt) {
      // 더 쉬운 설치 안내
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('chrome') || userAgent.includes('edge')) {
        alert('📱 간편 설치!\n\n🔍 주소창 맨 오른쪽을 보세요!\n"설치" 아이콘을 클릭하면 바로 앱 설치됩니다!');
      } else if (userAgent.includes('safari')) {
        alert('📱 Safari 설치\n\n📤 공유 버튼 → "홈 화면에 추가" 선택!');
      } else {
        alert('📱 앱 설치\n\n브라우저 메뉴에서 "앱 설치"를 찾으세요!');
      }
      return;
    }

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt();

      // 사용자 응답 대기
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`PWA 설치 결과: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 승인했습니다.');
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다.');
      }

      // 설치 프롬프트 정리
      (window as any).deferredPrompt = null;
      setShowInstallButton(false);

    } catch (error) {
      console.error('PWA 설치 오류:', error);
      alert('PWA 설치 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold">DMAB</span>
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
              size="sm"
              className="hidden sm:flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white border-0 animate-pulse hover:animate-none"
            >
              <Download className="h-3 w-3" />무료 앱 설치
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
