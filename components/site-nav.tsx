'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Upload } from 'lucide-react';

export function SiteNav() {
  const pathname = usePathname();
  const links = [
    { href: '/candidates', label: 'Candidates', icon: Users },
    { href: '/upload', label: 'Upload', icon: Upload },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/candidates" className="text-lg font-semibold">
          Talent Pool Search
        </Link>
        <div className="flex gap-3">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${active ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
