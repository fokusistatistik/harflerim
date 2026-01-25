import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';

interface DroppableProps {
    id: string;
    children: React.ReactNode;
    isMatched?: boolean;
}

export function Droppable({ id, children, isMatched }: DroppableProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "transition-all duration-300 rounded-3xl flex items-center justify-center border-4",
                isMatched ? "border-emerald bg-emerald/20" : isOver ? "border-softIndigo bg-softIndigo/10 scale-105" : "border-gray-300 bg-gray-100/50"
            )}
        >
            {children}
        </div>
    );
}
