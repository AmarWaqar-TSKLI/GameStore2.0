import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from '../app/components/menu';
import Navbar from '../app/components/navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GameStore",
  description: "A NextJs Web App for GameStore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        </style>
        <div className="flex h-screen">
          <Menu width='w-[20%]' />
          <div className="content w-[80%] h-screen flex flex-col">
            <div className="h-[10%] bg-white">
              <Navbar />
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}