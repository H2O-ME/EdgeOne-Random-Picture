"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomeClient({ images }) {
  const [bgUrl, setBgUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    document.body.style.overflow = 'hidden';
    
    const allImages = [...(images.pc || []), ...(images.mobile || [])];
    if (allImages.length > 0) {
      const randomImg = allImages[Math.floor(Math.random() * allImages.length)];
      const url = `/images/${randomImg.src}`;
      
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setBgUrl(url);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setBgUrl('/api/random');
        setIsLoaded(true);
      };
    } else {
      setBgUrl('/api/random');
      setIsLoaded(true);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [images]);

  return (
    <div className="relative h-[100dvh] w-full bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-white flex items-center justify-center overflow-hidden transition-colors duration-500">
      {/* Theme Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 transition-opacity duration-1500 ease-in-out" style={{ opacity: isLoaded ? 1 : 0 }}>
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 z-10 backdrop-blur-[3px]" />
        {bgUrl && (
          <div 
            className="absolute inset-0 animate-slow-zoom"
            style={{
              backgroundImage: `url("${bgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>

      {/* Content Area */}
      <main className="relative z-20 w-full max-w-[600px] px-8 flex flex-col items-center">
        <div className="text-center animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-thin tracking-[0.2em] mb-4 uppercase text-white drop-shadow-2xl">
            随机图片
          </h1>
          <p className="text-sm md:text-base font-light tracking-[0.5em] text-white/90 mb-16 uppercase drop-shadow-lg shadow-black">
            Random picture
          </p>
          
          <div className="flex flex-col items-center space-y-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <code className="block text-[10px] md:text-xs tracking-[0.1em] text-white/80 font-mono shadow-sm lowercase">
                  {origin ? `${origin}/api/random` : '/api/random'}
                </code>
                <div className="h-px w-8 bg-white/50 mx-auto" />
              </div>
              
              <div className="flex flex-col gap-2 text-[9px] md:text-[10px] tracking-[0.15em] text-white/60 font-light lowercase drop-shadow-md">
                <p>指定类型: ?type=[pc|mobile]</p>
                <p>指定格式: ?format=[webp|png|jpeg]</p>
                <p>分类路由: /api/random/[分类名]</p>
                <p>json 格式: ?redirect=false</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center text-white">
              <a 
                href="/api/random" 
                className="text-sm tracking-[0.3em] uppercase hover:text-white/60 transition-colors py-2 border-b border-transparent hover:border-white/20"
              >
                随机一张
              </a>
              
              <Link 
                href="/gallery" 
                className="text-sm tracking-[0.3em] uppercase hover:text-white/60 transition-colors py-2 border-b border-transparent hover:border-white/60"
              >
                图片库
              </Link>

              <Link 
                href="/video-gallery" 
                className="text-sm tracking-[0.3em] uppercase hover:text-white/60 transition-colors py-2 border-b border-transparent hover:border-white/60"
              >
                视频库
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-white">
          <a href="https://v-blog.halei0v0.top" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">halei0v0</a>
        </div>
        <div className="text-[9px] text-white/30 font-medium">
          © {new Date().getFullYear()} Powered by Vercel Pages
        </div>
      </footer>
    </div>
  );
}
