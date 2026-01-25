'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import clsx from 'clsx';

interface GameCardProps {
    title: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    isLocked?: boolean;
}

export function GameCard({ title, icon, href, color, isLocked = false }: GameCardProps) {
    const CardContent = (
        <motion.div
            whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "relative flex flex-col items-center justify-center p-6 h-64 md:h-80 w-full rounded-3xl shadow-xl border-4 transition-all duration-300",
                isLocked
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed grayscale"
                    : `bg-white border-${color}-400 hover:shadow-2xl hover:border-${color}-500`
            )}
        >
            {/* Icon Area */}
            <div className={clsx(
                "mb-6 p-4 rounded-full bg-opacity-20",
                isLocked ? "bg-gray-300" : `bg-${color}-100 text-${color}-500`
            )}>
                {/* Scale up icon */}
                <div className="scale-150 transform">
                    {icon}
                </div>
            </div>

            {/* Title */}
            <h3 className={clsx(
                "text-3xl font-hand font-bold text-center mb-4",
                isLocked ? "text-gray-400" : "text-gray-800"
            )}>
                {title}
            </h3>

            {/* Button / Status */}
            {isLocked ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-gray-500 font-bold">
                    <Lock size={16} />
                    <span>Yakında</span>
                </div>
            ) : (
                <button className={clsx(
                    "px-8 py-3 rounded-full font-bold text-white text-xl shadow-md transition-transform",
                    `bg-${color}-500 hover:bg-${color}-600`
                )}>
                    OYNA
                </button>
            )}

            {/* Lock Overlay */}
            {isLocked && (
                <div className="absolute top-4 right-4">
                    <Lock className="text-gray-400" size={32} />
                </div>
            )}
        </motion.div>
    );

    if (isLocked) {
        return CardContent;
    }

    return (
        <Link href={href} className="w-full">
            {CardContent}
        </Link>
    );
}
