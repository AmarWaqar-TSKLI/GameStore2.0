"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FiX } from "react-icons/fi";
import { isAuthenticated, getCurrentUser } from "@/utils/auth";

const GenrePage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const genre = params?.genre;
    const searchQuery = searchParams.get('search') || '';
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [wishlistMap, setWishlistMap] = useState({});
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const limit = 18;
    const scrollRef = useRef(null);

    const fetchGames = async (pageNumber) => {
        try {
            if (!genre) return;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/games/${genre}?page=${pageNumber}&limit=${limit}`);
            const data = await response.json();
            setGames(data || []);
            filterGames(data || [], searchQuery);
            setHasNextPage(data?.length === limit); // Disable "Next" if fewer than 18 games returned
        } catch (error) {
            console.error("Error fetching genre games:", error);
        }
    };

    const filterGames = (gamesList, query) => {
        if (!query) {
            setFilteredGames(gamesList);
            return;
        }
        const filtered = gamesList.filter(game =>
            game.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredGames(filtered);
    };

    const clearSearch = () => {
        router.push(`/genre/${genre}`);
    };

    const handleAddToWishlist = (game) => {
        if (!isAuthenticated()) {
            router.push(`/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const user = getCurrentUser();
        if (!user) return;

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/WishlistInsertion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                user_id: user.UID,
                game_id: game.game_id
            }),
        })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(() => {
                setWishlistMap((prev) => ({ ...prev, [game.game_id]: true }));
            })
            .catch((error) => {
                console.error("Error adding game to wishlist:", error);
            });
    };

    useEffect(() => {
        fetchGames(page);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [page, genre]);

    useEffect(() => {
        filterGames(games, searchQuery);
    }, [searchQuery, games]);

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
            {searchQuery && (
                <div className="p-4 text-white flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        Search results for: <span className="text-indigo-400">"{searchQuery}"</span>
                        {filteredGames.length === 0 && (
                            <span className="text-gray-400 ml-2">- No games found</span>
                        )}
                    </h2>
                    <button
                        onClick={clearSearch}
                        className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md transition"
                    >
                        <FiX /> Clear search
                    </button>
                </div>
            )}

            <h1 className="text-2xl font-bold capitalize p-4">{genre} Games</h1>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-3 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredGames.length > 0 ? (
                        filteredGames.map((game) => (
                            <div 
                                onClick={() => router.push(`/gameinfo/${game.game_id}`)}
                                key={game.game_id}
                                className="relative cursor-pointer text-white transition duration-300 hover:translate-y-[-6px] hover:shadow-xl hover:shadow-purple-500/20 bg-black rounded-lg group"
                            >
                                <div className="w-full">
                                    <img src={`\\${game.cover_path}`} className="object-cover w-full h-[280px] rounded-t-lg" alt={game.name} />
                                </div>

                                <div
                                    className="absolute top-0 right-3 opacity-0 group-hover:opacity-100 group-hover:top-3 transition-all hover:scale-125 duration-300 z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToWishlist(game);
                                    }}
                                    title={wishlistMap[game.game_id] ? "Added" : "Add to wishlist"}
                                >
                                    {wishlistMap[game.game_id] ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M20.285 6.709l-11.607 11.607-5.657-5.657 1.414-1.414 4.243 4.243 10.193-10.193z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
                                            <rect width="24" height="24" fill="black" />
                                            <path d="M12 8V16M16 12H8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>

                                <div className="p-3 text-[18px]">
                                    <h1>{game.name}</h1>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="mt-4 text-gray-400 col-span-full">No games found for this genre.</p>
                    )}
                </div>

                {!searchQuery && filteredGames.length > 0 && (
                    <div className="w-full flex justify-center gap-4 p-6">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className={`cursor-pointer px-4 py-2 bg-gray-700 rounded ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            className={`cursor-pointer px-4 py-2 bg-gray-700 rounded ${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!hasNextPage}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenrePage;
