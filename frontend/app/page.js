"use client"
import { useEffect, useState } from "react";
import {Carousel} from "./components/ui/Carousel";
import { TypewriterEffectSmooth } from "./components/ui/typewriter-effect";

export default function Home() {

  // const [users, setUsers] = useState([]);

  // useEffect(() => {
  //     fetch("http://localhost:1000/") 
  //         .then(response => response.json())
  //         .then(data => setUsers(data)) 
  //         .catch(error => console.error("Error fetching data:", error));
  // }, []);

  const words = [
    {
      text: "Find",
    },
    {
      text: "Games.",
    },
    {
      text: "Build",
    },
    {
      text: "Your",
    },
    {
      text: "Wishlist!",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <>
      <div className="flex flex-col bg-slate-950 h-screen w-[100%] overflow-x-hidden items-center rounded-l-md">
        <TypewriterEffectSmooth words = {words}/>
        <p className="text-slate-400 text-xl -mt-5 font-semibold ">Explore a vast library of games, track your favorites, and build the perfect wishlist for your next adventure.</p>
        <h1 className="text-white text-5xl font-bold w-[67%] mt-10">Trending Games</h1>
        <div className='flex flex-col items-center justify-center max-lg:mt-10 pt-6 w-[100%] h-screen'>
          <Carousel
          />
        </div>
      </div>
    </>
  );
}
