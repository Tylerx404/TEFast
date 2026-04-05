import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/app/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEFast",
  description: "Frontend student-first cho nền tảng học TOEIC và IELTS TEFast",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
      >
        <Providers>
          <div className="flex min-h-full flex-col">
            <SiteHeader session={session} />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
