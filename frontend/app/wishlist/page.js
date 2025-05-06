"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '@/utils/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const WishlistPage = () => {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);
    const user = getCurrentUser();

    const router = useRouter();
    // Fetch wishlist games
    const fetchWishlistGames = () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        fetch(`http://localhost:1000/Wishlist/${user.UID}`)
            .then((response) => response.json())
            .then((data) => {
                setGames(data || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching wishlist data:", error);
                setIsLoading(false);
            });
    };

    const handleRemoveFromWishlist = (gameId) => {
        if (!user) return;

        fetch(`http://localhost:1000/Wishlist/${user.UID}/${gameId}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to remove from wishlist');
                return response.json();
            })
            .then(() => {
                setGames(prevGames => prevGames.filter(game => game.game_id !== gameId));
            })
            .catch(error => {
                console.error("Error removing from wishlist:", error);
            });
    };

    useEffect(() => {
        fetchWishlistGames();
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-6">Wishlist</h1>
                <p className="text-xl mb-8">You need to be logged in to view your wishlist</p>
                <div className="flex gap-4">
                    <a
                        onClick={() => router.push('/signup')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 cursor-pointer"
                    >
                        Create Account
                    </a>
                    <a
                        onClick={() => router.push('/signin')}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition duration-200 cursor-pointer"
                    >
                        Log In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden p-5 text-white">
            <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-3 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {games.length > 0 ? (
                        games.map((game) => (
                            <div
                                key={game.game_id}
                                className="relative cursor-pointer group text-white transition duration-300 hover:translate-y-[-6px] bg-black rounded-lg group"
                            >
                                <div
                                    className="absolute top-0 right-3 opacity-0 group-hover:opacity-100 group-hover:top-3 transition-all hover:scale-125 duration-300 z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFromWishlist(game.game_id);
                                    }}
                                    title="Remove from wishlist"
                                >
                                    {/* Minus icon (styled like Plus icon) */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        fill="white"
                                    >
                                        <rect width="24" height="24" fill="black" />
                                        <path
                                            d="M8 12H16"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                <div className="w-full">
                                    <img
                                        src={game.cover_path}
                                        className="object-cover w-full h-[242px] rounded-t-lg"
                                        alt={game.name}
                                    />
                                </div>
                                <div className="pt-2 pb-2 pl-2 text-[18px]">
                                    <h1>{game.name}</h1>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-400 text-lg">Your wishlist is empty</p>
                            <a
                                onClick={() => router.push('/games')}
                                className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 cursor-pointer"
                            >
                                Browse Games
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
