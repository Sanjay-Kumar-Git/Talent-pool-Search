'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef('');

  useEffect(() => {
    // Every time pathname changes, reset and animate in
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 30);
    prevPathname.current = pathname;
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </div>
  );
}