"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useId, useEffect } from "react";

const Slide = ({ game, index, current, handleSlideClick }) => {
  const slideRef = useRef(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      slideRef.current.style.setProperty("--x", `${xRef.current}px`);
      slideRef.current.style.setProperty("--y", `${yRef.current}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleMouseMove = (event) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + r.width / 2);
    yRef.current = event.clientY - (r.top + r.height / 2);
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  return (
    <div className="[perspective:500px] [transform-style:preserve-3d] ">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[70vmin] mx-[10vmin] z-10 "
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index ? "scale(0.98) rotateX(8deg)" : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}>
        <div
          className="absolute top-0 -left-50 w-[150%] h-[80%] bg-[#1D1F2F] rounded-[1%] overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform: current === index ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)" : "none",
          }}>
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover opacity-100 transition-opacity duration-600 ease-in-out"
            style={{ opacity: current === index ? 1 : 0.5 }}
            alt={game.name}
            src={game.cover_path}
            loading="eager"
            decoding="sync"
          />
          {current === index && <div className="absolute inset-0 bg-black/30 transition-all duration-1000" />}
        </div>
        <article
          className={`w-[150%] h-[60%] relative p-[4vmin] transition-opacity duration-1000 ease-in-out ${current === index ? "opacity-100 visible" : "opacity-0 invisible"
            }`}>
          <h2 className="text-lg md:text-2xl lg:text-4xl font-semibold absolute bottom-5">{game.name}</h2>
        </article>
      </li>
    </div>
  );
};

const CarouselControl = ({ type, title, handleClick }) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${type === "previous" ? "rotate-180" : ""
        }`}
      title={title}
      onClick={handleClick}>
      <IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
    </button>
  );
};

export function Carousel() {
  const [games, setGames] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:1000/Games")
      .then((response) => response.json())
      .then((data) => setGames(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const startAutoSlide = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % games.length);
      }, 3000);
    };

    if (games.length > 0) startAutoSlide();
    return () => clearInterval(timerRef.current);
  }, [games]);

  const handlePreviousClick = () => {
    setCurrent((prev) => (prev === 0 ? games.length - 1 : prev - 1));
    resetTimer();
  };

  const handleNextClick = () => {
    setCurrent((prev) => (prev + 1) % games.length);
    resetTimer();
  };

  const handleSlideClick = (index) => {
    if (current == index) {
    router.push(`/gameinfo/${games[index].game_id}`); // Use games[index] to get the current game
    }
    setCurrent(index);
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % games.length);
      }, 3000);
    }
  };

  const id = useId();

  return (
    <div className="relative w-[80vmin] h-[60vh] mx-auto" aria-labelledby={`carousel-heading-${id}`}>
      <ul
        className="absolute flex gap-x-36 mx-[-6vmin] transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(calc(-${current * (100 / games.length)}% - ${current * 1}vmin - 0.2% ))` }}>
        {games.map((game, index) => (
          <Slide key={game.game_id} game={game} index={index} current={current} handleSlideClick={handleSlideClick} />
        ))}
      </ul>
      {/* <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl type="previous" title="Go to previous slide" handleClick={handlePreviousClick} />
        <CarouselControl type="next" title="Go to next slide" handleClick={handleNextClick} />
      </div> */}
    </div>
  );
}
