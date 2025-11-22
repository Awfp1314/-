import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function App() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // 目标时间:2025年11月23日 09:00:00
      const targetDate = new Date(2025, 10, 23, 9, 0, 0); // 月份从0开始,10表示11月
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-3 sm:p-4">
      <div className="text-center w-full max-w-5xl px-2">
        <div className="mb-6 sm:mb-8 flex justify-center">
          <Clock className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-white animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 md:mb-12 tracking-tight">
          实践考试倒计时
        </h1>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20 shadow-2xl">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-1 sm:mb-2">
              {countdown.days}
            </div>
            <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-white/80 font-medium">
              天
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20 shadow-2xl">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-1 sm:mb-2">
              {countdown.hours}
            </div>
            <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-white/80 font-medium">
              时
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20 shadow-2xl">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-1 sm:mb-2">
              {countdown.minutes}
            </div>
            <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-white/80 font-medium">
              分
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20 shadow-2xl">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-1 sm:mb-2">
              {countdown.seconds}
            </div>
            <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-white/80 font-medium">
              秒
            </div>
          </div>
        </div>

        <p className="mt-6 sm:mt-8 md:mt-12 text-base sm:text-lg md:text-2xl lg:text-3xl text-white/90 font-medium">
          2025年11月23日 上午9:00
        </p>
      </div>
    </div>
  );
}
