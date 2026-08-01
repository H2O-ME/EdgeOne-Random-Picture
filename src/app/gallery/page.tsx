import { getImages } from '@/lib/images';
import GalleryClient from './GalleryClient';
import type { TypedImage } from '@/types';

export const metadata = {
  title: '图库',
  description: '浏览所有随机图片素材，支持搜索、排序、预览和下载',
};

export default function GalleryPage() {
  const { pc, mobile } = getImages();
  // 服务端保持确定性顺序，随机排序移至客户端以支持 SSG 缓存
  const allImages: TypedImage[] = [
    ...pc.map(img => ({ ...img, type: 'PC' as const })),
    ...mobile.map(img => ({ ...img, type: 'Mobile' as const })),
  ];

  return <GalleryClient initialImages={allImages} />;
}
