"use client";

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    // 客户端获取随机图片，避免 CSS url() 重定向问题
    fetch('/api/random?redirect=false')
      .then(res => res.json())
      .then(data => {
        if (data.url) setBgUrl(data.url);
      })
      .catch(() => {
        // 回退到直接使用 API
        setBgUrl('/api/random');
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center overflow-hidden">
      {/* Background with blur effect */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_50%,#111_0%,#050505_100%)]">
        {bgUrl && (
          <div 
            className="absolute inset-0 opacity-20 blur-[20px] scale-110 animate-pulse transition-opacity duration-1000"
            style={{
              backgroundImage: `url("${bgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>

      <main className="text-center max-w-[600px] p-8">
        <h1 className="text-6xl font-extrabold tracking-tighter mb-4 bg-gradient-to-b from-white to-[#888] bg-clip-text text-transparent">
          Random Picture
        </h1>
        <p className="text-[#666] text-lg font-light mb-12">
          智能识别设备类型，极速分发每一张精选画作。
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href="/api/random" 
            className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] transition-all no-underline"
          >
            获取图片
          </a>
          <a 
            href="/gallery" 
            className="border border-white/10 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-white/5 hover:border-white/30 transition-all no-underline"
          >
            浏览图库
          </a>
        </div>
      </main>

      <div className="fixed bottom-8 text-[0.75rem] text-[#333] tracking-[0.1em] uppercase">
        © 2024 <a href="https://tianhw.top" target="_blank" className="text-inherit no-underline">THW</a> | 
        <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="text-inherit no-underline"> GitHub</a> | 
        Powered by EdgeOne
      </div>

      <style jsx global>{`
        @keyframes pulse {
          from { transform: scale(1); opacity: 0.1; }
          to { transform: scale(1.1); opacity: 0.2; }
        }
        .animate-pulse {
          animation: pulse 10s infinite alternate;
        }
      `}</style>
    </div>
  );
}
