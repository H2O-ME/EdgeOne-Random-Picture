"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import GalleryItem from './GalleryItem';
import ThemeToggle from '@/components/ThemeToggle';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { TypedImage, SortMode } from '@/types';

const BATCH_SIZE = 40;

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'random', label: '随机' },
  { value: 'newest', label: '最新' },
  { value: 'oldest', label: '最早' },
  { value: 'name-asc', label: '名称 A→Z' },
  { value: 'name-desc', label: '名称 Z→A' },
];

function sortImages(images: TypedImage[], mode: SortMode): TypedImage[] {
  const arr = [...images];
  switch (mode) {
    case 'random':
      return arr.sort(() => Math.random() - 0.5);
    case 'newest':
      return arr.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
    case 'oldest':
      return arr.sort((a, b) => new Date(a.mtime).getTime() - new Date(b.mtime).getTime());
    case 'name-asc':
      return arr.sort((a, b) => a.src.localeCompare(b.src, 'zh-CN'));
    case 'name-desc':
      return arr.sort((a, b) => b.src.localeCompare(a.src, 'zh-CN'));
    default:
      return arr;
  }
}

interface GalleryClientProps {
  initialImages: TypedImage[];
}

export default function GalleryClient({ initialImages }: GalleryClientProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('random');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selectedImage, setSelectedImage] = useState<TypedImage | null>(null);
  const [copied, setCopied] = useState(false);
  const [lightboxImgError, setLightboxImgError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 统一滚动锁定
  useScrollLock(!!selectedImage);

  // 挂载标记：避免 SSR/CSR 随机排序不一致导致 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 搜索过滤 + 排序（未挂载时保持原始顺序，确保 SSR 确定性）
  const filteredImages = useMemo(() => {
    let result = initialImages || [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(img => img.src.toLowerCase().includes(q));
    }
    if (!mounted && sortMode === 'random') return result;
    return sortImages(result, sortMode);
  }, [initialImages, searchQuery, sortMode, mounted]);

  // 搜索/排序变化时重置可见数量
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, sortMode]);

  // 渐进式加载：监听哨兵元素
  useEffect(() => {
    if (!sentinelRef.current || visibleCount >= filteredImages.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredImages.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredImages.length]);

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
  }, { scope: containerRef, dependencies: [visibleCount, filteredImages.length] });

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

  // 键盘操作：Escape 关闭 Lightbox，Ctrl+K 聚焦搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) closeLightbox();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // Lightbox 打开时聚焦关闭按钮
  useEffect(() => {
    if (selectedImage) closeBtnRef.current?.focus();
  }, [selectedImage]);

  const openLightbox = useCallback((img: TypedImage) => {
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

  const copyToClipboard = useCallback((text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }, []);

  const fallbackCopy = (text: string) => {
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

  const visibleImages = filteredImages.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-white selection:bg-neutral-200 dark:selection:bg-white/10 relative transition-colors duration-500">
      {/* Unified Fixed Header - Single Row */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-[#fafafa]/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-200/50 dark:border-white/5">
        <div className="flex items-center gap-3 px-4 md:px-6 py-2.5">
          <Link href="/" className="text-sm tracking-[0.3em] uppercase font-light hover:opacity-50 transition-opacity shrink-0">
            Gallery
          </Link>
          <div className="relative flex-1 max-w-xs md:max-w-sm">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件名 (Ctrl+K)"
              aria-label="搜索图片文件名"
              className="w-full pl-8 pr-7 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-white/30 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-40 hover:opacity-80 transition-opacity"
                aria-label="清除搜索"
              >
                ✕
              </button>
            )}
          </div>
          <select
            id="sort-select"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="排序方式"
            className="px-2 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-white/30 cursor-pointer shrink-0"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">{opt.label}</option>
            ))}
          </select>
          <span className="text-[10px] tracking-wider opacity-40 font-medium hidden sm:block shrink-0" aria-live="polite">
            {filteredImages.length} / {initialImages.length}
          </span>
          <div className="ml-auto shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Grid */}
      <main
        ref={gridRef}
        className="pt-[60px] px-3 md:px-4 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] auto-rows-[130px] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:auto-rows-[160px] grid-flow-dense gap-2.5 pb-20 max-w-[2000px] mx-auto"
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

      {/* Empty state */}
      {filteredImages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <span className="text-4xl opacity-20">🔍</span>
          <p className="text-sm opacity-40">未找到匹配 &ldquo;{searchQuery}&rdquo; 的图片</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs underline opacity-50 hover:opacity-100 transition-opacity"
          >
            清除搜索
          </button>
        </div>
      )}

      {/* 哨兵元素：触发加载更多 */}
      {visibleCount < filteredImages.length && (
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
              {/* 文件名 */}
              <div className="space-y-1">
                <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">文件名</span>
                <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90 break-all">
                  {selectedImage.src}
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">类型</span>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedImage.type === 'PC' ? '横屏' : '竖屏'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">修改时间</span>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedImage.mtime ? new Date(selectedImage.mtime).toLocaleDateString('zh-CN') : '—'}
                  </div>
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
