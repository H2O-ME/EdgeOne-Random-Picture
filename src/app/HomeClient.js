"use client";

import { useState, useEffect } from 'react';

export default function HomeClient() {
  const [bgUrl, setBgUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 客户端随机选择，移除对 SSR 的依赖
    fetch('/api/random?redirect=false')
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          const img = new Image();
          img.src = data.url;
          img.onload = () => {
            setBgUrl(data.url);
            setIsLoaded(true);
          };
        }
      })
      .catch(() => {
        setBgUrl('/api/random');
        setIsLoaded(true);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex items-center justify-center overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: isLoaded ? 1 : 0 }}>
        <div className="absolute inset-0 bg-black/40 z-10" />
        {bgUrl && (
          <div 
            className="absolute inset-0 scale-105 animate-slow-zoom"
            style={{
              backgroundImage: `url("${bgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px) brightness(0.8)',
            }}
          />
        )}
      </div>

      {/* Content Card */}
      <main className="relative z-20 text-center px-6 py-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl max-w-[500px] w-[90%] animate-in fade-in zoom-in duration-700">
        <div className="mb-8 inline-block">
          <div className="w-16 h-16 bg-gradient-to-tr from-white/20 to-white/5 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
          Random Pic
        </h1>
        
        <p className="text-white/50 text-base font-medium mb-10 leading-relaxed">
          极简、极速、极美。<br/>
          智能识别设备，分发每一张精选画作。
        </p>

        <div className="flex flex-col gap-3">
          <a 
            href="/api/random" 
            className="group relative overflow-hidden bg-white text-black py-4 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] no-underline"
          >
            <span className="relative z-10">随机一张</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </a>
          
          <a 
            href="/gallery" 
            className="bg-white/10 text-white py-4 rounded-2xl text-sm font-bold border border-white/10 backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/20 no-underline"
          >
            浏览图库
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase">
          <a href="https://tianhw.top" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">THW</a>
          <span className="w-1 h-1 bg-white/30 rounded-full" />
          <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">GitHub</a>
        </div>
        <div className="text-[9px] text-white/30 font-medium">Powered by EdgeOne Pages</div>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}
