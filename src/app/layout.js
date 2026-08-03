import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RoomieMatch — AI-Powered Roommate Matching",
  description: "AI-powered roommate matching for verified college students.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
