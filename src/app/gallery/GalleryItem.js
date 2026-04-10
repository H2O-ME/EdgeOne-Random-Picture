"use client";

import { useState, useEffect, useRef } from 'react';
import { FormatIcon } from '@/components/Icons';

export default function GalleryItem({ img, idx, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;

    setIsLoaded(false);

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setIsLoaded(true);

    if (imgEl.complete) {
      handleLoad();
    } else {
      imgEl.addEventListener('load', handleLoad);
      imgEl.addEventListener('error', handleError);
    }

    // 超时兜底
    const timer = setTimeout(handleLoad, 3000);

    return () => {
      imgEl.removeEventListener('load', handleLoad);
      imgEl.removeEventListener('error', handleError);
      clearTimeout(timer);
    };
  }, [img.thumb, img.src]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-neutral-200 dark:bg-white/5 cursor-zoom-in group transition-all duration-300 hover:z-10 rounded-xl shadow-sm hover:shadow-xl ${img.type === 'PC' ? 'col-span-2 row-span-1' : 'col-span-1 row-span-2'}`}
    >
      <img
        ref={imgRef}
        src={encodeURI(`/images/${img.thumb || img.src}`)}
        alt="gallery image"
        className={`w-full h-full object-cover block transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={idx < 20 ? "eager" : "lazy"}
      />
      
      {/* 图片信息覆盖层 - 右上角 */}
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {/* 格式标签 */}
        <div className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
          <FormatIcon format={img.format} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
            {img.format}
          </span>
        </div>
      </div>
      
      {/* 时间信息 - 左下角 */}
      {img.mtime && (
        <div className="absolute bottom-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
            <svg className="w-3 h-3 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
              {formatTime(img.mtime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
