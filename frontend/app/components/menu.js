"use client"; // Required for using `useRouter` in Next.js App Router

import { useRouter } from "next/navigation";
import { IconBrandFacebookFilled, IconBrandInstagramFilled, IconBrandTwitterFilled, IconBrandYoutubeFilled } from "@tabler/icons-react";
import React from "react";

const Menu = ({ width }) => {
  const router = useRouter();

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

  return (
    <div className={`${width} bg-black flex flex-col`}>
      <div className="logo flex items-center justify-center h-[10%]">
        <img src="/Logo.svg" alt="Logo" className="w-[50%]" />
      </div>
      <div className="flex flex-col">
        <p className="text-white ml-5">Genres</p>
        <ul className="w-[100%] text-slate-400 rounded-lg shadow-lg p-2">
          {Genres.map((genre, index) => (
            <li
              key={genre}
              onClick={() => router.push(`/genre/${genre.toLowerCase()}`)}
              className="px-6 text-sm py-2 cursor-pointer hover:bg-gray-900 rounded transition duration-200"
            >
              {genre}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-slate-200 h-[2px] w-[90%] mx-auto rounded-md my-6"></div>
      <div className="flex flex-col mt-4">
        <p className="text-white ml-5">Navigate</p>
        <ul className="w-[100%] text-slate-400 rounded-lg shadow-lg p-2">
          {Navigate.map((item, index) => (
            <li key={item} className="px-6 text-sm py-2 cursor-pointer hover:bg-gray-900 rounded transition duration-200"
            onClick={() => router.push(`/wishlist`)}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-slate-200 h-[2px] w-[90%] mx-auto rounded-md my-6"></div>
      <div className="my-2 flex flex-col w-[100%]">
        <p className="w-[100%] text-center text-gray-200 text-sm">Check us out on</p>
        <div className="w-[100%] flex gap-x-1 items-center justify-center">
          <IconBrandYoutubeFilled className="text-red-600" />
          <IconBrandInstagramFilled className="text-pink-600" />
          <IconBrandFacebookFilled className="text-blue-900" />
          <IconBrandTwitterFilled className="text-blue-400" />
        </div>
      </div>
    </div>
  );
};

export default Menu;
