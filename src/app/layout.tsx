import Navbar from "../components/navbar"; // Import the Navbar component
import "./globals.css";
import type { Metadata } from "next";

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
        <div id="navbar">
          <Navbar />
        </div>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
