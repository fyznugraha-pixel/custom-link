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
    default: "Fyurl | Advanced URL Shortener & QR Code Generator",
    template: "%s | Fyurl"
  },
  description: "Redefine how you share. Shrink endless URLs into clean, memorable links and instantly generate stunning QR codes. Fast, secure, and free to use.",
  keywords: [
    "url shortener", "link shortener", "custom url", "qr code generator", 
    "shorten link", "link management", "branded links", "free url shortener",
    "persingkat URL", "pemendek link", "short link gratis", "custom domains", "Fyurl"
  ],
  authors: [{ name: "Fayiz Apriwansyah Nugraha", url: "https://byfayiz.web.id/portofolio" }],
  creator: "Fayiz Apriwansyah Nugraha",
  publisher: "Fayiz Apriwansyah Nugraha",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fylink.fun",
    title: "Fyurl | Advanced URL Shortener",
    description: "Transform your long, ugly links into clean, trackable short URLs. Generate custom QR codes and manage your links efficiently.",
    siteName: "Fyurl",
    images: [
      {
        url: "/logo/fyurl-horizontal.png",
        width: 1200,
        height: 630,
        alt: "Fyurl Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fyurl | Advanced URL Shortener",
    description: "Transform your long, ugly links into clean, trackable short URLs.",
    images: ["/logo/fyurl-horizontal.png"],
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
      "@type": "Person",
      "@id": "https://fylink.fun/#fayiz",
      "name": "Fayiz Apriwansyah Nugraha",
      "url": "https://byfayiz.web.id/portofolio",
      "jobTitle": "Web Developer",
      "sameAs": [
        "https://instagram.com/faizngraha"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://fylink.fun/#website",
      "url": "https://fylink.fun",
      "name": "Fyurl",
      "author": { "@id": "https://fylink.fun/#fayiz" },
      "publisher": { "@id": "https://fylink.fun/#fayiz" },
      "description": "Enterprise-grade URL shortener with custom domains and analytics.",
    },
    {
      "@type": "SoftwareApplication",
      "name": "Fyurl",
      "operatingSystem": "Web",
      "applicationCategory": "UtilitiesApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "An advanced URL shortener platform allowing users to shrink long URLs, use custom domains, track clicks, and generate QR codes for free.",
      "author": { "@id": "https://fylink.fun/#fayiz" },
      "creator": { "@id": "https://fylink.fun/#fayiz" }
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

