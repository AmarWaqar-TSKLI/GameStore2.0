"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({ words, className, cursorClassName, hideCursorAfter = false }) => {
  // Split text inside of words into an array of characters
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));
  const [showCursor, setShowCursor] = useState(true);

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        { display: "inline-block", opacity: 1, width: "fit-content" },
        { duration: 0.3, delay: stagger(0.1), ease: "easeInOut" }
      );

      if (hideCursorAfter) {
        const timer = setTimeout(() => {
          setShowCursor(false);
        }, words.length * 300 + 1000); // Adjust timing based on word count
        return () => clearTimeout(timer);
      }
    }
  }, [isInView, hideCursorAfter, words.length]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <div key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <motion.span
                key={`char-${index}`}
                className={cn(
                  `dark:text-white text-black opacity-0 hidden`,
                  word.className
                )}
              >
                {char}
              </motion.span>
            ))}
            <span>&nbsp;</span>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <div className="overflow-hidden pb-2">
        <div
          className="text-base sm:text-xl md:text-3xl lg:text-5xl font-bold"
          style={{ whiteSpace: "nowrap" }}
        >
          {renderWords()}
        </div>
      </div>
      {showCursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn(
            "inline-block rounded-sm w-[4px] h-7 sm:h-6 xl:h-12 bg-blue-500",
            cursorClassName
          )}
        />
      )}
    </div>
  );
};

export const TypewriterEffectSmooth = ({ words, className, cursorClassName, hideCursorAfter = false }) => {
  const [showCursor, setShowCursor] = useState(true);
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  useEffect(() => {
    if (hideCursorAfter) {
      const timer = setTimeout(() => {
        setShowCursor(false);
      }, 3000); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [hideCursorAfter]);

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => (
          <div key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <span
                key={`char-${index}`}
                className={cn(`dark:text-white text-black `, word.className)}
              >
                {char}
              </span>
            ))}
            <span>&nbsp;</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{ duration: 2, ease: "linear", delay: 1 }}
      >
        <div
          className="text-4xl sm:text-lg md:text-xl lg:text-3xl xl:text-5xl font-bold"
          style={{ whiteSpace: "nowrap" }}
        >
          {renderWords()}
        </div>
      </motion.div>
      {showCursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn(
            "block rounded-sm w-[4px] h-9 sm:h-6 xl:h-12 bg-blue-500",
            cursorClassName
          )}
        />
      )}
    </div>
  );
};