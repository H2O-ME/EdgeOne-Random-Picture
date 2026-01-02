import './globals.css';

export const metadata = {
  title: 'Random Picture API',
  description: '智能识别设备类型，极速分发每一张精选画作。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
