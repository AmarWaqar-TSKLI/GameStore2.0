"use client"
import { useEffect, useState } from "react";
import { Carousel } from "./components/ui/Carousel";
import { TypewriterEffectSmooth } from "./components/ui/typewriter-effect";

export default function Home() {

  // const [users, setUsers] = useState([]);

  // useEffect(() => {
  //     fetch("http://localhost:1000/") 
  //         .then(response => response.json())
  //         .then(data => setUsers(data)) 
  //         .catch(error => console.error("Error fetching data:", error));
  // }, []);

  const mobileWords1 = [
    { text: "Find" },
    { text: "Games." }
  ];

  const mobileWords2 = [
    { text: "Build Your " },
    { text: "Wishlist!", className: "text-blue-500 dark:text-blue-500" }
  ];

  const desktopWords = [
    { text: "Find" },
    { text: "Games." },
    { text: "Build" },
    { text: "Your" },
    { text: "Wishlist!", className: "text-blue-500 dark:text-blue-500" }
  ];

  return (
    <>
      <div className="flex flex-col bg-slate-950  h-screen w-[100%] overflow-y-hidden custom-scrollbar overflow-x-hidden items-center rounded-l-md pt-5">
 {/* Mobile version (two typewriters) */}
      <div className="md:hidden flex flex-col items-center">
        <TypewriterEffectSmooth words={mobileWords1} hideCursorAfter={true} className="-mb-2" />
        <TypewriterEffectSmooth words={mobileWords2} />
      </div>
      
      {/* Desktop version (single typewriter) */}
      <div className="hidden md:block">
        <TypewriterEffectSmooth words={desktopWords} />
      </div>        <p className="text-slate-400 text-xl -mt-5 font-semibold px-5">Explore a vast library of games, track your favorites, and build the perfect wishlist for your next adventure.</p>
        <h1 className="text-white text-3xl sm:text-3xl md:text-3xl lg:text-5xl font-bold text-left w-full px-6 sm:px-0 sm:w-[67%] mt-10">
          Trending Games
        </h1>
        <div className='flex flex-col items-center justify-center max-lg:mt-6 pt-6 w-[100%]'>
          <Carousel
          />
        </div>
      </div>
    </>
  );
}
