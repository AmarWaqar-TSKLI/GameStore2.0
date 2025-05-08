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

    useEffect(() => {
        if (!game || !game.name) return;
    
        const fetchRequirements = async () => {
            try {
                const res = await fetch(`http://localhost:1000/game/${game.name}/requirements`);
                if (!res.ok) throw new Error("Failed to fetch requirements");
                const data = await res.json();
                setRequirements(data);
            } catch (err) {
                console.error("Requirements fetch error:", err);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`http://localhost:1000/review/${game.game_id}`);
                if (!res.ok) throw new Error("Failed to fetch reviews");
                const data = await res.json();
                setReviews(data);
                
                // Check if current user has already reviewed
                if (isAuthenticated()) {
                    const user = getCurrentUser();
                    const existingReview = data.find(r => r.Uid === user.UID);
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

            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&iv_load_policy=3&fs=0`;
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
        const delay = isTrailer ? 60000 : 2000;

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

    const togglePlayPause = () => {
        setIsPlaying(prev => !prev);
        if (isPlaying) {
            clearTimeout(timeoutRef.current);
            clearInterval(progressRef.current);
        } else {
            setActiveIndex(prev => prev);
        }
    };

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
            const response = await fetch(`http://localhost:1000/review/${user.UID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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

            // Refresh reviews after successful submission
            const res = await fetch(`http://localhost:1000/review/${game.game_id}`);
            const data = await res.json();
            setReviews(data);
            
            // Update user review state
            const updatedUserReview = data.find(r => r.Uid === user.UID);
            setUserReview(updatedUserReview);
            
            // Show success message
            toast.success(userReview ? 'Review updated successfully!' : 'Review submitted successfully!');
            
            // Reset form if it was a new review
            if (!userReview) {
                setNewReview({ comment: '', stars: 0 });
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error('An error occurred while submitting your review');
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

    if (!game) return <div className="text-white p-10">Loading... {id}</div>;

    return (
        <div className="bg-[#0b0c10] text-white w-full">
            <ToastContainer position="bottom-right" autoClose={3000} />
            
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
                            />
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
                <div className="px-8 pb-8">
                    <div className="grid grid-cols-6 gap-4">
                        {screenshots.map((screenshot, i) => {
                            const isActive = i === activeIndex;
                            const isTrailer = i === 0 && game.trailer_url;

                            const duration = isTrailer ? 20000 : 2000;
                            const progressWidth = isActive ? `${progress}%` : '0%';

                            return (
                                <div
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`relative rounded-lg overflow-hidden w-[210px] h-[120px] cursor-pointer group transition-all duration-300 ${isActive ? 'ring-4 ring-white scale-105 shadow-[0_30px_60px_rgba(0,0,0,0.35)]  transition-transform' : 'opacity-80 hover:opacity-100'}`}
                                >
                                    {isTrailer ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={`/${screenshot}`}
                                                className="w-full h-full object-cover"
                                                alt="cover"
                                            />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center" onClick={togglePlayPause}>
                                                {isPlaying ? (
                                                    <FaPause className="text-white text-2xl" />
                                                ) : (
                                                    <FaPlay className="text-white text-2xl" />
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={`/${screenshot}`}
                                            className="w-full h-full object-cover"
                                            alt={`screenshot-${i}`}
                                        />
                                    )}
                                    <div className="absolute bottom-0 left-0 h-[4px] bg-white transition-all duration-100" style={{ width: progressWidth }} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SYSTEM REQUIREMENTS */}
            <div className="px-8 pb-12 w-full">
                <h2 className="text-2xl font-bold mb-4">System Requirements</h2>
                <div className="grid grid-cols-2 gap-8 w-[100%]">
                    <div className='min-w-[50%] bg-gray-900 p-8 rounded-lg'>
                        <h3 className="text-lg font-semibold mb-2">Minimum</h3>
                        {requirements.min ? (
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li><strong>OS:</strong> {requirements.min.OS}</li>
                                <li><strong>Processor:</strong> {requirements.min.Processor}</li>
                                <li><strong>Memory:</strong> {requirements.min.Memory}</li>
                                <li><strong>Graphics:</strong> {requirements.min.Graphics}</li>
                                <li><strong>Storage:</strong> {requirements.min.Storage}</li>
                            </ul>
                        ) : <p className="text-gray-500">Not available</p>}
                    </div>
                    <div className='min-w-[50%] bg-gray-900 p-8 rounded-lg'>
                        <h3 className="text-lg font-semibold mb-2">Recommended</h3>
                        {requirements.max ? (
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li><strong>OS:</strong> {requirements.max.OS}</li>
                                <li><strong>Processor:</strong> {requirements.max.Processor}</li>
                                <li><strong>Memory:</strong> {requirements.max.Memory}</li>
                                <li><strong>Graphics:</strong> {requirements.max.Graphics}</li>
                                <li><strong>Storage:</strong> {requirements.max.Storage}</li>
                            </ul>
                        ) : <p className="text-gray-500">Not available</p>}
                    </div>
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="px-8 pb-12 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Reviews</h2>
                    <div className="flex items-center">
                        <span className="text-xl font-semibold mr-2">{calculateAverageRating()}</span>
                        <div className="flex">
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
                        <span className="ml-2 text-gray-400">({reviews.length} reviews)</span>
                    </div>
                </div>

                {/* REVIEW FORM */}
                <div className="bg-gray-900 rounded-lg p-6 mb-8">
                    <form onSubmit={handleReviewSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">
                                {userReview ? 'Update Your Rating' : 'Your Rating'}
                            </label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`text-2xl transition-transform duration-200 hover:scale-125 ${star <= (hoverStar || newReview.stars) ? 'text-yellow-400' : 'text-gray-500'}`}
                                        onClick={() => setNewReview({ ...newReview, stars: star })}
                                        onMouseEnter={() => setHoverStar(star)}
                                        onMouseLeave={() => setHoverStar(0)}
                                    >
                                        {star <= (hoverStar || newReview.stars) ? <FaStar /> : <FaRegStar />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <textarea
                                ref={reviewInputRef}
                                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                rows="4"
                                placeholder={userReview ? "Update your thoughts about this game..." : "Share your thoughts about this game..."}
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                onClick={handleReviewInputClick}
                            />
                        </div>
                        <div className="flex items-center">
                            <button
                                type="submit"
                                disabled={newReview.stars === 0 || isSubmitting}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${newReview.stars === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                            >
                                {isSubmitting 
                                    ? 'Submitting...' 
                                    : userReview 
                                        ? 'Update Review' 
                                        : 'Submit Review'}
                            </button>
                            {userReview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewReview({ comment: '', stars: 0 });
                                        setUserReview(null);
                                    }}
                                    className="ml-4 px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300"
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
                        <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <div 
                                key={review.ReviewID} 
                                className="bg-gray-900 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/20"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                                            {review.Username ? review.Username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{review.Username || 'Anonymous'}</h4>
                                            <div className="flex">
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
                                            className="text-sm bg-indigo-900 hover:bg-indigo-800 px-3 py-1 rounded transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-300">{review.Comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}