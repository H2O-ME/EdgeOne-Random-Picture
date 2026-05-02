"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import VideoItem from './VideoItem';
import ThemeToggle from '@/components/ThemeToggle';
import { FormatIcon, TimeSortIcon, SortAscIcon, SortDescIcon } from '@/components/Icons';

export default function VideoGalleryClient({ initialVideos, classifications }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RANDOM');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const lightboxRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;

    const handleClickOutside = (e) => {
      const filterButton = e.target.closest('[data-filter-toggle]');
      const filterDropdown = e.target.closest('[data-filter-dropdown]');
      if (!filterButton && !filterDropdown) {
        setFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtersOpen]);

  const uniqueFormats = useMemo(() => {
    const formats = new Set(initialVideos.map(video => video.format).filter(Boolean));
    return Array.from(formats).sort();
  }, [initialVideos]);

  const randomSeed = useMemo(() => {
    const seedStr = `${initialVideos.length}-${initialVideos[0]?.src || ''}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }, [initialVideos]);

  const seededShuffle = useMemo(() => {
    return (array) => {
      const shuffled = [...array];
      let seed = randomSeed;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
        return (seed >>> 0) / 0xFFFFFFFF;
      };
      
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
  }, [randomSeed]);

  const displayedVideos = useMemo(() => {
    let filtered = initialVideos;

    if (classificationFilter !== 'ALL') {
      filtered = filtered.filter(video => video.classification === classificationFilter);
    }

    if (formatFilter !== 'ALL') {
      filtered = filtered.filter(video => video.format === formatFilter);
    }

    if (sortBy === 'TIME_ASC') {
      filtered = [...filtered].sort((a, b) => (a.mtime || 0) - (b.mtime || 0));
    } else if (sortBy === 'TIME_DESC') {
      filtered = [...filtered].sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
    } else if (sortBy === 'RANDOM') {
      filtered = seededShuffle(filtered);
    }

    return filtered;
  }, [initialVideos, classificationFilter, formatFilter, sortBy, seededShuffle]);

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
  }, { scope: containerRef, dependencies: [displayedVideos], revertOnUpdate: true });

  useGSAP(() => {
    if (selectedVideo && lightboxRef.current && cardRef.current) {
      gsap.fromTo(lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, { dependencies: [selectedVideo] });

  const openLightbox = (video) => {
    setSelectedVideo(video);
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
          setSelectedVideo(null);
          document.body.style.overflow = '';
        }
      });
    } else {
      setSelectedVideo(null);
      document.body.style.overflow = '';
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-white selection:bg-neutral-200 dark:selection:bg-white/10 relative transition-colors duration-500">
      <header className="fixed top-3 left-3 right-3 z-[60] flex justify-between items-center px-4 md:px-6 py-2.5 md:py-3 bg-white/80 dark:bg-black/60 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/15 pointer-events-none shadow-sm">
        <Link href="/" className="text-sm tracking-[0.4em] uppercase font-light hover:opacity-50 transition-opacity pointer-events-auto flex items-center gap-3">
          Video Gallery
          <span className="text-[10px] tracking-[0.3em] uppercase opacity-40 font-medium">
            {initialVideos.length}
          </span>
        </Link>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <button
              data-filter-toggle
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all backdrop-blur-md z-50 group border border-black/10 dark:border-white/10 shadow-sm relative"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="18" x2="12" y2="18" />
              </svg>
              {(formatFilter !== 'ALL' || classificationFilter !== 'ALL' || sortBy !== 'RANDOM') && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-black"></span>
              )}
            </button>

            {filtersOpen && (
              <div data-filter-dropdown className="absolute right-0 top-full mt-2 z-[65] bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-200/50 dark:border-white/10 p-4 min-w-[280px] md:min-w-[360px]">
                <div className="space-y-4">
                  {classifications && classifications.length > 0 && (
                    <div>
                      <div className="text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold mb-2">分类筛选</div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setClassificationFilter('ALL')}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                            classificationFilter === 'ALL'
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                              : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                          }`}
                        >
                          全部
                        </button>
                        {classifications.map(classification => (
                          <button
                            key={classification}
                            onClick={() => setClassificationFilter(classification)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                              classificationFilter === classification
                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                                : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                            }`}
                          >
                            {classification}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold mb-2">格式筛选</div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFormatFilter('ALL')}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                          formatFilter === 'ALL'
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                            : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        全部
                      </button>
                      {uniqueFormats.map(format => (
                        <button
                          key={format}
                          onClick={() => setFormatFilter(format)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                            formatFilter === format
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                              : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                          }`}
                        >
                          <FormatIcon format={format} className="w-3 h-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{format}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold mb-2">排序方式</div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSortBy('RANDOM')}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                          sortBy === 'RANDOM'
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                            : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        随机
                      </button>
                      <button
                        onClick={() => setSortBy('TIME_DESC')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                          sortBy === 'TIME_DESC'
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                            : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                        }`}
                        title="最新优先"
                      >
                        <span className="whitespace-nowrap">最新</span>
                        <SortDescIcon className="w-3 h-3 flex-shrink-0" />
                      </button>
                      <button
                        onClick={() => setSortBy('TIME_ASC')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                          sortBy === 'TIME_ASC'
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                            : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200'
                        }`}
                        title="最早优先"
                      >
                        <span className="whitespace-nowrap">最早</span>
                        <SortAscIcon className="w-3 h-3 flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  {(classificationFilter !== 'ALL' || formatFilter !== 'ALL' || sortBy !== 'RANDOM') && (
                    <div className="pt-2 border-t border-neutral-200/50 dark:border-white/10">
                      <span className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-bold">
                        当前显示 {displayedVideos.length} 个视频
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main ref={gridRef} className="pt-20 p-2 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] auto-rows-[150px] md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:auto-rows-[180px] grid-flow-dense gap-2 pb-20 max-w-[2000px] mx-auto">
        {displayedVideos.map((video, idx) => (
          <VideoItem
            key={video.src}
            video={video}
            idx={idx}
            onClick={() => openLightbox(video)}
          />
        ))}
      </main>

      {selectedVideo && (
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
              <video 
                src={encodeURI(`/videos/${selectedVideo.src}`)} 
                controls
                className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
              />
            </div>

            <div className="w-full md:w-[320px] p-8 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-white/10 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">资源地址</label>
                  <div className="flex flex-col gap-2">
                    <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg break-all font-mono text-[11px] opacity-90 leading-relaxed border border-black/5 dark:border-white/5">
                      {typeof window !== 'undefined' ? new URL(`/videos/${selectedVideo.src}`, window.location.href).href : `/videos/${selectedVideo.src}`}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(typeof window !== 'undefined' ? new URL(`/videos/${selectedVideo.src}`, window.location.href).href : `/videos/${selectedVideo.src}`)}
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
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">大小</label>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedVideo.size}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">格式</label>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedVideo.format}
                  </div>
                </div>
              </div>

              {selectedVideo.classification && (
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 uppercase tracking-widest font-bold">分类</label>
                  <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg font-mono text-xs opacity-90">
                    {selectedVideo.classification}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4">
                <a 
                  href={`/videos/${selectedVideo.src}`} 
                  download 
                  className="flex items-center justify-center gap-2 w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-colors no-underline"
                >
                  保存视频
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
