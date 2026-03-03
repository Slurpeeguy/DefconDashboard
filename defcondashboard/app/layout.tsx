import type { Metadata } from 'next';
import { Space_Mono, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DEFCON DASHBOARD — Real-Time Global Surveillance',
  description:
    'Live tracking of military aircraft, government flights, naval vessels, and oil tankers on a dark tactical world map.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${barlowCondensed.variable}`}>
      <body className="bg-[#0a0e1a] text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
