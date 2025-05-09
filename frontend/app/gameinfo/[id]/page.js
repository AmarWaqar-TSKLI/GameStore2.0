'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaStar, FaRegStar } from "react-icons/fa";
import { isAuthenticated, getCurrentUser } from "@/utils/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function GameDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const [game, setGame] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const timeoutRef = useRef(null);
    const progressRef = useRef(null);
    const [requirements, setRequirements] = useState({ min: null, max: null });
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ comment: '', stars: 0 });
    const [hoverStar, setHoverStar] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const reviewInputRef = useRef(null);
    // Add these to your component's state and refs
    const [isTrailerPlaying, setIsTrailerPlaying] = useState(true);
    const [isInWishlist, setIsInWishlist] = useState(false);

    // Add this useEffect to handle play/pause state changes
    useEffect(() => {
        if (activeIndex === 0 && game?.trailer_url) {
            setIsTrailerPlaying(isPlaying);
        }
    }, [isPlaying, activeIndex, game?.trailer_url]);


    useEffect(() => {
        if (!id) return;

        const fetchGame = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/game/${id}`);
                if (!res.ok) throw new Error("Failed to fetch game data");
                const data = await res.json();
                setGame(data);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        fetchGame();
    }, [id]);

    useEffect(() => {
        if (!game || !game.name) return;

        const fetchRequirements = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/game/${game.name}/requirements`);
                if (!res.ok) throw new Error("Failed to fetch requirements");
                const data = await res.json();
                setRequirements(data);
            } catch (err) {
                console.error("Requirements fetch error:", err);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/review/${game.game_id}`);
                if (!res.ok) throw new Error("Failed to fetch reviews");
                const data = await res.json();
                setReviews(data);

                // Check if current user has already reviewed
                if (isAuthenticated()) {
                    const user = getCurrentUser();
                    const existingReview = data.find(r => r.UID === user.UID);
                    console.log(data);
                    if (existingReview) {
                        setUserReview(existingReview);
                        setNewReview({
                            comment: existingReview.Comment,
                            stars: existingReview.Stars
                        });
                    }
                }
            } catch (err) {
                console.error("Reviews fetch error:", err);
            }
        };

        fetchRequirements();
        fetchReviews();
    }, [game]);

    const screenshots = game ? [
        game.cover_path,
        game.screenshot_1,
        game.screenshot_2,
        game.screenshot_3,
        game.screenshot_4,
        game.screenshot_5
    ].filter(Boolean) : [];

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

            return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&iv_load_policy=3&fs=0`;
        } catch {
            return url;
        }
    };

    const startProgress = (duration) => {
        let start = Date.now();
        clearInterval(progressRef.current);

        progressRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);
            if (newProgress >= 100) {
                clearInterval(progressRef.current);
            }
        }, 100);
    };

    useEffect(() => {
        if (screenshots.length === 0) return;

        const isTrailer = activeIndex === 0 && game?.trailer_url;
        if (isTrailer && isTrailerPlaying) return;

        const delay = isTrailer ? 2000 : 2000;

        startProgress(delay);
        timeoutRef.current = setTimeout(() => {
            setActiveIndex(prev => (prev + 1) % screenshots.length);
        }, delay);

        return () => {
            clearTimeout(timeoutRef.current);
            clearInterval(progressRef.current);
            setProgress(0);
        };
    }, [activeIndex, screenshots.length, game?.trailer_url]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            router.push(`/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const user = getCurrentUser();
        if (!user || newReview.stars === 0) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/review/${user.UID}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    GameID: game.game_id,
                    Comment: newReview.comment,
                    Stars: newReview.stars
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || 'Failed to submit review');
                return;
            }

            // Find the current user's review in the response
            const currentUserReview = result.find(r => r.UID === user.UID);
            console.log(currentUserReview, result)
            if (!currentUserReview) {
                throw new Error("Failed to find submitted review in response");
            }

            // Update both reviews list and userReview state
            setReviews(result);
            setUserReview(currentUserReview);

            // Update the form fields immediately with the submitted values
            setNewReview({
                comment: currentUserReview.Comment,
                stars: currentUserReview.Stars
            });

            toast.success('Review submitted successfully!');

        } catch (error) {
            console.error("Error:", error);
            toast.error('Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReviewInputClick = () => {
        if (!isAuthenticated()) {
            router.push(`/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        reviewInputRef.current.focus();
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.Stars, 0);
        return (sum / reviews.length).toFixed(1);
    };

    useEffect(() => {
        const checkWishlist = async () => {
            if (!isAuthenticated()) return;

            const user = getCurrentUser();
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/wishlist/${user.UID}`);
                if (!res.ok) throw new Error("Failed to fetch wishlist");

                const wishlist = await res.json();
                const exists = wishlist.some(w => w.GameID === game.game_id);
                setIsInWishlist(exists);
            } catch (err) {
                console.error("Wishlist fetch error:", err);
            }
        };

        if (game?.game_id) {
            checkWishlist();
        }
    }, [game]);

    const handleWishlistClick = async () => {
        if (!isAuthenticated()) {
            router.push(`/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (isInWishlist) return; // Already added

        const user = getCurrentUser();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/WishlistInsertion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.UID, game_id: game.game_id }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to add to wishlist');

            setIsInWishlist(true);
            toast.success('Added to wishlist!');
        } catch (err) {
            console.error("Add to wishlist error:", err);
            toast.error('Could not add to wishlist');
        }
    };




    if (!game) return <div className="text-white p-10">Loading... {id}</div>;

    const avgRating = calculateAverageRating();

    return (
        <div className="bg-[#0b0c10] text-white w-full h-screen">
            <ToastContainer position="bottom-right" autoClose={3000} />

            {/* GAME HEADER SECTION */}
            <div className="pt-8 px-8">
                <h2 className="text-3xl sm:font-3xl font-bold mb-2 bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent w-full">
                    {game.name}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                    <span className="bg-indigo-900/50 px-3 py-1 rounded-full">{game.genre}</span>
                    <span className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        {avgRating}/5
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT SECTION */}
            <div className='flex flex-col lg:flex-row justify-between px-8 pb-8 gap-8 w-full'>
                {/* MAIN PREVIEW AREA */}
                <div className="w-full lg:w-[70%] space-y-6">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl relative group">
                        {activeIndex === 0 && game.trailer_url ? (
                            <iframe
                                src={convertToEmbedUrl(game.trailer_url)}
                                title="Game Trailer"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture "
                                allowFullScreen
                            />
                        ) : (
                            <img
                                src={`/${screenshots[activeIndex]}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt="screenshot"
                            />
                        )}
                    </div>

                    {/* THUMBNAIL CAROUSEL */}
                    {screenshots.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {screenshots.map((screenshot, i) => {
                                const isActive = i === activeIndex;
                                const isTrailer = i === 0 && game.trailer_url;
                                const progressWidth = isActive ? `${progress}%` : '0%';

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`relative rounded-xl overflow-hidden aspect-video cursor-pointer transition-all duration-300 ${isActive
                                            ? 'ring-2 ring-indigo-400 scale-[1.02] shadow-lg'
                                            : 'opacity-80 hover:opacity-100 hover:ring-1 hover:ring-gray-500'
                                            }`}
                                    >
                                        {isTrailer ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={`/${screenshot}`}
                                                    className="w-full h-full object-cover"
                                                    alt="cover"
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <FaPlay className="text-white/80 text-lg" />
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={`/${screenshot}`}
                                                className="w-full h-full object-cover"
                                                alt={`screenshot-${i}`}
                                            />
                                        )}
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-indigo-400 transition-all duration-100"
                                            style={{ width: progressWidth }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* SIDEBAR INFO */}
                <div className="w-full lg:w-[28%] bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 self-start">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-200">About the Game</h3>
                            {/* Description with responsive height */}
                            <p className="text-gray-300 text-sm leading-relaxed overflow-y-auto custom-scrollbar max-h-[50vh] md:max-h-[60vh] lg:max-h-[calc(100vh*0.5625)] pr-2">
                                {game.description}
                            </p>

                        </div>

                        <button
                            onClick={handleWishlistClick}
                            className={`mt-4 py-3 px-4 rounded-lg font-semibold w-full transition-all duration-300 ${isInWishlist
                                ? 'bg-green-700 text-white cursor-default'
                                : 'bg-indigo-600 shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/20 text-white'
                                }`}
                        >
                            {isInWishlist ? '✓ Added to Wishlist' : 'Add to Wishlist'}
                        </button>

                    </div>
                </div>
            </div>


            {/* SYSTEM REQUIREMENTS */}
            <div className="px-8 pb-12 w-full mt-3">
                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
                    System Requirements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Minimum Requirements */}
                    <div className='relative group'>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                        <div className='relative bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-indigo-500/30 transition-all duration-300'>
                            <div className="flex items-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                                <h3 className="text-lg font-semibold text-gray-200">Minimum</h3>
                            </div>
                            {requirements.min ? (
                                <ul className="text-sm space-y-3">
                                    {Object.entries(requirements.min).map(([key, value]) => (
                                        <li key={key} className="flex">
                                            <span className="text-gray-400 font-medium w-24 flex-shrink-0">{key}:</span>
                                            <span className="text-gray-300">{value}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">Not specified</p>
                            )}
                        </div>
                    </div>

                    {/* Recommended Requirements */}
                    <div className='relative group'>
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                        <div className='relative bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-emerald-500/30 transition-all duration-300'>
                            <div className="flex items-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                                <h3 className="text-lg font-semibold text-gray-200">Recommended</h3>
                            </div>
                            {requirements.max ? (
                                <ul className="text-sm space-y-3">
                                    {Object.entries(requirements.max).map(([key, value]) => (
                                        <li key={key} className="flex">
                                            <span className="text-gray-400 font-medium w-24 flex-shrink-0">{key}:</span>
                                            <span className="text-gray-300">{value}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">Not specified</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* REVIEWS SECTION */}
            <div className="px-8 pb-12 w-full">
                <div className="flex justify-between flex-wrap gap-3 sm:gap-0 items-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                        Player Reviews
                    </h2>
                    <div className="flex items-center bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800">
                        <span className="text-xl font-bold mr-2">{calculateAverageRating()}</span>
                        <div className="flex mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-yellow-400">
                                    {star <= calculateAverageRating() ? (
                                        <FaStar className="inline-block" />
                                    ) : (
                                        <FaRegStar className="inline-block" />
                                    )}
                                </span>
                            ))}
                        </div>
                        <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                    </div>
                </div>

                {/* REVIEW FORM */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-800/50 shadow-lg">
                    <form onSubmit={handleReviewSubmit}>
                        <div className="mb-6">
                            {/* Add this notification banner */}
                            {userReview && (
                                <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3 mb-4 flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-200">You've already reviewed this game</h3>
                                        <div className="mt-1 text-sm text-blue-300">
                                            <p>Updating your rating will replace your previous {userReview.Stars}-star review.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="block text-gray-300 mb-3 text-lg font-medium">
                                {userReview ? 'Update Your Rating' : 'Your Rating'}
                            </label>
                            <div className="flex space-x-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`text-3xl transition-all duration-200 ${star <= (hoverStar || newReview.stars) ?
                                            'text-yellow-400 transform hover:scale-110' :
                                            'text-gray-600 hover:text-yellow-400'}`}
                                        onClick={() => setNewReview({ ...newReview, stars: star })}
                                        onMouseEnter={() => setHoverStar(star)}
                                        onMouseLeave={() => setHoverStar(0)}
                                    >
                                        {star <= (hoverStar || newReview.stars) ? <FaStar /> : <FaRegStar />}
                                    </button>
                                ))}
                                <span className="ml-3 mt-1 text-gray-400 self-center">
                                    {newReview.stars > 0 ? `${newReview.stars} star${newReview.stars > 1 ? 's' : ''}` : 'Rate this game'}
                                    {userReview && newReview.stars !== userReview.Stars && (
                                        <span className="ml-2 text-yellow-300 text-sm">(Previously: {userReview.Stars} stars)</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <textarea
                                ref={reviewInputRef}
                                className="w-full bg-gray-800/70 text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border border-gray-700 hover:border-indigo-500/30"
                                rows="5"
                                placeholder={userReview ? "Update your thoughts about this game..." : "Share your detailed experience with this game..."}
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                onClick={handleReviewInputClick}
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                disabled={newReview.stars === 0 || isSubmitting}
                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${newReview.stars === 0 ?
                                    'bg-gray-700 text-gray-400 cursor-not-allowed' :
                                    'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/20'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {userReview ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    userReview ? 'Update Review' : 'Submit Review'
                                )}
                            </button>
                            {userReview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewReview({ comment: '', stars: 0 });
                                        setUserReview(null);
                                    }}
                                    className="px-6 py-3 rounded-xl font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* REVIEWS LIST */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4 text-6xl">👾</div>
                            <h3 className="text-xl text-gray-300 mb-2">No reviews yet</h3>
                            <p className="text-gray-500">Be the first to share your thoughts about this game!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div
                                key={review.ReviewID}
                                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/10 border border-gray-800/50 hover:border-indigo-500/30"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold mr-4 text-xl">
                                            {review.Username ? review.Username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-100">{review.Username || 'Anonymous'}</h4>
                                            <div className="flex items-center mt-1 justify-center align-middle">
                                                <div className="flex mr-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className="text-yellow-400">
                                                            {star <= review.Stars ? (
                                                                <FaStar className="inline-block" />
                                                            ) : (
                                                                <FaRegStar className="inline-block" />
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.Date).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {isAuthenticated() && getCurrentUser().UID === review.Uid && (
                                        <button
                                            onClick={() => {
                                                setNewReview({
                                                    comment: review.Comment,
                                                    stars: review.Stars
                                                });
                                                setUserReview(review);
                                                reviewInputRef.current.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-sm bg-indigo-900/50 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors border border-indigo-800/50"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-300 pl-16">{review.Comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}