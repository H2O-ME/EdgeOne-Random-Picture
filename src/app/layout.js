import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: {
    default: 'EdgeOne Random Picture',
    template: '%s | EdgeOne Random Picture',
  },
  description: '基于 EdgeOne Pages 的随机图片分发系统，支持 PC/移动端智能适配',
  metadataBase: new URL('https://img.tianhw.top'),
  openGraph: {
    title: 'EdgeOne Random Picture',
    description: '随机图片 API 分发服务，支持智能设备识别与类型筛选',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'EdgeOne Random Picture',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdgeOne Random Picture',
    description: '随机图片 API 分发服务',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
