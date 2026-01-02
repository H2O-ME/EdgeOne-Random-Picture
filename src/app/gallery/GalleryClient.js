"use client";

import { useState, useEffect } from 'react';

export default function GalleryPage({ initialImages }) {
  const [allImages, setAllImages] = useState(initialImages || []);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!initialImages) {
      // This shouldn't happen with SSR but just in case
      fetch('/api/images').then(res => res.json()).then(data => {
        const combined = [
          ...data.pc.map(img => ({ ...img, type: 'PC' })),
          ...data.mobile.map(img => ({ ...img, type: 'Mobile' }))
        ].sort(() => Math.random() - 0.5);
        setAllImages(combined);
      });
    }
  }, [initialImages]);

  const openLightbox = (img) => {
    setSelectedImage(img);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-md border-b border-white/5">
        <div className="text-xl font-bold tracking-tight">PicGallery</div>
        <div className="flex gap-2 items-center">
          <a href="/" className="text-[#a1a1aa] hover:text-white px-4 py-2 text-sm no-underline">首页</a>
          <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="bg-[#262626] text-[#a1a1aa] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#404040] hover:text-white transition-all no-underline">GitHub</a>
        </div>
      </header>

      <main className="p-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] auto-rows-[150px] grid-flow-dense gap-3">
        {allImages.map((img, idx) => (
          <div 
            key={idx}
            onClick={() => openLightbox(img)}
            className={`relative overflow-hidden rounded-xl bg-[#1a1a1a] cursor-zoom-in transition-transform hover:scale-[1.02] hover:z-10 ${img.type === 'PC' ? 'col-span-2 row-span-1' : 'col-span-1 row-span-2'}`}
          >
            <img 
              src={`/images/${img.src}`} 
              alt="gallery image" 
              className="w-full h-full object-cover block"
              loading={idx < 12 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </main>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div 
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
                src={`/images/${selectedImage.src}`} 
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
        <p>© 2024 <a href="https://tianhw.top" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">THW</a>. Powered by <a href="https://github.com/H2O-ME/EdgeOne-Random-Picture" target="_blank" className="text-inherit no-underline hover:text-white transition-colors">EdgeOne-Random-Picture</a></p>
      </footer>
    </div>
  );
}
