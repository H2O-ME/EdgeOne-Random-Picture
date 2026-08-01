"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import GalleryItem from './GalleryItem';
import ThemeToggle from '@/components/ThemeToggle';
import { useScrollLock } from '@/hooks/useScrollLock';

const BATCH_SIZE = 40;

export default function GalleryClient({ initialImages }) {
  // 客户端随机排序，避免服务端非确定性输出影响 SSG 缓存
  const [allImages] = useState(() =>
    [...(initialImages || [])].sort(() => Math.random() - 0.5)
  );
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lightboxImgError, setLightboxImgError] = useState(false);

  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const lightboxRef = useRef(null);
  const cardRef = useRef(null);
  const closeBtnRef = useRef(null);
  const sentinelRef = useRef(null);

  // 统一滚动锁定
  useScrollLock(!!selectedImage);

  // 渐进式加载：监听哨兵元素
  useEffect(() => {
    if (!sentinelRef.current || visibleCount >= allImages.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, allImages.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, allImages.length]);

  useGSAP(() => {
    if (gridRef.current) {
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

      if (gridRef.current.children.length > 24) {
        gsap.set(Array.from(gridRef.current.children).slice(24), { opacity: 1 });
      }
    }
  }, { scope: containerRef, dependencies: [visibleCount] });

  useGSAP(() => {
    if (selectedImage && lightboxRef.current && cardRef.current) {
      gsap.fromTo(lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, { dependencies: [selectedImage] });

  // 键盘操作：Escape 关闭 Lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };

    document.addEventListener('keydown', handleKeyDown);
    // 聚焦关闭按钮（焦点管理）
    closeBtnRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const openLightbox = useCallback((img) => {
    setSelectedImage(img);
    setCopied(false);
    setLightboxImgError(false);
  }, []);

  const closeLightbox = useCallback(() => {
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
        onComplete: () => setSelectedImage(null)
      });
    } else {
      setSelectedImage(null);
    }
  }, []);

  const copyToClipboard = useCallback((text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }, []);

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const visibleImages = allImages.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-white selection:bg-neutral-200 dark:selection:bg-white/10 relative transition-colors duration-500">
      <header className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center px-8 py-6 pointer-events-none">
        <Link href="/" className="text-sm tracking-[0.4em] uppercase font-light hover:opacity-50 transition-opacity pointer-events-auto">
          Gallery
        </Link>
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-40 font-medium hidden md:block" aria-label={`共 ${allImages.length} 张图片`}>
            全部图片 · {allImages.length}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main
        ref={gridRef}
        className="pt-24 p-2 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] auto-rows-[120px] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:auto-rows-[160px] grid-flow-dense gap-2 pb-20 max-w-[2000px] mx-auto"
        role="list"
        aria-label="图片列表"
      >
        {visibleImages.map((img, idx) => (
          <GalleryItem
            key={img.src}
            img={img}
            idx={idx}
            onClick={() => openLightbox(img)}
          />
        ))}
      </main>

      {/* 哨兵元素：触发加载更多 */}
      {visibleCount < allImages.length && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          <span className="text-xs opacity-30 tracking-widest">加载更多...</span>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 bg-white/95 dark:bg-black/95 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
        >
          <div
            ref={cardRef}
            className="relative flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden max-w-[95vw] max-h-[90vh] shadow-2xl border border-neutral-200 dark:border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              className="absolute top-4 right-4 w-10 h-10 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/20 text-current rounded-full flex items-center justify-center z-10 transition-colors"
              onClick={closeLightbox}
              aria-label="关闭预览"
            >
              ✕
            </button>

            <div className="flex-1 bg-neutral-100 dark:bg-black flex items-center justify-center min-w-0">
              {lightboxImgError ? (
                <div className="p-8 text-center text-sm opacity-50">图片加载失败，请稍后重试</div>
              ) : (
                <img
                  src={encodeURI(`/images/${selectedImage.src}`)}
                  alt={`预览: ${selectedImage.src} (${selectedImage.width}×${selectedImage.height})`}
                  className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                  onError={() => setLightboxImgError(true)}
                />
              )}
            </div>

            <div className="w-full md:w-[320px] p-8 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-white/10 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold" id="url-label">资源地址</label>
                  <div className="flex flex-col gap-2">
                    <div
                      className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg break-all font-mono text-[11px] opacity-90 leading-relaxed border border-black/5 dark:border-white/5"
                      aria-labelledby="url-label"
                    >
                      {typeof window !== 'undefined' ? new URL(`/images/${selectedImage.src}`, window.location.href).href : `/images/${selectedImage.src}`}
                    </div>
                    <button
                      onClick={() => copyToClipboard(typeof window !== 'undefined' ? new URL(`/images/${selectedImage.src}`, window.location.href).href : `/images/${selectedImage.src}`)}
                      className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                      aria-live="polite"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                  <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">分辨率</span>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedImage.width} × {selectedImage.height}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">大小</span>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedImage.size}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">类型</span>
                <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                  {selectedImage.type === 'PC' ? '横屏 (Landscape)' : '竖屏 (Portrait)'}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <a
                  href={encodeURI(`/images/${selectedImage.src}`)}
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
        <p>© {new Date().getFullYear()} <a href="https://tianhw.top" target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:opacity-100 transition-colors">THW</a>. Powered by EdgeOne Pages</p>
      </footer>
    </div>
  );
}
