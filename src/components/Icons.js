// 图片格式图标 - 显示图片的文件格式
export function FormatIcon({ format, className = '' }) {
  // 不同格式的图标颜色
  const colorMap = {
    'JPEG': 'text-blue-500 dark:text-blue-400',
    'PNG': 'text-green-500 dark:text-green-400',
    'GIF': 'text-purple-500 dark:text-purple-400',
    'WebP': 'text-orange-500 dark:text-orange-400',
    'BMP': 'text-pink-500 dark:text-pink-400',
    'TIFF': 'text-yellow-600 dark:text-yellow-400'
  };

  const colorClass = colorMap[format] || 'text-neutral-500 dark:text-neutral-400';

  return (
    <svg 
      className={`w-3.5 h-3.5 ${colorClass} ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* 文件图标 */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* 图片标识 */}
      <rect x="8" y="12" width="8" height="6" rx="1" />
      <circle cx="10.5" cy="14.5" r="1" fill="currentColor" />
      <path d="M16 18L13 15l-3 3" />
    </svg>
  );
}

// 时间排序图标 - 表示按时间排序
export function TimeSortIcon({ className = '' }) {
  return (
    <svg 
      className={`w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* 时钟图标 */}
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// 升序排序图标
export function SortAscIcon({ className = '' }) {
  return (
    <svg 
      className={`w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 10l-4-4-4 4" />
      <path d="M7 6v12" />
      <path d="M15 10h6" />
      <path d="M15 14h6" />
      <path d="M15 18h4" />
    </svg>
  );
}

// 降序排序图标
export function SortDescIcon({ className = '' }) {
  return (
    <svg 
      className={`w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 14l-4 4-4-4" />
      <path d="M7 18V6" />
      <path d="M15 10h6" />
      <path d="M15 14h6" />
      <path d="M15 18h4" />
    </svg>
  );
}
