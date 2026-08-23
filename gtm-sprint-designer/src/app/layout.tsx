import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GTM Sprint Designer — Momentum Mill",
  description:
    "One 4-week outbound experiment, designed from documented founder GTM experiments, with pre-registered kill criteria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={hanken.className}>{children}</body>
    </html>
  );
}
