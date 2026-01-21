import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskStatus } from '../lib/database.types';

interface DroppableColumnProps {
    id: TaskStatus;
    children: React.ReactNode;
    className?: string;
}

export function DroppableColumn({ id, children, className }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`${className} ${isOver ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''} transition-colors duration-200`}
        >
            {children}
        </div>
    );
}
