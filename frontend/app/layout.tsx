import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Camplendar",
  description: "Hotel Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.ico" type="any" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <ErrorBoundary>
            <MainLayout>{children}</MainLayout>
          </ErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
