import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteNav } from '@/components/site-nav';
import { PageTransition } from '@/components/page-transition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talent Pool Search',
  description: 'Upload and search candidate resumes with AI-assisted extraction.',
  icons: {
    icon: '/icon.png', 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteNav />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}