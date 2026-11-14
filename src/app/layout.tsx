import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fraunces: a soft, slightly odd old-style serif for names and headings. Geist and Geist Mono carry everything that has to be read fast.
const display = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz", "SOFT"] });
const sans = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://huyhg.dev"),
  title: "Huy Hoang — Software Engineer",
  description:
    "Huy Hoang builds backend, cloud and applied-ML systems. Computer Engineering at the University of Florida, class of 2027. Previously Uber.",
  openGraph: { type: "website", url: "/", siteName: "Huy Hoang" },
  twitter: { card: "summary_large_image" },
  other: { google: "notranslate" }, // translation tools rewrite text nodes, which breaks React's DOM updates
};

export const viewport: Viewport = { themeColor: "#070b14", colorScheme: "dark" };

// Decides, before anything is painted, whether the intro plays: once per browser session (or whenever the URL has
// ?intro), and never with a deep link, reduced motion or no JavaScript. It marks <html data-intro>; the styles and
// Site.tsx take it from there.
const intro = `try{var d=document.documentElement;if(location.hash.length<2&&(!sessionStorage.getItem("intro")||/[?&]intro\\b/.test(location.search))&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="open";sessionStorage.setItem("intro","1")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" translate="no" className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: intro }} />
        {children}
      </body>
    </html>
  );
}
