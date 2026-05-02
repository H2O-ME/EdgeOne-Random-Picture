import { getRandomVideo, buildVideoResponse } from '@/lib/random-video';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const classificationParam = searchParams.get('classification');
  const formatParam = searchParams.get('format');

  const video = getRandomVideo({
    classification: classificationParam,
    format: formatParam,
  });

  return buildVideoResponse(video, searchParams);
}
