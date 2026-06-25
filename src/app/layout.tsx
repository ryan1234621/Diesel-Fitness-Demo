import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dieselfitness.com'),
  title: {
    default: "Diesel Fitness | Elite Personal Training",
    template: "%s | Diesel Fitness"
  },
  description: "Exclusive personal training, custom nutrition plans, and streamlined booking in London. Join the elite tier of fitness.",
  keywords: ["personal trainer london", "elite fitness", "custom nutrition plan", "strength training", "body transformation"],
  openGraph: {
    title: "Diesel Fitness | Elite Personal Training",
    description: "Exclusive personal training and custom nutrition plans in London.",
    url: "/",
    siteName: "Diesel Fitness",
    images: [
      {
        url: "/og-image.jpg", // Assuming an og-image exists or will be added
        width: 1200,
        height: 630,
        alt: "Diesel Fitness Elite Training"
      }
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diesel Fitness | Elite Personal Training",
    description: "Exclusive personal training and custom nutrition plans in London.",
    images: ["/og-image.jpg"],
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
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* JSON-LD for LocalBusiness (AEO/GEO Optimization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HealthAndBeautyBusiness",
              "name": "Diesel Fitness",
              "image": "https://dieselfitness.com/og-image.jpg",
              "@id": "https://dieselfitness.com",
              "url": "https://dieselfitness.com",
              "telephone": "+44 20 1234 5678",
              "priceRange": "$$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Elite Fitness Way",
                "addressLocality": "London",
                "postalCode": "SW1A 1AA",
                "addressCountry": "GB"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 51.5074,
                "longitude": -0.1278
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "05:00",
                "closes": "22:00"
              }
            })
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
