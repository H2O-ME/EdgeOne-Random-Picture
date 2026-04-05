"use client";

import { useState, useEffect, useRef } from 'react';

export default function GalleryItem({ img, idx, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    setIsLoaded(false);
    
    const handleLoad = () => setIsLoaded(true);

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleLoad);
      
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
  }, [img.thumb, img.src]);

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
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
    </div>
  );
}
