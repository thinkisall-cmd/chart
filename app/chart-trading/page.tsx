"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Plus,
  Trash2,
  TrendingDown,
  Activity,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Upload,
  Settings,
  BellRing,
  Volume2,
  VolumeX,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import { SiteHeader } from "@/components/site-header";
import {
  WatchlistStorage,
  AlertStorage,
  SettingsStorage,
  NotificationHelper,
  DataExport,
  type WatchlistItem,
  type AlertItem,
  type TradingSettings
} from "@/lib/trading-utils";

export default function ChartTradingPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [settings, setSettings] = useState<TradingSettings>({
    webhookToken: '',
    notificationEnabled: true,
    soundEnabled: true
  });

  const [newTicker, setNewTicker] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRsiThreshold, setNewRsiThreshold] = useState(30);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [pineScript, setPineScript] = useState(`//@version=5
indicator("RSI30 하향 돌파 알림", overlay=false)

// 5분봉 RSI
rsiValue = ta.rsi(close, 14)

// 일별 차트 기준 50일·200일 MA
ma50 = request.security(syminfo.tickerid, "D", ta.sma(close, 50))
ma200 = request.security(syminfo.tickerid, "D", ta.sma(close, 200))

plot(rsiValue, title="RSI(14)", color=color.blue)
hline(30, "RSI30", color=color.red)
plot(ma50, title="MA50(D)", color=color.orange)
plot(ma200, title="MA200(D)", color=color.purple)

// RSI 30 하향 돌파 조건
crossDown = ta.crossunder(rsiValue, 30)
alertcondition(crossDown, title="RSI30 하향", message="{{ticker}} RSI가 30 아래로 하향 돌파했습니다.")`);

  // 데이터 로드
  const loadData = useCallback(() => {
    setWatchlist(WatchlistStorage.getAll());
    setAlerts(AlertStorage.getAll());
    setSettings(SettingsStorage.get());
  }, []);

  // 알림 폴링 (실시간 업데이트 시뮬레이션)
  const pollForNewAlerts = useCallback(async () => {
    try {
      // 실제 환경에서는 서버에서 새 알림을 가져오거나 WebSocket 사용
      const currentAlerts = AlertStorage.getAll();
      setAlerts(currentAlerts);

      // 읽지 않은 알림이 있으면 브라우저 알림 표시
      const unreadAlerts = currentAlerts.filter(alert => !alert.isRead);
      if (unreadAlerts.length > 0 && settings.notificationEnabled) {
        const latestAlert = unreadAlerts[0];
        NotificationHelper.show(
          `${latestAlert.ticker} RSI 알림`,
          latestAlert.message
        );

        if (settings.soundEnabled) {
          NotificationHelper.playSound();
        }
      }
    } catch (error) {
      console.error('Alert polling error:', error);
    }
  }, [settings.notificationEnabled, settings.soundEnabled]);

  useEffect(() => {
    loadData();

    // Webhook URL 설정
    setWebhookUrl(`${window.location.origin}/api/trading-alert`);

    // 브라우저 알림 권한 요청
    NotificationHelper.requestPermission();

    // 5초마다 새 알림 확인
    const intervalId = setInterval(pollForNewAlerts, 5000);

    return () => clearInterval(intervalId);
  }, [loadData, pollForNewAlerts]);

  // 관심 종목 관리 함수들
  const addToWatchlist = () => {
    if (!newTicker.trim()) return;

    try {
      WatchlistStorage.add({
        ticker: newTicker.toUpperCase(),
        description: newDescription,
        rsiThreshold: newRsiThreshold,
        isActive: true,
      });

      // 상태 업데이트
      setWatchlist(WatchlistStorage.getAll());

      // 폼 초기화
      setNewTicker("");
      setNewDescription("");
      setNewRsiThreshold(30);
    } catch (error) {
      console.error('Failed to add watchlist item:', error);
    }
  };

  const removeFromWatchlist = (id: string) => {
    try {
      WatchlistStorage.remove(id);
      setWatchlist(WatchlistStorage.getAll());
    } catch (error) {
      console.error('Failed to remove watchlist item:', error);
    }
  };

  const toggleWatchlistItem = (id: string) => {
    try {
      const item = watchlist.find(item => item.id === id);
      if (item) {
        WatchlistStorage.update(id, { isActive: !item.isActive });
        setWatchlist(WatchlistStorage.getAll());
      }
    } catch (error) {
      console.error('Failed to toggle watchlist item:', error);
    }
  };

  // 알림 관리 함수들
  const markAlertAsRead = (id: string) => {
    try {
      AlertStorage.markAsRead(id);
      setAlerts(AlertStorage.getAll());
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const markAllAlertsAsRead = () => {
    try {
      AlertStorage.markAllAsRead();
      setAlerts(AlertStorage.getAll());
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  // 설정 업데이트
  const updateSettings = (newSettings: Partial<TradingSettings>) => {
    try {
      SettingsStorage.save(newSettings);
      setSettings(SettingsStorage.get());
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  // 데이터 내보내기/가져오기
  const exportData = () => {
    try {
      const data = DataExport.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (DataExport.importData(content)) {
          loadData();
          alert('데이터를 성공적으로 가져왔습니다.');
        } else {
          alert('데이터 가져오기에 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('데이터 가져오기에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  // 테스트 알림 추가 (개발/테스트용)
  const addTestAlert = () => {
    try {
      AlertStorage.add({
        ticker: 'BTCUSDT',
        time: new Date().toISOString(),
        rsi: 25.5,
        price: 45000,
        message: '테스트 알림: BTCUSDT RSI가 25.5로 하향 돌파했습니다.'
      });
      setAlerts(AlertStorage.getAll());
    } catch (error) {
      console.error('Failed to add test alert:', error);
    }
  };

  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BackButton />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">차트 트레이딩</h1>
                {unreadAlertsCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadAlertsCount}개 새 알림
                  </Badge>
                )}
              </div>

              {/* 헤더 버튼들 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <label>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTestAlert}
                  className="text-xs"
                >
                  테스트
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              TradingView 알림과 연동하여 RSI 하향 돌파 신호를 실시간으로 받아보세요
            </p>
          </div>

          {/* 설정 패널 */}
          {showSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">알림 설정</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={settings.notificationEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSettings({ notificationEnabled: !settings.notificationEnabled })}
                      >
                        {settings.notificationEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        브라우저 알림
                      </Button>
                      <Button
                        variant={settings.soundEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                      >
                        {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        소리 알림
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Webhook 토큰</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.webhookToken}
                        onChange={(e) => updateSettings({ webhookToken: e.target.value })}
                        className="text-sm"
                        placeholder="자동 생성됨"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(settings.webhookToken)}
                      >
                        복사
                      </Button>
                    </div>
                  </div>

                  {settings.slackWebhookUrl !== undefined && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium">Slack Webhook URL (선택)</Label>
                      <Input
                        value={settings.slackWebhookUrl || ''}
                        onChange={(e) => updateSettings({ slackWebhookUrl: e.target.value })}
                        className="text-sm"
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('모든 데이터를 삭제하시겠습니까?')) {
                        DataExport.clearAllData();
                        loadData();
                      }
                    }}
                    className="text-destructive"
                  >
                    모든 데이터 삭제
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    관심 종목, 알림 내역, 설정이 모두 삭제됩니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Webhook 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                TradingView 연동 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={webhookUrl} readOnly className="text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  >
                    복사
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  TradingView 알림 설정에서 이 URL을 사용하세요
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Pine Script 예시</Label>
                <Textarea
                  value={pineScript}
                  onChange={(e) => setPineScript(e.target.value)}
                  className="text-xs font-mono mt-1"
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  TradingView에서 이 Pine Script를 사용하여 알림을 설정하세요
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 관심 종목 관리 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  관심 종목 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 종목 추가 폼 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">종목 코드</Label>
                    <Input
                      placeholder="예: BTCUSDT"
                      value={newTicker}
                      onChange={(e) => setNewTicker(e.target.value)}
                      className="text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">RSI 기준</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={newRsiThreshold}
                      onChange={(e) => setNewRsiThreshold(Number(e.target.value))}
                      className="text-sm mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">설명 (선택)</Label>
                  <Input
                    placeholder="종목 설명"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="text-sm mt-1"
                  />
                </div>
                <Button onClick={addToWatchlist} className="w-full" size="sm">
                  관심 종목 추가
                </Button>

                {/* 관심 종목 리스트 */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {item.ticker}
                          </span>
                          <Badge
                            variant={item.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            RSI &lt; {item.rsiThreshold}
                          </Badge>
                          {!item.isActive && (
                            <Badge variant="outline" className="text-xs">
                              비활성
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWatchlistItem(item.id)}
                        >
                          {item.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromWatchlist(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {watchlist.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">관심 종목을 추가해보세요</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 실시간 알림 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    실시간 알림
                    {unreadAlertsCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadAlertsCount}
                      </Badge>
                    )}
                  </CardTitle>
                  {unreadAlertsCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAlertsAsRead}
                    >
                      모두 읽음
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {alerts
                    .sort(
                      (a, b) =>
                        new Date(b.time).getTime() - new Date(a.time).getTime()
                    )
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                          !alert.isRead ? "bg-primary/5 border-primary/20" : ""
                        }`}
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span className="font-semibold text-sm">
                                {alert.ticker}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                RSI {alert.rsi}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.time).toLocaleString("ko-KR")}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">아직 알림이 없습니다</p>
                      <p className="text-xs">
                        TradingView에서 알림을 설정하면 여기에 표시됩니다
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 설정 가이드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                TradingView 알림 설정 가이드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm mb-2">1. Pine Script 설정</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>TradingView 차트에서 Pine Editor 열기</li>
                    <li>위의 Pine Script 코드 복사 및 붙여넣기</li>
                    <li>"차트에 추가" 클릭하여 스크립트 적용</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">2. 알림 설정</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>차트 우측 상단 알림(bell) 아이콘 클릭</li>
                    <li>조건: "RSI30 하향" 선택</li>
                    <li>알림 방식: "Webhook URL" 선택</li>
                    <li>위의 Webhook URL 입력</li>
                    <li>메시지 형식을 JSON으로 설정</li>
                  </ol>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Webhook 메시지 예시</h4>
                <pre className="text-xs font-mono text-muted-foreground">
{`{
  "ticker": "{{ticker}}",
  "time": "{{timenow}}",
  "rsi": "{{plot_0}}",
  "price": "{{close}}"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}