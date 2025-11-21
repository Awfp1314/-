import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import * as api from './apiClient.js';

// 通知/消息组件
export const NotificationMenu = React.memo(({ currentUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 从API加载通知
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const result = await api.getAllNotifications();
    if (result.success) {
      setNotifications(result.notifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    }
  };

  // 订阅实时通知
  useEffect(() => {
    const unsubscribe = api.subscribeWebSocket('NEW_NOTIFICATION', (notification) => {
      setNotifications(prev => {
        // 检查是否已经存在（防止重复）
        if (prev.some(n => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });
    });

    return unsubscribe;
  }, []);
  const menuRef = useRef(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 暂时禁用自动刷新功能，防止消息重复
  // 用户可以通过刷新页面来获取新消息

  // 未读消息数量
  const unreadCount = notifications.filter(n => !n.read).length;

  // 标记为已读
  const markAsRead = async (id) => {
    const result = await api.markNotificationAsRead(id);
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  // 删除通知
  const deleteNotification = async (id) => {
    const result = await api.deleteNotification(id);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // 标记全部已读
  const markAllAsRead = async () => {
    // 批量标记
    await Promise.all(
      notifications.filter(n => !n.read).map(n => api.markNotificationAsRead(n.id))
    );
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // 清空所有通知
  const clearAll = async () => {
    await Promise.all(notifications.map(n => api.deleteNotification(n.id)));
    setNotifications([]);
  };

  // 格式化时间
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString();
  };

  // 获取图标
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
        title="消息通知"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* 头部 */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">消息通知</h3>
              <p className="text-xs text-slate-500">{unreadCount} 条未读</p>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  全部已读
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">暂无消息</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      !notification.read ? 'bg-indigo-50/50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${
                              !notification.read ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {notification.fromAdmin && (
                                <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold mr-2">
                                  👑 管理员回复
                                </span>
                              )}
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
                              )}
                            </h4>
                            {notification.isReply && notification.originalTitle && (
                              <p className="text-xs text-slate-500 mt-1 bg-slate-100 px-2 py-1 rounded">
                                回复：{notification.originalTitle}
                              </p>
                            )}
                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              {formatTime(notification.time)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部 */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowMenu(false)}
                className="text-sm text-slate-600 hover:text-indigo-600 font-medium"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
