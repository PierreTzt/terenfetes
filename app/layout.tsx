import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider, PostHogPageView } from "@/providers/posthog-provider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
