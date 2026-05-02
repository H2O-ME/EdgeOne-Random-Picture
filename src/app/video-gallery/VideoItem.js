"use client";

import { useState, useRef } from 'react';
import { FormatIcon } from '@/components/Icons';

export default function VideoItem({ video, idx, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-neutral-200 dark:bg-white/5 cursor-pointer group transition-all duration-300 hover:z-10 rounded-xl shadow-sm hover:shadow-xl"
    >
      <video
        ref={videoRef}
        src={encodeURI(`/videos/${video.src}`)}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover block transition-all duration-700 group-hover:scale-105"
      />
      
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
          <FormatIcon format={video.format} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
            {video.format}
          </span>
        </div>
      </div>
      
      {video.mtime && (
        <div className="absolute bottom-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
            <svg className="w-3 h-3 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
              {formatTime(video.mtime)}
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
        <div className="w-12 h-12 bg-black/30 dark:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
