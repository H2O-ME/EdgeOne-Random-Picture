import { getVideos } from '@/lib/videos';

export function getRandomVideo({ classification, format }) {
  const { videos } = getVideos();

  let list = [...videos];

  if (classification) {
    list = list.filter(video => video.classification === classification);
  }

  if (format) {
    const fmt = format.toUpperCase();
    list = list.filter(video => video.format === fmt);
  }

  if (list.length === 0) {
    return null;
  }

  const randomVideo = list[Math.floor(Math.random() * list.length)];
  return {
    ...randomVideo,
    videoUrl: `/videos/${randomVideo.src}`,
  };
}

export function buildVideoResponse(video, searchParams) {
  if (!video) {
    return new Response('No videos found', { status: 404 });
  }

  if (searchParams.get('redirect') === 'false') {
    const { videoUrl, src, size, format, classification, mtime } = video;
    return Response.json({
      url: videoUrl,
      size,
      format,
      classification,
      mtime,
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': encodeURI(video.videoUrl),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
