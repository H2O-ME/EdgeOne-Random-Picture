import { getImages } from '@/lib/images';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const { pc, mobile } = getImages();

  let list;

  if (typeParam === 'pc') {
    list = pc;
  } else if (typeParam === 'mobile' || typeParam === 'phone') {
    list = mobile;
  } else {
    const userAgent = request.headers.get('user-agent') || '';
    const isMobileDevice = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    list = isMobileDevice ? mobile : pc;
  }

  if (list.length === 0) {
    list = list === pc ? mobile : pc;
  }

  if (list.length === 0) {
    return new Response('No images found', { status: 404 });
  }

  const randomImage = list[Math.floor(Math.random() * list.length)];
  const redirectUrl = `/images/${randomImage.src}`;

  if (searchParams.get('redirect') === 'false') {
    return NextResponse.json({ url: redirectUrl });
  }

  // 修复重定向问题：优先使用 Host 头部构建绝对路径，避免内部端口泄露
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const absoluteUrl = host ? `${protocol}://${host}${redirectUrl}` : new URL(redirectUrl, request.url).toString();

  return NextResponse.redirect(absoluteUrl, 302);
}
