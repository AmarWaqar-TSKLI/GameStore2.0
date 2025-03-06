"use client"
import { Gaegu } from 'next/font/google';
import React from 'react'
import { useEffect, useState } from 'react';

const page = () => {

    const [games, setGames] = useState([]);

    useEffect(() => {
        fetch("http://localhost:1000/Games")
            .then((response) => response.json())
            .then((data) => setGames(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);



    return (

        <div>
            <ul>
                {games.map((game) => (
                    <li key={game.game_id} className="p-2 border-b border-gray-700">
                        {game.name}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default page
