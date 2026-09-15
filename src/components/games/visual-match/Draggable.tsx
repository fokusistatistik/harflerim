import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface DraggableProps {
    id: string;
    children: React.ReactNode;
    disabled?: boolean;
}

export function Draggable({ id, children, disabled }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: disabled,
    });

    // Note: We use Framer Motion for smooth visual updates, 
    // but DnD Kit handles the logic. transform needs to be applied carefully.
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            aria-label={`${id} harfi, sürüklenebilir`}
            className="z-50 touch-none"
        >
            <motion.div
                animate={isDragging ? { scale: 1.2, rotate: 5, zIndex: 100 } : { scale: 1, rotate: 0, zIndex: 10 }}
                whileHover={{ scale: disabled ? 1 : 1.1 }}
                whileTap={{ scale: disabled ? 1 : 0.9 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
