import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Gesture Engine - Real-time Hand Recognition',
  description: 'Advanced hand gesture detection powered by AI',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
