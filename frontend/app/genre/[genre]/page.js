import React from "react";

// Fetch Data for a Specific Genre
const fetchGamesByGenre = async (genre) => {
  try {
    const res = await fetch(`http://localhost:1000/games/${genre}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const GenrePage = async ({ params }) => {
  const { genre } = params;
  const games = await fetchGamesByGenre(genre);

  return (
    <div className="p-5 text-white">
      <h1 className="text-2xl font-bold capitalize">{genre} Games</h1>
      {games.length > 0 ? (
        <ul className="mt-4">
          {games.map((game) => (
            <li key={game.game_id} className="p-2 border-b border-gray-700">
              {game.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-gray-400">No games found for this genre.</p>
      )}
    </div>
  );
};

export default GenrePage;
