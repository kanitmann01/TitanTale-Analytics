import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import NavShell from "@/components/NavShell";
import SiteFooter from "@/components/SiteFooter";
import { getSeasonId, listSeasonsForNav } from "@/lib/season-server";
import { defaultDescription } from "@/lib/site-metadata";
import "./globals.css";

const display = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700", "900"],
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TTL Stats -- T90 Titans League Analytics",
    template: "%s",
  },
  description: defaultDescription,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: "TTL Stats",
    title: "TTL Stats -- T90 Titans League Analytics",
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "TTL Stats -- T90 Titans League Analytics",
    description: defaultDescription,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seasonId = await getSeasonId();
  const seasons = await listSeasonsForNav();

  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} font-body antialiased min-h-screen flex flex-col`}
      >
        <NavShell seasons={seasons} currentSeason={seasonId} />
        <div className="flex-1">{children}</div>
        <SiteFooter seasonId={seasonId} />
      </body>
    </html>
  );
}
