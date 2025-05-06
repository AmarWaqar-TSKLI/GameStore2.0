'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FaPlay } from "react-icons/fa";

export default function GameDetailsPage() {
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(null);

    const formatUrl = (path) => {
        if (!path) return "";
        return path.startsWith("http") ? path : `http://localhost:1000${path}`;
    };

    useEffect(() => {
        if (!id) return;

        const fetchGame = async () => {
            try {
                const res = await fetch(`http://localhost:1000/game/${id}`);
                if (!res.ok) throw new Error("Failed to fetch game data");
                const data = await res.json();
                setGame(data);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        fetchGame();
    }, [id]);

    if (!game) return <div className="text-white p-10">Loading... {id}</div>;

    const screenshots = [
        game.cover_path, // index 0 = cover = trailer
        game.screenshot_1,
        game.screenshot_2,
        game.screenshot_3,
        game.screenshot_4,
        game.screenshot_5
    ].filter(Boolean);

    const convertToEmbedUrl = (url) => {
        try {
            const parsed = new URL(url);
            let videoId;

            if (parsed.hostname === "youtu.be") {
                videoId = parsed.pathname.slice(1);
            } else if (parsed.hostname.includes("youtube.com")) {
                videoId = parsed.searchParams.get("v");
            }

            if (!videoId) return url;

            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&iv_load_policy=3&fs=0`;
        } catch {
            return url;
        }
    };

    // Auto switch media
    useEffect(() => {
        let interval;
        let currentProgress = 0;
        const duration = activeIndex === 0 ? 100 : 30; // trailer plays fully, others 3s (progress %)

        interval = setInterval(() => {
            currentProgress += 1;
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                setProgress(0);
                setActiveIndex((prev) => (prev + 1) % screenshots.length);
            }
        }, duration); // adjust speed here

        return () => clearInterval(interval);
    }, [activeIndex, screenshots.length]);

    return (
        <div className="bg-[#0b0c10] text-white min-h-screen w-full">

            <div className='pt-8 px-8'>
                <h2 className="text-4xl font-semibold mb-4">{game.name}</h2>
            </div>

            <div className='flex justify-between px-8 pb-8'>

                {/* MAIN PREVIEW AREA */}
                <div className="w-[60%]">
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg relative">
                        {activeIndex === 0 && game.trailer_url ? (
                            <iframe
                                src={convertToEmbedUrl(game.trailer_url)}
                                title="Game Trailer"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <img
                                src={`/${screenshots[activeIndex]}`}
                                className="w-full h-full object-cover"
                                alt="screenshot"
                            />
                        )}
                    </div>
                </div>

                {/* TEXT INFO */}
                <div className="w-[38%]">
                    <h1 className="text-2xl font-bold mb-4">{game.name}</h1>
                    <p className="text-[12px] text-gray-300 mb-6 text-justify">{game.description}</p>
                    <div className="text-sm uppercase space-x-4 text-gray-400">
                        <span>{game.genre}</span>
                        <span>Rating: {game.rating}/5</span>
                    </div>
                </div>

            </div>

            {/* THUMBNAIL CAROUSEL */}
            {screenshots.length > 0 && (
                <div className="px-8">
                    <div className="grid grid-cols-6 gap-4">
                        {screenshots.map((screenshot, i) => {
                            const isActive = i === activeIndex;
                            return (
                                <div
                                    key={i}
                                    onClick={() => {
                                        setActiveIndex(i);
                                        setProgress(0);
                                    }}
                                    className="relative rounded-lg overflow-hidden w-[180px] h-[100px] cursor-pointer group"
                                >
                                    {screenshot.includes("cover") ? (
                                        <div className='relative w-full h-full'>
                                            <img
                                                src={`/${screenshot}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <FaPlay className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-6 h-6" />
                                        </div>
                                    ) : (
                                        <img
                                            src={`/${screenshot}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}

                                    {/* Progress bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/20">
                                        <div
                                            className="h-full bg-white transition-all duration-100"
                                            style={{
                                                width: isActive ? `${progress}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
