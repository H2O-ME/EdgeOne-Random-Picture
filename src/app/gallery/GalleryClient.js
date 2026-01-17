"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import GalleryItem from './GalleryItem';

export default function GalleryClient({ initialImages }) {
  const [allImages, setAllImages] = useState(initialImages || []);
  const [selectedImage, setSelectedImage] = useState(null);
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
    document.body.style.overflow = 'hidden';
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
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold tracking-tight">EdgeOne Gallery</div>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/" className="text-[#a1a1aa] hover:text-white px-4 py-2 text-sm no-underline">首页</Link>
          <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="bg-[#262626] text-[#a1a1aa] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#404040] hover:text-white transition-all no-underline">GitHub</a>
        </div>
      </header>

      <main ref={gridRef} className="p-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] auto-rows-[150px] grid-flow-dense gap-3 pb-20">
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
          className="fixed inset-0 bg-black/90 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div 
            ref={cardRef}
            className="relative flex flex-col md:flex-row bg-[#1a1a1a] rounded-2xl overflow-hidden max-w-[95vw] max-h-[90vh] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-10 transition-colors"
              onClick={closeLightbox}
            >
              ✕
            </button>
            
            <div className="flex-1 bg-black flex items-center justify-center min-w-0">
              <img 
                src={encodeURI(`/images/${selectedImage.src}`)} 
                alt="preview" 
                className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
              />
            </div>

            <div className="w-full md:w-[320px] p-8 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold">图片地址</label>
                <div className="bg-white/5 p-3 rounded-lg break-all font-mono text-xs text-white/90">
                  {typeof window !== 'undefined' ? new URL(`/images/${selectedImage.src}`, window.location.href).href : `/images/${selectedImage.src}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold">分辨率</label>
                  <div className="bg-white/5 p-3 rounded-lg font-mono text-xs text-white/90">
                    {selectedImage.width} × {selectedImage.height}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold">文件大小</label>
                  <div className="bg-white/5 p-3 rounded-lg font-mono text-xs text-white/90">
                    {selectedImage.size}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold">图片类型</label>
                <div className="bg-white/5 p-3 rounded-lg font-mono text-xs text-white/90">
                  {selectedImage.type === 'PC' ? '横屏 (Landscape)' : '竖屏 (Portrait)'}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <a 
                  href={`/images/${selectedImage.src}`} 
                  download 
                  className="flex items-center justify-center gap-2 w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors no-underline"
                >
                  下载原图
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="p-12 text-center text-[#a1a1aa] text-sm border-t border-white/5">
        <p>© {new Date().getFullYear()} <a href="https://tianhw.top" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">THW</a>. Powered by <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">EdgeOne Pages</a></p>
      </footer>
    </div>
  );
}
