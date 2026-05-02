import { getRandomImage, buildResponse } from '@/lib/random-image';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const classificationParam = searchParams.get('classification');
  const formatParam = searchParams.get('format');
  const userAgent = request.headers.get('user-agent') || '';

  const image = getRandomImage({
    type: typeParam,
    classification: classificationParam,
    format: formatParam,
    userAgent,
  });

  return buildResponse(image, searchParams);
}
