'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HintImageProps {
    src: string;
    alt: string;
}

export function HintImage({ src, alt }: HintImageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={src} // Re-animate on source change
            className="relative group p-2 bg-white rounded-2xl shadow-lg border-4 border-indigo-100 rotate-2 hover:rotate-0 transition-transform duration-500"
        >
            <img
                src={src}
                alt={alt}
                className="w-24 h-24 md:w-48 md:h-48 object-cover rounded-xl"
                loading="eager"
            />

            {/* Gloss Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        </motion.div>
    );
}
