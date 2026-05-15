import { useState, useRef, useEffect } from 'react';
import { Bell, Package, Wrench, Check, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isConnected,
    markAllRead, 
    markOneRead,
    clearAll 
  } = useNotificationStore();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setIsOpen(prev => !prev);
    if (!isOpen && unreadCount > 0) {
      setTimeout(markAllRead, 1500);
    }
  };

  const handleNotificationClick = (notification) => {
    markOneRead(notification._id);
    setIsOpen(false);
    // Navigate to relevant order
    if (notification.type === 'SERVICE') {
      navigate('/print-orders'); // Corrected path based on App.jsx routes
    } else {
      navigate(`/orders/${notification.id}`);
    }
  };

  const formatTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl bg-[#f5e7d8] 
                   hover:bg-[#f0d9c4] transition-all duration-200
                   hover:scale-105 active:scale-95 group">
        
        <Bell className={`w-5 h-5 text-[#5b3f2f] transition-all
          ${unreadCount > 0 ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 
                           bg-[#d96a22] text-white text-[10px] 
                           font-bold rounded-full flex items-center 
                           justify-center shadow-md animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Live connection dot */}
        <span className={`absolute bottom-1.5 right-1.5 w-2 h-2 
                         rounded-full border border-white
                         ${isConnected 
                           ? 'bg-green-500' 
                           : 'bg-gray-400'}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 
                        bg-[#fffdfb] rounded-2xl shadow-2xl 
                        border border-[#f5e7d8] z-50
                        animate-[fadeSlideDown_0.2s_ease-out] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between 
                          px-4 py-3 border-b border-[#f5e7d8]">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#5b3f2f] text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-[#d96a22] text-white text-[10px] 
                                 font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    title="Mark all read"
                    className="p-1.5 rounded-lg hover:bg-[#f5e7d8] 
                               text-[#5b3f2f]/50 hover:text-[#5b3f2f]
                               transition-all duration-150">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={clearAll}
                    title="Clear all"
                    className="p-1.5 rounded-lg hover:bg-[#f5e7d8] 
                               text-[#5b3f2f]/50 hover:text-[#5b3f2f]
                               transition-all duration-150">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#f5e7d8]
                           text-[#5b3f2f]/50 transition-all duration-150">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center 
                              py-10 text-center px-4">
                <div className="w-12 h-12 bg-[#f5e7d8] rounded-full 
                                flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-[#b88a2f]" />
                </div>
                <p className="text-sm font-semibold text-[#5b3f2f]">
                  No notifications yet
                </p>
                <p className="text-xs text-[#5b3f2f]/50 mt-1">
                  New orders will appear here instantly
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 
                    hover:bg-[#f5e7d8] transition-all duration-150 
                    border-b border-[#f5e7d8]/50 last:border-0 text-left
                    ${!notif.read ? 'bg-[#b88a2f]/5' : ''}`}>
                  
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl 
                    flex items-center justify-center mt-0.5
                    ${notif.type === 'SERVICE' 
                      ? 'bg-[#b88a2f]/15' 
                      : 'bg-[#5b3f2f]/10'}`}>
                    {notif.type === 'SERVICE' 
                      ? <Wrench className="w-4 h-4 text-[#b88a2f]" />
                      : <Package className="w-4 h-4 text-[#5b3f2f]" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#5b3f2f] 
                                    truncate">
                        {notif.type === 'SERVICE' 
                          ? '🔧 New Service Order' 
                          : '📦 New Order'}
                      </p>
                      {!notif.read && (
                        <span className="flex-shrink-0 w-2 h-2 
                                         bg-[#d96a22] rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-[#5b3f2f]/70 mt-0.5 
                                  truncate">
                      {notif.customerName} — ₹{notif.amount}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] font-mono text-[#b88a2f]">
                        #{notif.orderNumber}
                      </p>
                      <p className="text-[10px] text-[#5b3f2f]/40">
                        {formatTime(notif.receivedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[#f5e7d8]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/orders');
                }}
                className="w-full text-center text-xs font-semibold 
                           text-[#b88a2f] hover:text-[#5b3f2f] 
                           transition-colors duration-150">
                View all orders →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
