import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableTaskCardProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function DraggableTaskCard({ id, children, className = '', disabled = false }: DraggableTaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: disabled,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes}
            className={`${className} ${isDragging ? 'opacity-50 rotate-3 scale-105 shadow-xl cursor-grabbing' : 'cursor-grab active:cursor-grabbing'} touch-none`}
        >
            {children}
        </div>
    );
}
