import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
export const metadata: Metadata = {
  title: "IoT Hub",
  description: "Discover projects, learn new skills and share your own.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

// Add this import at the top:
