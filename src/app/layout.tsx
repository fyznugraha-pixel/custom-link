import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fyurl.fun'),
  title: {
    default: "Fyurl | Advanced URL Shortener & QR Code Generator",
    template: "%s | Fyurl"
  },
  description: "Fyurl (formerly Fylink) is a fast, no-nonsense tool to shorten long URLs, create custom aliases, and generate QR codes. Free to use, trackable, and secure. Built by Fayiz Apriwansyah Nugraha.",
  keywords: [
    "url shortener", "link shortener", "custom url", "qr code generator", 
    "shorten link", "link management", "branded links", "free url shortener",
    "persingkat URL", "pemendek link", "short link gratis", "custom domains", "Fyurl", "Fylink", "fylink.fun"
  ],
  authors: [{ name: "Fayiz Apriwansyah Nugraha", url: "https://byfayiz.web.id/portofolio" }],
  creator: "Fayiz Apriwansyah Nugraha",
  publisher: "Fayiz Apriwansyah Nugraha",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fyurl.fun",
    title: "Fyurl (formerly Fylink) | Advanced URL Shortener",
    description: "Fyurl (formerly Fylink) is a fast, no-nonsense tool to shorten long URLs, create custom aliases, and generate QR codes. Free to use, trackable, and secure.",
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
    title: "Fyurl (formerly Fylink) | Advanced URL Shortener",
    description: "Fyurl (formerly Fylink) is a fast, no-nonsense tool to shorten long URLs, create custom aliases, and generate QR codes.",
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
    canonical: "https://fyurl.fun",
  },
  verification: {
    google: "lZTeeEIIitxfak5hZ14H8RZjHSjqHL6fnjuDCZbL-S4",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://fyurl.fun/#fayiz",
      "name": "Fayiz Apriwansyah Nugraha",
      "url": "https://byfayiz.web.id/portofolio",
      "jobTitle": "Web Developer",
      "sameAs": [
        "https://instagram.com/faizngraha"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://fyurl.fun/#website",
      "url": "https://fyurl.fun",
      "name": "Fyurl",
      "alternateName": "Fylink",
      "author": { "@id": "https://fyurl.fun/#fayiz" },
      "publisher": { "@id": "https://fyurl.fun/#fayiz" },
      "description": "Enterprise-grade URL shortener with custom domains and analytics.",
    },
    {
      "@type": "SoftwareApplication",
      "name": "Fyurl",
      "alternateName": "Fylink",
      "operatingSystem": "Web",
      "applicationCategory": "UtilitiesApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "An advanced URL shortener platform allowing users to shrink long URLs, use custom domains, track clicks, and generate QR codes for free.",
      "author": { "@id": "https://fyurl.fun/#fayiz" },
      "creator": { "@id": "https://fyurl.fun/#fayiz" }
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
        <meta name="google-adsense-account" content="ca-pub-3303348584536351" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3303348584536351"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

