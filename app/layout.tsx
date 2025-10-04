import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider, PostHogPageView } from "@/providers/posthog-provider";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { Suspense } from "react";

const cormorant = Cormorant_Garamond({
  weight: '700',
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '600'],
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Territoire en Fête - Agenda des événements locaux",
  description: "Découvrez tous les événements de votre territoire : concerts, festivals, spectacles, marchés et plus encore. Zéro double saisie, agenda automatique.",
  keywords: ["événements", "agenda", "territoire", "concerts", "festivals", "spectacles", "local"],
  authors: [{ name: "Territoire en Fête" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Territoire en Fête",
    title: "Territoire en Fête - Agenda des événements locaux",
    description: "Découvrez tous les événements de votre territoire",
  },
  twitter: {
    card: "summary_large_image",
    title: "Territoire en Fête",
    description: "Découvrez tous les événements de votre territoire",
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
    <html lang="fr">
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased`}
      >
        <SiteSettingsProvider>
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
          </PostHogProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
