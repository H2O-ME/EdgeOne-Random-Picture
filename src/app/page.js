import { getImages } from '@/lib/images';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const { pc, mobile } = getImages();
  
  // 简单的随机选择逻辑，模拟 API 行为
  const allImages = [...pc, ...mobile];
  let initialBgUrl = '';
  
  if (allImages.length > 0) {
    const randomImg = allImages[Math.floor(Math.random() * allImages.length)];
    initialBgUrl = `/images/${randomImg.src}`;
  }

  return <HomeClient initialBgUrl={initialBgUrl} />;
}
