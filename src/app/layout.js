import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "RoomieMatch — Find a Roommate You'll Actually Get Along With",
  description: "Verified college roommate matching based on lifestyle compatibility.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFFFFF] text-[#17151F] font-sans selection:bg-[#5B4EE5]/20 selection:text-[#17151F]">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
