import React from 'react';
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: boolean;
    className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black transition-all duration-300 tracking-wider",
            status
                ? "bg-[#00C853] text-white shadow-[0_4px_12px_-2px_rgba(0,200,83,0.45)]"
                : "bg-[#FF3B30] text-white shadow-[0_4px_12px_-2px_rgba(255,59,48,0.45)]",
            className
        )}>
            <span className="relative flex h-1.5 w-1.5">
                <span className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                    status ? "bg-white" : "bg-white"
                )}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            {status ? 'ACTIVO' : 'INACTIVO'}
        </div>
    );
};

export default StatusBadge;
