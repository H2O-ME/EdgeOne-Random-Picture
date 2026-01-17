"use client";

import { useState, useEffect, useRef } from 'react';

export default function GalleryItem({ img, idx, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => setIsLoaded(true);

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleLoad);
      
      // 使用 decode() 预解码
      if (img.decode) {
        img.decode().then(handleLoad).catch(handleLoad);
      }
    }

    const timer = setTimeout(handleLoad, 3000);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleLoad);
      clearTimeout(timer);
    };
  }, [img.src]);

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-[#1a1a1a] cursor-zoom-in transition-transform hover:scale-[1.02] hover:z-10 ${img.type === 'PC' ? 'col-span-2 row-span-1' : 'col-span-1 row-span-2'}`}
    >
      <img 
        ref={imgRef}
        src={encodeURI(`/images/${img.thumb || img.src}`)} 
        alt="gallery image" 
        className={`w-full h-full object-cover block transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={idx < 20 ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
    </div>
  );
}
