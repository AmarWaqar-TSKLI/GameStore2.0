"use client";
import { useRouter, usePathname } from "next/navigation";
import { IconBrandFacebookFilled, IconBrandInstagramFilled, IconBrandTwitterFilled, IconBrandYoutubeFilled } from "@tabler/icons-react";
import React, { useState, useEffect } from "react";

const Menu = ({ width }) => {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedNavItem, setSelectedNavItem] = useState(null); // New state for navigation
  const [isHovering, setIsHovering] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if pathname matches a genre path
    if (pathname.startsWith("/genre/")) {
      // Extract the genre from the URL
      const genreFromUrl = pathname.split("/genre/")[1];
      if (genreFromUrl) {
        // Find the matching genre with case-insensitive comparison
        const matchedGenre = Genres.find(
          g => g.toLowerCase() === genreFromUrl.toLowerCase()
        );
        if (matchedGenre) {
          setSelectedGenre(matchedGenre);
          setSelectedNavItem(null); // Clear any navigation selection
        }
      }
    } 
    // Check for navigation items
    else {
      setSelectedGenre(null); // Clear genre selection
      
      // Handle exact matches for navigation items
      if (pathname === "/") {
        setSelectedNavItem("Home");
      } else {
        const navItem = Navigate.find(item => {
          // For Home, we already checked exact match
          if (item === "Home") return false;
          
          // For other items, check exact match or starts with followed by /
          const itemPath = `/${item.toLowerCase()}`;
          return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
        });
        
        if (navItem) {
          setSelectedNavItem(navItem);
        } else {
          setSelectedNavItem(null);
        }
      }
    }
  }, [pathname]);

  const Genres = [
    "Action",
    "RPG",
    "Puzzle",
    "Shooter",
    "Adventure",
    "Indie",
    "Platformer",
    "Multiplayer",
    "Simulation"
  ];

  const Navigate = ["Home", "Wishlist", "AboutUs", "ContactUs"];

  // Glow effect for active item
  useEffect(() => {
    if (activeItem) {
      const timer = setTimeout(() => setActiveItem(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeItem]);

  return (
    <div
      className={`${width} bg-gradient-to-b from-black to-gray-900 flex flex-col border-r border-gray-800 transition-all duration-500 ${isHovering ? 'shadow-2xl shadow-red-900/30' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Logo with animation */}
      <div className="logo flex items-center justify-center h-[10%] py-4 group">
        <img
          src="/Logo.svg"
          alt="Logo"
          className="w-[50%] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[5deg] drop-shadow-lg"
        />
      </div>

      {/* Genres */}
      <div className="flex flex-col px-2">
        <p className="text-white ml-3 mb-3 text-lg font-bold tracking-wider relative inline-block">
          Genres
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-500 group-hover:w-full"></span>
        </p>
        <ul className="w-[100%] text-slate-400 rounded-lg space-y-1">
          {Genres.map((genre) => (
            <li
              key={genre}
              onClick={() => {
                setSelectedGenre(genre);
                setActiveItem(genre);
                router.push(`/genre/${genre.toLowerCase()}`);
              }}
              className={`px-4 py-2 cursor-pointer rounded-md transition-all duration-300 flex items-center gap-3 relative overflow-hidden
                ${selectedGenre === genre
                  ? "bg-gradient-to-r from-red-900/70 to-red-900/30 text-white shadow-[0_0_12px_4px_rgba(255,50,50,0.3)]"
                  : "hover:bg-gray-800/50 hover:text-white"
                }
                ${activeItem === genre ? 'animate-pulse' : ''}
              `}
            >
              {/* Animated background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent opacity-0 
                ${selectedGenre === genre ? 'opacity-100' : 'group-hover:opacity-50'} 
                transition-opacity duration-300`}></div>

              {/* Icon with bounce animation */}
              <div className={`relative z-10 ${selectedGenre === genre ? 'animate-bounce' : 'hover:animate-pulse'}`}>
                <img
                  src={`/icons/${genre.toLowerCase()}.png`}
                  alt={`${genre} icon`}
                  className={`w-5 h-5 transition-all duration-300 ${selectedGenre === genre ? "scale-125" : "hover:scale-110"}`}
                />
              </div>

              {/* Text with slide effect */}
              <span className={`relative z-10 text-sm font-medium transition-all duration-300 transform 
                ${selectedGenre === genre ? "scale-105 translate-x-1" : ""} 
                ${isHovering ? "translate-x-1" : ""}`}>
                {genre}
              </span>

              {/* Hover underline effect */}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 
                ${selectedGenre === genre ? "w-full" : "group-hover:w-[80%]"}`}></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider with animation */}
      <div className="relative my-6 mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-transparent via-red-500 to-transparent h-[1px] w-full relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800/50"></div>
          <div className={`absolute top-0 left-0 h-full bg-red-600 transition-all duration-1000 ${isHovering ? 'w-full' : 'w-0'}`}></div>
        </div>
      </div>

      {/* Navigation - Updated with persistent active state */}
      <div className="flex flex-col px-2">
        <p className="text-white ml-3 mb-3 text-lg font-bold tracking-wider">Navigate</p>
        <ul className="w-[100%] text-slate-400 rounded-lg space-y-1">
          {Navigate.map((item) => (
            <li
              key={item}
              onClick={() => {
                setSelectedNavItem(item); // Set persistent active state
                setActiveItem(item); // Set temporary pulse effect
                {if(item == 'Home'){
                  router.push(`/`);
                }
              else{
                router.push(`/${item.toLowerCase()}`);
              }}
              }}
              className={`px-4 py-2 cursor-pointer rounded-md transition-all duration-300 relative overflow-hidden group
                ${selectedNavItem === item
                  ? "bg-gradient-to-r from-blue-900/70 to-blue-900/30 text-white shadow-[0_0_12px_4px_rgba(59,130,246,0.3)]"
                  : "hover:bg-gray-800/50 hover:text-white"
                }
              `}
            >
              {/* Active state background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent 
                ${selectedNavItem === item ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} 
                transition-opacity duration-300`}></div>
              
              <span className={`relative z-10 text-sm font-medium transition-all duration-300 transform 
                ${selectedNavItem === item ? "scale-105 translate-x-1" : ""} 
                group-hover:translate-x-2 flex items-center`}>
                
                {/* Bullet point - stays active when selected */}
                <span className={`inline-block w-2 h-2 rounded-full mr-3 transition-all duration-300 
                  ${selectedNavItem === item 
                    ? "bg-blue-500 scale-125 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]" 
                    : "bg-gray-600 group-hover:bg-blue-400 group-hover:scale-100"}`}></span>
                {item}
              </span>
              
              {/* Arrow - shows for both active and hover states */}
              <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 
                ${selectedNavItem === item ? "text-blue-400" : "text-red-500"} 
                ${selectedNavItem === item ? "opacity-100" : "opacity-0 group-hover:opacity-100"} 
                transition-all duration-300 ${selectedNavItem === item ? "translate-x-0" : "translate-x-2 group-hover:translate-x-0"}`}>
                →
              </span>
            </li>
          ))}
        </ul>
      </div>


      {/* Divider */}
      <div className="relative my-6 mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-transparent via-red-500 to-transparent h-[1px] w-full relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800/50"></div>
          <div className={`absolute top-0 left-0 h-full bg-red-600 transition-all duration-1000 ${isHovering ? 'w-full' : 'w-0'}`}></div>
        </div>
      </div>

      {/* Social */}
      <div className="my-4 flex flex-col items-center">
        <p className="w-[100%] text-center text-gray-400 text-sm mb-3 tracking-wider">CONNECT WITH US</p>
        <div className="w-[100%] flex gap-x-4 items-center justify-center">
          {[
            { icon: <IconBrandYoutubeFilled size={24} />, color: "text-red-600" },
            { icon: <IconBrandInstagramFilled size={24} />, color: "text-pink-600" },
            { icon: <IconBrandFacebookFilled size={24} />, color: "text-blue-600" },
            { icon: <IconBrandTwitterFilled size={24} />, color: "text-blue-400" }
          ].map((social, index) => (
            <div
              key={index}
              className={`p-2 rounded-full bg-gray-800/50 ${social.color} hover:bg-gray-700 transition-all duration-300 
                hover:scale-125 hover:shadow-lg hover:shadow-red-500/20 cursor-pointer transform hover:-translate-y-1`}
              onClick={() => setActiveItem(`social-${index}`)}
            >
              {social.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;