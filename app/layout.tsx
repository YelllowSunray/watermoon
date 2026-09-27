import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BagDrawer } from "@/components/BagDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoadBar } from "@/components/LoadBar";
import { PageFrame } from "@/components/PageFrame";
import { MetaPixel } from "@/components/pixel";
import { SearchOverlay } from "@/components/SearchOverlay";
import { StoreProvider } from "@/components/store";
import { getGenderNavigation, getTopBrands, NAV_REVALIDATE_SECONDS } from "@/lib/catalog";
import { getMetaPixelId } from "@/lib/meta-pixel";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const revalidate = NAV_REVALIDATE_SECONDS;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: "Looks, cloth, leather. Edited in Hilversum. Ships to the Netherlands.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [nav, brands] = await Promise.all([getGenderNavigation(), getTopBrands()]);
  const pixelId = getMetaPixelId();

  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <StoreProvider>
          <Suspense fallback={null}>
            <LoadBar />
          </Suspense>
          <Header nav={nav} brands={brands} />
          <main className="flex-1">
            <PageFrame>{children}</PageFrame>
          </main>
          <Footer />
          <BagDrawer />
          <SearchOverlay />
        </StoreProvider>
        <Analytics />
        {pixelId ? <MetaPixel id={pixelId} /> : null}
      </body>
    </html>
  );
}
