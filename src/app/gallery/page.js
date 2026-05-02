import { getImages } from '@/lib/images';
import GalleryClient from './GalleryClient';

export default function GalleryPage() {
  const { pc, mobile, classifications } = getImages();
  const allImages = [
    ...pc.map(img => ({ ...img, type: 'PC' })),
    ...mobile.map(img => ({ ...img, type: 'Mobile' }))
  ];

  return <GalleryClient initialImages={allImages} classifications={classifications} />;
}
