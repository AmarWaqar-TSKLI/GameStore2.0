// app/layout.js
"use client";
import { usePathname } from 'next/navigation';
import Menu from './components/menu';
import Navbar from './components/navbar';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');

  return (
    <html lang="en">
      <head>
        {/* ✅ Roboto Font Embedding */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        {/* ✅ Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* ✅ Title */}
        <title>Game Explorer</title>

        {/* ✅ Description */}
        <meta name="description" content="Your website short description here." />
      </head>
      <body className="font-roboto">
        {!isAuthPage ? (
          <div className="flex h-[100vh] ">
            <div className='w-[15%] overflow-hidden'>

            <Menu width="w-[100%]" />
            </div>
            <div className="content w-[85%] h-screen flex flex-col overflow-y-auto custom-scrollbar">
              <div className="h-[10%] bg-white">
                <Navbar />
              </div>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
