// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. You must call these functions here (in the module scope)
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Saman's Barbier",
  description: "Book your next appointment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 2. Use the .variable property from the constants created above */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
