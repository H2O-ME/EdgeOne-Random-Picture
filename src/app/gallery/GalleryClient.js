"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import GalleryItem from './GalleryItem';
import ThemeToggle from '@/components/ThemeToggle';

export default function GalleryClient({ initialImages }) {
  const [allImages, setAllImages] = useState(initialImages || []);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const lightboxRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // 进入图库页面启用滚动
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      // 离开时重置（回到首页会再次被 HomeClient 锁定）
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useGSAP(() => {
    if (gridRef.current) {
      // 仅动画化前 24 个元素，避免长列表动画导致的卡顿
      const itemsToAnimate = Array.from(gridRef.current.children).slice(0, 24);
      
      gsap.fromTo(itemsToAnimate,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.02, 
          ease: "power2.out",
          onComplete: () => {
            gsap.set(itemsToAnimate, { clearProps: "transform" });
          }
        }
      );

      // 其余元素直接显示
      if (gridRef.current.children.length > 24) {
        gsap.set(Array.from(gridRef.current.children).slice(24), { opacity: 1 });
      }
    }
  }, { scope: containerRef, dependencies: [allImages] });

  useGSAP(() => {
    if (selectedImage && lightboxRef.current && cardRef.current) {
      // Lightbox 背景动画
      gsap.fromTo(lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      // 卡片弹出动画
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, { dependencies: [selectedImage] });

  const openLightbox = (img) => {
    setSelectedImage(img);
    setCopied(false);
    document.body.style.overflow = 'hidden';
  };

  const copyToClipboard = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
  };

  const closeLightbox = () => {
    if (lightboxRef.current && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: "power2.in"
      });
      gsap.to(lightboxRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setSelectedImage(null);
          document.body.style.overflow = '';
        }
      });
    } else {
      setSelectedImage(null);
      document.body.style.overflow = '';
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-white selection:bg-neutral-200 dark:selection:bg-white/10 relative transition-colors duration-500">
      <header className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center px-8 py-6 pointer-events-none">
        <Link href="/" className="text-sm tracking-[0.4em] uppercase font-light hover:opacity-50 transition-opacity pointer-events-auto">
          Gallery
        </Link>
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-40 font-medium hidden md:block">
            全部图片 · {allImages.length}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main ref={gridRef} className="pt-24 p-2 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] auto-rows-[120px] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:auto-rows-[160px] grid-flow-dense gap-2 pb-20 max-w-[2000px] mx-auto">
        {allImages.map((img, idx) => (
          <GalleryItem 
            key={idx} 
            img={img} 
            idx={idx} 
            onClick={() => openLightbox(img)} 
          />
        ))}
      </main>

      {selectedImage && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 bg-white/95 dark:bg-black/95 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div 
            ref={cardRef}
            className="relative flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden max-w-[95vw] max-h-[90vh] shadow-2xl border border-neutral-200 dark:border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-10 h-10 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/20 text-current rounded-full flex items-center justify-center z-10 transition-colors"
              onClick={closeLightbox}
            >
              ✕
            </button>
            
            <div className="flex-1 bg-neutral-100 dark:bg-black flex items-center justify-center min-w-0">
              <img 
                src={encodeURI(`/images/${selectedImage.src}`)} 
                alt="preview" 
                className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
              />
            </div>

            <div className="w-full md:w-[320px] p-8 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-white/10 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">资源地址</label>
                  <div className="flex flex-col gap-2">
                    <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg break-all font-mono text-[11px] opacity-90 leading-relaxed border border-black/5 dark:border-white/5">
                      {typeof window !== 'undefined' ? new URL(`/images/${selectedImage.src}`, window.location.href).href : `/images/${selectedImage.src}`}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(typeof window !== 'undefined' ? new URL(`/images/${selectedImage.src}`, window.location.href).href : `/images/${selectedImage.src}`)}
                      className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          复制链接
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">分辨率</label>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedImage.width} × {selectedImage.height}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">大小</label>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedImage.size}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">类型</label>
                <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                  {selectedImage.type === 'PC' ? '横屏 (Landscape)' : '竖屏 (Portrait)'}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <a 
                  href={`/images/${selectedImage.src}`} 
                  download 
                  className="flex items-center justify-center gap-2 w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-colors no-underline"
                >
                  保存图片
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="p-12 text-center opacity-40 text-sm border-t border-neutral-200 dark:border-white/5">
        <p>© {new Date().getFullYear()} <a href="https://h-blog.halei0v0.top" target="_blank" className="text-inherit no-underline hover:opacity-100 transition-colors">halei0v0</a>. Powered by Vercel Pages</p>
      </footer>
    </div>
  );
}
