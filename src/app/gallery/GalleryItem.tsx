"use client";

import { useState, useEffect, useRef } from 'react';
import type { TypedImage } from '@/types';

interface GalleryItemProps {
  img: TypedImage;
  idx: number;
  onClick: () => void;
}

export default function GalleryItem({ img, idx, onClick }: GalleryItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;

    const handleLoad = () => setIsLoaded(true);

    if (imgEl.complete) {
      handleLoad();
    } else {
      imgEl.addEventListener('load', handleLoad);
      imgEl.addEventListener('error', handleLoad);
    }

    // 超时兜底，避免永远不显示
    const timer = setTimeout(handleLoad, 5000);

    return () => {
      imgEl.removeEventListener('load', handleLoad);
      imgEl.removeEventListener('error', handleLoad);
      clearTimeout(timer);
    };
  }, [img.src]);

  const fileName = img.src.split('/').pop() || img.src;
  const altText = `${fileName} - ${img.width}×${img.height} ${img.type === 'PC' ? '横屏' : '竖屏'}`;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="listitem"
      tabIndex={0}
      aria-label={altText}
      className={`relative overflow-hidden bg-neutral-200 dark:bg-white/5 cursor-zoom-in group transition-all duration-300 hover:z-10 rounded-xl shadow-sm hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-white/40 ${img.type === 'PC' ? 'col-span-2 row-span-1' : 'col-span-1 row-span-2'}`}
    >
      <img
        ref={imgRef}
        src={encodeURI(`/images/${img.thumb || img.src}`)}
        alt={altText}
        className={`w-full h-full object-cover block transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={idx < 20 ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
      {/* Hover: show filename */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[9px] text-white/90 font-mono truncate block">{fileName}</span>
      </div>
    </div>
  );
}
