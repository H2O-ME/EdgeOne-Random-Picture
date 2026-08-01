import { getImages } from '@/lib/images';
import { NextResponse } from 'next/server';

const VALID_TYPES = new Set(['pc', 'mobile', 'phone']);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const { pc, mobile } = getImages();

    let list;

    if (typeParam === 'pc') {
      list = pc;
    } else if (typeParam === 'mobile' || typeParam === 'phone') {
      list = mobile;
    } else if (typeParam && !VALID_TYPES.has(typeParam)) {
      return NextResponse.json(
        { error: `Invalid type "${typeParam}". Valid values: pc, mobile` },
        { status: 400 }
      );
    } else {
      // 无类型参数时，通过 User-Agent 智能识别设备
      const userAgent = request.headers.get('user-agent') || '';
      const isMobileDevice = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
      list = isMobileDevice ? mobile : pc;
    }

    // 如果指定类型无图片，回退到另一类型
    if (list.length === 0) {
      list = list === pc ? mobile : pc;
    }

    if (list.length === 0) {
      return NextResponse.json(
        { error: 'No images found' },
        { status: 404 }
      );
    }

    const randomImage = list[Math.floor(Math.random() * list.length)];
    const imageUrl = `/images/${encodeURI(randomImage.src)}`;

    // JSON 模式
    if (searchParams.get('redirect') === 'false') {
      return NextResponse.json({
        url: imageUrl,
        width: randomImage.width,
        height: randomImage.height,
        size: randomImage.size,
      });
    }

    // 重定向模式
    return new Response(null, {
      status: 302,
      headers: {
        'Location': imageUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Vary': 'User-Agent',
      },
    });
  } catch (error) {
    console.error('[/api/random] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
