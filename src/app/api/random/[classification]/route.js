import { getImages } from '@/lib/images';
import { getRandomImage, buildResponse } from '@/lib/random-image';

export function generateStaticParams() {
  const { classifications } = getImages();
  return classifications.map(c => ({ classification: c }));
}

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const formatParam = searchParams.get('format');
  const userAgent = request.headers.get('user-agent') || '';
  const { classification: rawClassification } = await params;
  const classification = decodeURIComponent(rawClassification);

  const image = getRandomImage({
    type: typeParam,
    classification,
    format: formatParam,
    userAgent,
  });

  return buildResponse(image, searchParams);
}
