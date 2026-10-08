import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["400", "600", "700", "900"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://huyhg.dev"),
  title: "Huy Hoang — Software Engineer & AI/ML Researcher",
  description:
    "Software engineer building reliable systems and agentic tools across Go, Python, cloud infrastructure, and applied ML.",
  openGraph: { type: "website", url: "/", siteName: "Huy Hoang" },
  twitter: { card: "summary_large_image" },
  other: { google: "notranslate" }, // translation tools rewrite text nodes, which breaks React's DOM updates
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" translate="no" className={`${orbitron.variable} ${jetbrains.variable} ${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
