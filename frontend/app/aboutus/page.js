'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const teamMembers = [
  {
    name: 'Haseeb Ahmed',
    role: '23L-3069',
  },
  {
    name: 'Amar Waqar',
    role: '23L-3035',
  },
  {
    name: 'Hussain Nawaz',
    role: '23L-3018',
  },
];

export default function AboutUs() {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  return (
    <div className="h-full overflow-hidden bg-slate-950 text-white p-10 flex flex-col justify-between">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <div className="flex justify-center mb-4">
          <Image src="Logo.svg" alt="GameStore Logo" width={200} height={180} />
        </div>
        <h1 className="text-4xl font-bold mb-2">About GameStore</h1>
        <p className="text-lg max-w-xl mx-auto">
          GameStore is your go-to platform for honest game reviews, community ratings, and curated picks.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-7 text-center">Meet Our Team</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700/30 hover:border-purple-500/30"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 mb-4 flex items-center justify-center text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-purple-400 mb-3">{member.role}</p>
                <p className="text-gray-400 text-center">{member.contribution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-16 text-center text-slate-400"
      >
        <p>&copy; 2025 GameStore. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
