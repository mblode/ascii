import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { SidebarProviderWrapper } from "@/components/providers/sidebar-provider-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ascii.blode.co"),
  title: "ASCII - High-Quality Image Rendering Tool",
  description:
    "Apply professional ASCII rendering to your images online. Free, fast, client-side image processing tool with real-time preview. Convert images to artistic halftone patterns.",
  keywords: [
    "ASCII",
    "dithering",
    "image processing",
    "image converter",
    "halftone",
    "stippling",
    "ordered dithering",
    "image dither tool",
    "online image processor",
    "ASCII rendering algorithm",
  ],
  authors: [{ name: "Matthew Blode", url: "https://blode.co" }],
  creator: "Matthew Blode",
  publisher: "Matthew Blode",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ascii.blode.co",
    title: "ASCII - High-Quality Image Rendering Tool",
    description:
      "Apply professional ASCII rendering to your images online. Free, fast, and client-side image processing tool with real-time preview.",
    siteName: "ASCII",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ASCII - Image Processing Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASCII - High-Quality Image Rendering Tool",
    description:
      "Apply professional ASCII rendering to your images online. Free, fast, client-side processing.",
    images: ["/og-image.png"],
    creator: "@mattblode",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon1.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  category: "technology",
  appleWebApp: {
    capable: true,
    title: "ASCII",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ASCII",
  alternateName: "ASCII Image Rendering Tool",
  description:
    "Professional ASCII rendering application for high-quality image processing. Apply ASCII rendering with real-time preview.",
  url: "https://ascii.blode.co",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements:
    "Requires JavaScript. Modern browser with Canvas API support.",
  screenshot: "https://ascii.blode.co/og-image.png",
  featureList: [
    "ASCII rendering",
    "Real-time preview",
    "Client-side processing",
    "Multiple noise texture sizes",
    "Brightness adjustment",
    "Contrast adjustment",
    "Custom color selection",
    "Image resize options",
  ],
  author: {
    "@type": "Person",
    name: "Matthew Blode",
    email: "m@blode.co",
  },
  datePublished: "2026-01-14",
  dateModified: "2026-01-14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" style={{ colorScheme: "light dark" }}>
      <head>
        <meta content="ASCII" name="apple-mobile-web-app-title" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Static Schema.org structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
      </head>
      <body className="h-full antialiased">
        <GoogleAnalytics gaId="G-61F273Q9JP" />
        <SidebarProviderWrapper>{children}</SidebarProviderWrapper>
      </body>
    </html>
  );
}
