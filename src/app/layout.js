import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "User Management App",
  description: "Next.js + MySQL CRUD with auth and admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-surface text-ink">{children}</body>
    </html>
  );
}