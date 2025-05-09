"use client";
import { GoHomeFill } from "react-icons/go";
import React, { useEffect, useState } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { useRouter } from "next/navigation";

const Navbar = ({ onMenuToggle, isMobile }) => {
  const [user, setUser] = useState(null);
  const placeholders = ["Search for games", "Search for genres"];
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(!isMobile); // Hide search by default on mobile

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleChange = (e) => {
    const searchQuery = e.target.value;
    if (searchQuery) {
      router.push(`/games?search=${encodeURIComponent(searchQuery)}`, { scroll: false });
    } else {
      router.push(`/games`, { scroll: false });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <div className="bg-black w-full h-full flex items-center justify-between px-2 sm:px-5 py-2">
      {/* Left side - Menu and Home */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {isMobile && (
          <button onClick={onMenuToggle} className="text-gray-700">
            <svg className="w-7 h-7" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <div
          onClick={() => router.push(`/`)}
          className="cursor-pointer w-12 h-12 sm:w-[55px] sm:h-[55px] rounded-full flex items-center justify-center bg-[#1f1f1f]"
        >
          <GoHomeFill className="text-white h-[50%] w-[50%]" />
        </div>
      </div>

      {/* Middle - Search (shown differently on mobile) */}
      {isMobile ? (
        <>
          {showSearch ? (
            <div className="flex-1 mx-2">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
                autoFocus
              />
            </div>
          ) : (
            <button 
              onClick={toggleSearch}
              className="p-2 text-white"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </>
      ) : (
        <div className="flex-1 max-w-md mx-4">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
      )}

      {/* Right side - Auth buttons */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {!user ? (
          <>
            {/* Mobile: Show icons only, desktop: show full buttons */}
            {isMobile ? (
              <>
                <button 
                  onClick={() => router.push('/signin')}
                  className="p-2 text-white"
                  aria-label="Sign In"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="p-2 text-white"
                  aria-label="Sign Up"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <a onClick={() => router.push('/signin')} className="cursor-pointer relative px-3 py-2 sm:px-5 sm:py-3 overflow-hidden font-medium text-gray-600 bg-gray-100 border-gray-100 rounded-lg shadow-inner group text-sm sm:text-base">
                  <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
                  <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
                  <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
                  <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
                  <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-black opacity-0 group-hover:opacity-100"></span>
                  <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">SignIn</span>
                </a>

                <a onClick={() => router.push('/signup')} className="relative px-3 py-2 sm:px-5 sm:py-3 cursor-pointer overflow-hidden font-medium text-white bg-black border-black rounded-lg shadow-inner group text-sm sm:text-base">
                  <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
                  <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
                  <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
                  <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
                  <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-100 opacity-0 group-hover:opacity-100"></span>
                  <span className="relative transition-colors duration-300 delay-200 group-hover:text-black ease">SignUp</span>
                </a>
              </>
            )}
          </>
        ) : (
          <>
            {!isMobile && (
              <span className="text-white w-40 font-semibold text-sm sm:text-base">
                Welcome, {user.Username}!
              </span>
            )}
            <a onClick={handleLogout} className="cursor-pointer relative px-3 py-2 sm:px-5 sm:py-3 overflow-hidden font-medium text-gray-600 bg-gray-100 border-gray-600 rounded-lg group text-sm sm:text-base">
              <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
              <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
              <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
              <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
              <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-black opacity-0 group-hover:opacity-100"></span>
              <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">
                {isMobile ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                ) : (
                  "Logout"
                )}
              </span>
            </a>
          </>
        )}
      </div>

      {/* Close search button (mobile only) */}
      {isMobile && showSearch && (
        <button 
          onClick={toggleSearch}
          className="ml-2 p-2 text-white"
          aria-label="Close search"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Navbar;