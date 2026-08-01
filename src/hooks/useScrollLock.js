"use client";

import { useEffect } from 'react';

/**
 * 统一管理页面滚动锁定
 * @param {boolean} locked - 是否锁定滚动
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;

    const originalBody = document.body.style.overflow;
    const originalHtml = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBody;
      document.documentElement.style.overflow = originalHtml;
    };
  }, [locked]);
}
