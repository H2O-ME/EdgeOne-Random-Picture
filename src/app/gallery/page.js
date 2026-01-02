import { getImages } from '@/lib/images';
import GalleryClient from './GalleryClient';

export default function GalleryPage() {
  const { pc, mobile } = getImages();
  const allImages = [
    ...pc.map(img => ({ ...img, type: 'PC' })),
    ...mobile.map(img => ({ ...img, type: 'Mobile' }))
  ].sort(() => Math.random() - 0.5);

  return <GalleryClient initialImages={allImages} />;
}
