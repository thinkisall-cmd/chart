// 로컬스토리지 기반 트레이딩 알림 유틸리티 함수

export interface WatchlistItem {
  id: string;
  ticker: string;
  description: string;
  rsiThreshold: number;
  createdAt: string;
  isActive: boolean;
}

export interface AlertItem {
  id: string;
  ticker: string;
  time: string;
  rsi: number;
  price: number;
  message: string;
  isRead: boolean;
}

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  WATCHLIST: 'trading-watchlist',
  ALERTS: 'trading-alerts',
  SETTINGS: 'trading-settings'
} as const;

// 관심 종목 관리
export class WatchlistStorage {
  static getAll(): WatchlistItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
  }

  static save(watchlist: WatchlistItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }

  static add(item: Omit<WatchlistItem, 'id' | 'createdAt'>): WatchlistItem {
    const newItem: WatchlistItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const watchlist = this.getAll();
    const updatedWatchlist = [...watchlist, newItem];
    this.save(updatedWatchlist);
    return newItem;
  }

  static remove(id: string): void {
    const watchlist = this.getAll();
    const updatedWatchlist = watchlist.filter(item => item.id !== id);
    this.save(updatedWatchlist);
  }

  static update(id: string, updates: Partial<WatchlistItem>): void {
    const watchlist = this.getAll();
    const updatedWatchlist = watchlist.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.save(updatedWatchlist);
  }

  static findByTicker(ticker: string): WatchlistItem | null {
    const watchlist = this.getAll();
    return watchlist.find(item => item.ticker.toLowerCase() === ticker.toLowerCase()) || null;
  }
}

// 알림 관리
export class AlertStorage {
  static getAll(): AlertItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static save(alerts: AlertItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }

  static add(item: Omit<AlertItem, 'id' | 'isRead'>): AlertItem {
    const newAlert: AlertItem = {
      ...item,
      id: Date.now().toString(),
      isRead: false,
    };

    const alerts = this.getAll();
    const updatedAlerts = [newAlert, ...alerts];

    // 최대 500개 알림만 보관 (성능 최적화)
    if (updatedAlerts.length > 500) {
      updatedAlerts.splice(500);
    }

    this.save(updatedAlerts);
    return newAlert;
  }

  static markAsRead(id: string): void {
    const alerts = this.getAll();
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, isRead: true } : alert
    );
    this.save(updatedAlerts);
  }

  static markAllAsRead(): void {
    const alerts = this.getAll();
    const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }));
    this.save(updatedAlerts);
  }

  static getRecent(limit: number = 50): AlertItem[] {
    const alerts = this.getAll();
    return alerts
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  }

  static getUnreadCount(): number {
    const alerts = this.getAll();
    return alerts.filter(alert => !alert.isRead).length;
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
  }
}

// 설정 관리
export interface TradingSettings {
  webhookToken: string;
  slackWebhookUrl?: string;
  notificationEnabled: boolean;
  soundEnabled: boolean;
}

export class SettingsStorage {
  static get(): TradingSettings {
    if (typeof window === 'undefined') {
      return {
        webhookToken: '',
        notificationEnabled: true,
        soundEnabled: true
      };
    }

    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings: TradingSettings = {
      webhookToken: this.generateToken(),
      notificationEnabled: true,
      soundEnabled: true
    };

    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  }

  static save(settings: Partial<TradingSettings>): void {
    if (typeof window === 'undefined') return;
    const currentSettings = this.get();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  }

  private static generateToken(): string {
    return 'tw_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// 브라우저 알림
export class NotificationHelper {
  static async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  static show(title: string, body: string, icon?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'trading-alert'
      });
    }
  }

  static playSound(): void {
    try {
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(() => {
        // 오디오 재생 실패 시 무시 (브라우저 정책에 의해 차단될 수 있음)
      });
    } catch (error) {
      // 오디오 파일이 없거나 오류 발생 시 무시
    }
  }
}

// Slack 알림 (옵션)
export class SlackNotification {
  static async send(webhookUrl: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
      return response.ok;
    } catch (error) {
      console.error('Slack notification failed:', error);
      return false;
    }
  }
}

// 데이터 내보내기/가져오기
export class DataExport {
  static exportData(): string {
    const data = {
      watchlist: WatchlistStorage.getAll(),
      alerts: AlertStorage.getAll(),
      settings: SettingsStorage.get(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.watchlist) {
        WatchlistStorage.save(data.watchlist);
      }

      if (data.alerts) {
        AlertStorage.save(data.alerts);
      }

      if (data.settings) {
        SettingsStorage.save(data.settings);
      }

      return true;
    } catch (error) {
      console.error('Data import failed:', error);
      return false;
    }
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}