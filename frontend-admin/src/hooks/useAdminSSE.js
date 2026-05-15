import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAdminStore } from '../App';

export const useAdminSSE = () => {
  const eventSourceRef = useRef(null);
  const reconnectTimer = useRef(null);
  const { addNotification, setConnected } = useNotificationStore();
  const { user } = useAdminStore();

  const connect = () => {
    // Only connect if user is admin/super_admin
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
    if (eventSourceRef.current) return; // already connected

    const apiBase = import.meta.env.VITE_API_BASE_URL || 
                    'https://api.photowalagift.online';

    // SSE requires credentials (cookies for session)
    // Note: EventSource doesn't support custom headers (like X-CSRF-Token)
    // But it does support withCredentials: true for cookies.
    eventSourceRef.current = new EventSource(
      `${apiBase}/api/notifications/stream`,
      { withCredentials: true }
    );

    eventSourceRef.current.addEventListener('connected', () => {
      setConnected(true);
      console.log('[SSE] Admin notifications connected');
      // Clear any pending reconnect
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    });

    eventSourceRef.current.addEventListener('new_order', (e) => {
      try {
        const data = JSON.parse(e.data);
        addNotification(data);
        // Play a subtle notification sound
        playNotificationSound();
      } catch (err) {
        console.error('[SSE] Error parsing notification data:', err);
      }
    });

    eventSourceRef.current.onerror = (e) => {
      console.error('[SSE] Connection error:', e);
      setConnected(false);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      // Reconnect after 5 seconds
      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [user]);

  return { connect, disconnect };
};

// Subtle notification sound using Web Audio API (no file needed)
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(520, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch { /* ignore if audio not available */ }
};
