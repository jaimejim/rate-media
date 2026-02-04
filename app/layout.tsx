import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rate Media - Movie & TV Show Analysis by Perspective",
  description: "Get movie and TV show ratings from different ideological perspectives. From progressive to traditional viewpoints.",
  keywords: ["movie ratings", "tv show ratings", "content analysis", "family friendly", "media reviews"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
