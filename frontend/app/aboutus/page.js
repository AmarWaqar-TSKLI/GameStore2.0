'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
const teamMembers = [
  {
    name: 'Haseeb Ahmed',
    role: '23L-3069',
  },
  {
    name: 'Hussain Nawaz',
    role: '23L-3018',
  },
  {
    name: 'Amar Waqar',
    role: '23L-3035',
  },
];

export default function AboutUs() {
  return (
    <div className="h-full bg-slate-950 text-white p-10 flex flex-col justify-between">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
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
              staggerChildren: 0.3,
            },
          },
        }}
        className="grid gap-8 md:grid-cols-3"
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="bg-slate-800 rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xl font-semibold mb-2">{member.name}</div>
            <div className="text-md text-slate-400">{member.role}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-16 text-center text-slate-400"
      >
        <p>&copy; 2025 GameStore. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
