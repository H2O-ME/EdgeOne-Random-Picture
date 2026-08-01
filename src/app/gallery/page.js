import { getImages } from '@/lib/images';
import GalleryClient from './GalleryClient';

export const metadata = {
  title: '图库',
  description: '浏览所有随机图片素材，支持预览和下载',
};

export default function GalleryPage() {
  const { pc, mobile } = getImages();
  // 服务端保持确定性顺序，随机排序移至客户端以支持 SSG 缓存
  const allImages = [
    ...pc.map(img => ({ ...img, type: 'PC' })),
    ...mobile.map(img => ({ ...img, type: 'Mobile' }))
  ];

  return <GalleryClient initialImages={allImages} />;
}
