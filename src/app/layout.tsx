import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fylink.fun'),
  title: {
    default: "Fylink | Advanced URL Shortener & QR Code Generator",
    template: "%s | Fylink"
  },
  description: "Redefine how you share. Shrink endless URLs into clean, memorable links and instantly generate stunning QR codes. Fast, secure, and free to use.",
  keywords: [
    "URL shortener", "custom URL shortener", "free link shortener", "shorten link", 
    "custom link generator", "branded link shortener", "link tracking", "QR code generator", 
    "persingkat URL", "pemendek link", "short link gratis", "custom domains", "Fylink"
  ],
  authors: [{ name: "Fylink Team" }],
  creator: "Fylink",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fylink.fun",
    title: "Fylink | Advanced URL Shortener",
    description: "Shrink endless URLs into clean, memorable links and instantly generate stunning QR codes.",
    siteName: "Fylink",
    images: [
      {
        url: "/logo/fylink-v2.png",
        width: 800,
        height: 600,
        alt: "Fylink Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fylink | Advanced URL Shortener",
    description: "Shrink endless URLs into clean, memorable links and instantly generate stunning QR codes.",
    images: ["/logo/fylink-v2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://fylink.fun",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://fylink.fun/#website",
      "url": "https://fylink.fun",
      "name": "Fylink",
      "description": "Enterprise-grade URL shortener with custom domains and analytics.",
    },
    {
      "@type": "SoftwareApplication",
      "name": "Fylink",
      "operatingSystem": "Web",
      "applicationCategory": "UtilitiesApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "An advanced URL shortener platform allowing users to shrink long URLs, use custom domains, track clicks, and generate QR codes for free."
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

