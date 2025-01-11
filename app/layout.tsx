import { Inter } from 'next/font/google';
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "AEGIS | AI-Enabled Gateway for Intelligent Solana Operations",
  description: "AI-powered Solana token analysis and execution platform",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'AEGIS | Solana AI Trading Platform',
    description: 'AI-powered gateway for intelligent Solana operations, featuring advanced token analysis and automated trading strategies',
    url: 'https://aegis.trade',
    siteName: 'AEGIS',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AEGIS | Solana AI Trading Platform',
    description: 'AI-powered gateway for intelligent Solana operations, featuring advanced token analysis and automated trading strategies',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
