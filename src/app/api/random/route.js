import { getImages } from '@/lib/images';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const classificationParam = searchParams.get('classification');
  const { pc, mobile } = getImages();

  let list;
  let isMobileDevice = false;

  if (typeParam === 'pc') {
    list = pc;
  } else if (typeParam === 'mobile' || typeParam === 'phone') {
    list = mobile;
  } else {
    const userAgent = request.headers.get('user-agent') || '';
    isMobileDevice = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    list = isMobileDevice ? mobile : pc;
  }

  // 如果指定了分类，进一步筛选
  if (classificationParam) {
    list = list.filter(img => img.classification === classificationParam);
  }

  // 如果当前列表为空，尝试回退到另一个列表
  if (list.length === 0) {
    list = typeParam === 'pc' ? mobile : pc;
    // 回退后也应用分类筛选
    if (classificationParam) {
      list = list.filter(img => img.classification === classificationParam);
    }
  }

  // 如果两个列表都为空，返回 404
  if (list.length === 0) {
    return new Response('No images found', { status: 404 });
  }

  const randomImage = list[Math.floor(Math.random() * list.length)];
  const imageUrl = `/images/${randomImage.src}`;

  if (searchParams.get('redirect') === 'false') {
    return NextResponse.json({ url: imageUrl });
  }

  const redirectUrl = encodeURI(imageUrl);

  // 使用相对路径重定向，避免 vercel 内部域名泄露问题
  // NextResponse.redirect 要求绝对路径，所以我们手动构建 Response
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
