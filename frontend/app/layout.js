"use client";
import { usePathname } from 'next/navigation';
import Menu from './components/menu';
import Navbar from './components/navbar';
import './globals.css';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close menu when resizing to desktop
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
        {/* ✅ Viewport meta tag for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ✅ Title */}
        <title>Game Explorer</title>

        {/* ✅ Description */}
        <meta name="description" content="Your website short description here." />
      </head>
      <body className="font-roboto">
        {!isAuthPage ? (
          <div className="relative flex flex-col md:flex-row h-[100vh] overflow-hidden">
            {/* Mobile menu overlay (only visible when menu is open on mobile) */}
            {isMobile && isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-10 md:hidden"
                onClick={toggleMobileMenu}
              />
            )}
            
            {/* Sidebar/Menu */}
            <div className={`
              ${isMobile ? 
                (isMobileMenuOpen ? 
                  'fixed inset-y-0 left-0 w-3/4 z-20' : 
                  'hidden') : 
                'w-full md:w-[30%] lg:w-[20%] xl:w-[15%]'} 
              bg-gray-800 h-screen overflow-y-auto custom-scrollbar
              transition-transform duration-300 ease-in-out sidebar
              ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
            `}>
              <Menu width="w-[100%]" />
            </div>
            
            {/* Main content */}
            <div className={`
              content w-full ${isMobile ? '' : 'md:w-[70%] lg:w-[80%] xl:w-[85%]'} 
              h-screen flex flex-col overflow-y-auto custom-scrollbar
              ${isMobileMenuOpen ? 'overflow-hidden' : ''}
            `}>
              <div className="h-[10%] bg-white">
                <Navbar onMenuToggle={toggleMobileMenu} isMobile={isMobile} />
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