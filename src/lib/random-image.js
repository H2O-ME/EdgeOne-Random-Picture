import { getImages } from '@/lib/images';

export function getRandomImage({ type, classification, format, userAgent }) {
  const { pc, mobile } = getImages();

  let list;

  if (type === 'pc') {
    list = pc;
  } else if (type === 'mobile' || type === 'phone') {
    list = mobile;
  } else {
    const isMobileDevice = /mobile|android|iphone|ipad|ipod/i.test(userAgent || '');
    list = isMobileDevice ? mobile : pc;
  }

  if (classification) {
    list = list.filter(img => img.classification === classification);
  }

  if (format) {
    const fmt = format.toUpperCase();
    list = list.filter(img => img.format === fmt);
  }

  if (list.length === 0) {
    list = type === 'pc' ? mobile : pc;
    if (classification) {
      list = list.filter(img => img.classification === classification);
    }
    if (format) {
      const fmt = format.toUpperCase();
      list = list.filter(img => img.format === fmt);
    }
  }

  if (list.length === 0) {
    return null;
  }

  const randomImage = list[Math.floor(Math.random() * list.length)];
  return {
    ...randomImage,
    imageUrl: `/images/${randomImage.src}`,
  };
}

export function buildResponse(image, searchParams) {
  if (!image) {
    return new Response('No images found', { status: 404 });
  }

  if (searchParams.get('redirect') === 'false') {
    const { imageUrl, src, width, height, size, format, classification, mtime } = image;
    return Response.json({
      url: imageUrl,
      width,
      height,
      size,
      format,
      classification,
      mtime,
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': encodeURI(image.imageUrl),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
