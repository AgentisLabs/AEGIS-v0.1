import { Inter } from 'next/font/google';
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Prop-View - Prop Firm Insights",
  description: "AI-powered proprietary trading firm analysis tool",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Aegis AI | Solana Token Analysis',
    description: 'AI-powered Solana token analysis and risk assessment',
    url: 'https://your-domain.com',
    siteName: 'Aegis AI',
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
    title: 'Aegis AI | Solana Token Analysis',
    description: 'AI-powered Solana token analysis and risk assessment',
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
