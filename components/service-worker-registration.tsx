"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Service Worker 등록
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", {
            scope: "/",
          })
          .then((registration) => {
            console.log("SW registered: ", registration);

            // 업데이트 확인
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      // 새로운 콘텐츠가 사용 가능함을 사용자에게 알림
                      console.log(
                        "새로운 콘텐츠가 사용 가능합니다. 페이지를 새로고침하세요."
                      );

                      // 선택적: 자동으로 페이지 새로고침
                      if (
                        confirm(
                          "새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?"
                        )
                      ) {
                        window.location.reload();
                      }
                    } else {
                      console.log(
                        "콘텐츠가 오프라인에서 사용하기 위해 캐시되었습니다."
                      );
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log("SW registration failed: ", error);
          });
      });

      // Service Worker 메시지 리스너
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SKIP_WAITING") {
          window.location.reload();
        }
      });

      // 온라인/오프라인 상태 모니터링
      const handleOnline = () => {
        console.log("온라인 상태로 변경됨");
        // 백그라운드 동기화 요청
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready
            .then((registration) => {
              // @ts-ignore: sync may not exist in the type definition
              return registration.sync?.register?.("background-sync");
            })
            .catch((error) => {
              console.log("Background sync registration failed:", error);
            });
        }
      };

      const handleOffline = () => {
        console.log("오프라인 상태로 변경됨");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
