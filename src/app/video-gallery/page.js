import { getVideos } from '@/lib/videos';
import VideoGalleryClient from './VideoGalleryClient';

export default function VideoGalleryPage() {
  const { videos, classifications } = getVideos();
  return <VideoGalleryClient initialVideos={videos} classifications={classifications} />;
}
