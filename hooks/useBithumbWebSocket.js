'use client';
import { useState, useEffect, useRef } from 'react';

export function useBithumbWebSocket(symbols = []) {
  const [data, setData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const websocket = new WebSocket('wss://pubwss.bithumb.com/pub/ws');
      wsRef.current = websocket;

      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;
        
        // ticker 데이터 구독
        if (symbols.length > 0) {
          websocket.send(JSON.stringify({
            type: 'ticker',
            symbols: symbols,
            tickTypes: ['1H']
          }));
        }
      };

      websocket.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.type === 'ticker' && response.content) {
            setData(prev => ({
              ...prev,
              [response.content.symbol]: {
                symbol: response.content.symbol,
                closePrice: response.content.closePrice,
                openPrice: response.content.openPrice,
                highPrice: response.content.highPrice,
                lowPrice: response.content.lowPrice,
                chgRate: response.content.chgRate,
                chgAmt: response.content.chgAmt,
                volume: response.content.volume,
                value: response.content.value,
                prevClosePrice: response.content.prevClosePrice,
                timestamp: Date.now()
              }
            }));
          }
        } catch (err) {
          console.error('WebSocket 메시지 파싱 오류:', err);
        }
      };

      websocket.onclose = (event) => {
        setIsConnected(false);
        
        // 자동 재연결
        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        } else {
          setError('WebSocket 재연결 시도 횟수 초과');
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setError('WebSocket 연결 오류');
      };

    } catch (err) {
      console.error('WebSocket 연결 실패:', err);
      setError('WebSocket 연결 실패');
    }
  };

  useEffect(() => {
    if (symbols.length > 0) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbols.join(',')]);

  const reconnect = () => {
    reconnectCountRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  };

  return { data, isConnected, error, reconnect };
}