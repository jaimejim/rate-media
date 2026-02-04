import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TV Ratings - Content Analysis by Perspective",
  description: "Get movie and TV show ratings from different ideological perspectives.",
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
