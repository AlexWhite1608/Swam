import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <AuthProvider>
          <QueryProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </QueryProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast:
                  "group toast bg-white text-foreground border shadow-lg border-muted/50",
                description: "!text-foreground",
                actionButton:
                  "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton:
                  "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                error: "!bg-white !text-red-600",
                success: "!bg-white !text-green-600",
                warning: "!bg-white !text-yellow-600",
                info: "!bg-white !text-blue-600",
              },
            }}
            duration={3000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
