"use client";

import { useState } from 'react';

export default function HomeClient({ initialBgUrl }) {
  const [bgUrl, setBgUrl] = useState(initialBgUrl);

  return (
    <div className="relative min-h-screen text-white font-sans flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background with blur effect */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#111_0%,#050505_100%)]" />
        {bgUrl && (
          <div 
            className="absolute inset-0 opacity-70 blur-[4px] scale-110 animate-bg-pulse transition-opacity duration-1000"
            style={{
              backgroundImage: `url("${bgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>

      <main className="text-center max-w-[600px] p-8 z-10">
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

      <div className="fixed bottom-8 text-[0.75rem] text-[#333] tracking-[0.1em] uppercase z-10">
        © 2024 <a href="https://tianhw.top" target="_blank" className="text-inherit no-underline">THW</a> | 
        <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="text-inherit no-underline"> GitHub</a> | 
        Powered by EdgeOne
      </div>

      <style jsx global>{`
        @keyframes bg-pulse {
          from { transform: scale(1.05); opacity: 0.4; }
          to { transform: scale(1.15); opacity: 0.7; }
        }
        .animate-bg-pulse {
          animation: bg-pulse 15s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}
