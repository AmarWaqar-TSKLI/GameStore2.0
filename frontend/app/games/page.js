"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { isAuthenticated, getCurrentUser } from "@/utils/auth";

const GamesContent = () => {
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [wishlistMap, setWishlistMap] = useState({});
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 18;
  const scrollRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";

  const fetchGames = async (pageNumber) => {
    setLoading(true);
    setError(null);

    try {
      let url = searchQuery
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/SearchGames?search=${encodeURIComponent(searchQuery)}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/Games?page=${pageNumber}&limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const games = Array.isArray(data) ? data : [];

      setAllGames(games);
      setFilteredGames(games);
      setHasNextPage(!searchQuery && games.length === limit);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setPage(1);
    router.push("/games");
  };

  const handleAddToWishlist = (game, e) => {
    e.stopPropagation();

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
        Accept: "application/json",
      },
      body: JSON.stringify({
        user_id: user.UID,
        game_id: game.game_id,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setWishlistMap((prev) => ({ ...prev, [game.game_id]: true }));
      })
      .catch((err) => console.error("Error adding to wishlist:", err));
  };

  useEffect(() => {
    fetchGames(page);

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [page, searchQuery]);

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {searchQuery && (
        <div className="p-4 text-white flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Search results for: <span className="text-indigo-400">"{searchQuery}"</span>
            {filteredGames.length === 0 && !loading && (
              <span className="text-gray-400 ml-2">- No games found</span>
            )}
          </h2>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md transition"
            aria-label="Clear search"
          >
            <FiX /> Clear search
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold p-4 text-white">All Games</h1>

      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {error && <div className="p-4 text-red-500">Error loading games: {error}</div>}

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div
                key={game.game_id}
                onClick={() => router.push(`/gameinfo/${game.game_id}`)}
                className="relative cursor-pointer text-white transition duration-300 hover:translate-y-[-6px] hover:shadow-xl hover:shadow-purple-500/20 bg-black rounded-lg group"
              >
                <div className="w-full">
                  <img
                    src={game.cover_path || "/placeholder-game.jpg"}
                    className="object-cover w-full h-[280px] rounded-t-lg"
                    alt={game.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-game.jpg";
                    }}
                  />
                </div>

                <div
                  className="absolute top-0 right-3 opacity-0 group-hover:opacity-100 group-hover:top-3 transition-all hover:scale-125 duration-300 z-10"
                  onClick={(e) => handleAddToWishlist(game, e)}
                  title={wishlistMap[game.game_id] ? "Added to wishlist" : "Add to wishlist"}
                  aria-label="Add to wishlist"
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
                  <h1 className="truncate">{game.name}</h1>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="mt-4 text-gray-400 col-span-full">No games found.</p>
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

const Page = () => {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center">Loading...</div>}>
      <GamesContent />
    </Suspense>
  );
};

export default Page;