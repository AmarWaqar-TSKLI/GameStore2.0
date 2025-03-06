"use client";
import { GoHomeFill } from "react-icons/go";
import React from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a JavaScript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e) => {
    console.log(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");
  };

  const router = useRouter();
  return (
    <div className="bg-black w-[100%] h-[100%] flex items-center justify-between px-5">
      <div className="flex w-[80%]">
        <div onClick={() => router.push(`/`)} className="cursor-pointer w-[55px] h-[55px] rounded-full flex items-center justify-center bg-[#1f1f1f]">
          <GoHomeFill className="text-white h-[50%] w-[50%]" />
        </div>
        <div className="h-[55px] w-[40%] flex flex-col justify-center items-center px-4">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
      <div className="flex gap-x-4">
        <a href="#_" className="relative px-5 py-3 overflow-hidden font-medium text-gray-600 bg-gray-100 border-gray-100 rounded-lg shadow-inner group ">
          <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
          <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
          <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
          <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
          <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-black opacity-0 group-hover:opacity-100"></span>
          <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">SignIn</span>
        </a>
        <a href="#_" className="relative px-5 py-3 overflow-hidden font-medium text-white bg-black border-black rounded-lg shadow-inner group ">
          <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
          <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
          <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
          <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
          <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-100 opacity-0 group-hover:opacity-100"></span>
          <span className="relative transition-colors duration-300 delay-200 group-hover:text-black ease">SignUp</span>
        </a>
      </div>

    </div>
  ); 
};

export default Navbar;
