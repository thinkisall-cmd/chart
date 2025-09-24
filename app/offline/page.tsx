"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  if (isOnline) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">오프라인 상태</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            인터넷 연결을 확인할 수 없습니다. 
            연결이 복구되면 자동으로 데이터를 동기화합니다.
          </p>
          
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full" disabled={!isOnline}>
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                홈으로 이동
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground mt-6">
            <p>💡 이 앱은 PWA로 제작되어 오프라인에서도 기본 기능을 사용할 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
