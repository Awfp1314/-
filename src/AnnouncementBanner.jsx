import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import * as api from './apiClient.js';

export const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);

  // 加载公告
  useEffect(() => {
    loadAnnouncement();
  }, []);

  // 订阅公告更新
  useEffect(() => {
    const unsubscribe = api.subscribeWebSocket('ANNOUNCEMENT_UPDATED', (data) => {
      setAnnouncement(data.announcement);
    });

    return unsubscribe;
  }, []);

  const loadAnnouncement = async () => {
    const result = await api.getAnnouncement();
    if (result.success && result.announcement) {
      setAnnouncement(result.announcement);
    }
  };

  // 如果公告未启用，不显示
  if (!announcement || !announcement.enabled) {
    return null;
  }

  // 拼接完整公告文本
  const fullText = announcement.title 
    ? `【${announcement.title}】${announcement.content}`
    : announcement.content;

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg overflow-hidden">
      <div className="flex items-center py-3 px-4">
        {/* 喇叭图标 */}
        <Megaphone className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" />
        
        {/* 滚动文字容器 */}
        <div className="flex-1 overflow-hidden">
          <div className="announcement-scroll">
            <span className="inline-block whitespace-nowrap text-sm font-medium">
              {fullText}
            </span>
          </div>
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .announcement-scroll {
          display: inline-block;
          animation: scroll-left 20s linear infinite;
        }

        .announcement-scroll:hover {
          animation-play-state: paused;
        }

        /* 如果文字较短，不需要滚动 */
        @media (min-width: 768px) {
          .announcement-scroll span {
            display: inline-block;
          }
        }
      `}</style>
    </div>
  );
};
