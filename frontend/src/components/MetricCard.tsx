import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    subValue: string;
    trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, subValue, trend = 'neutral' }) => {
    return (
        <div className="premium-card bg-white dark:bg-white/5 rounded-3xl p-6 flex items-center gap-6 border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-sora font-extrabold text-slate-900 dark:text-white">{value}</h3>
                    <span className={`text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-500'}`}>
                        {subValue}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
