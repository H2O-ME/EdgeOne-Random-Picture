import HomeClient from './HomeClient';
import { getImages } from '@/lib/images';

export default function HomePage() {
  const images = getImages();
  return <HomeClient images={images} />;
}
