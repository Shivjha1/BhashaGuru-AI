import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BhashaGuru AI",
  description: "Learn in your own language with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}