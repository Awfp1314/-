import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function App() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // 目标时间：2025年11月23日 09:00:00
      const targetDate = new Date(2025, 10, 23, 9, 0, 0); // 月份从0开始，10表示11月
      const difference = targetDate - now;
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setCountdown(calculateTimeLeft());
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Clock className="w-24 h-24 text-white animate-pulse" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-12 tracking-tight">
          实践考试倒计时
        </h1>
        
        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <div className="text-6xl md:text-8xl font-bold text-white mb-2">
              {countdown.days}
            </div>
            <div className="text-xl md:text-2xl text-white/80 font-medium">
              天
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <div className="text-6xl md:text-8xl font-bold text-white mb-2">
              {countdown.hours}
            </div>
            <div className="text-xl md:text-2xl text-white/80 font-medium">
              时
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <div className="text-6xl md:text-8xl font-bold text-white mb-2">
              {countdown.minutes}
            </div>
            <div className="text-xl md:text-2xl text-white/80 font-medium">
              分
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <div className="text-6xl md:text-8xl font-bold text-white mb-2">
              {countdown.seconds}
            </div>
            <div className="text-xl md:text-2xl text-white/80 font-medium">
              秒
            </div>
          </div>
        </div>
        
        <p className="mt-12 text-2xl md:text-3xl text-white/90 font-medium">
          2025年11月23日 上午9:00
        </p>
      </div>
    </div>
  );
}
