import React, { useRef } from 'react';
import {
    LayoutDashboard,
    Package,
    ChevronRight,
    Sun,
    Moon,
    Zap
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    storeId: string;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    storeId,
    theme,
    toggleTheme
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    return (
        <aside
            ref={sidebarRef}
            className={`h-screen bg-[var(--sidebar-navy)] flex flex-col shrink-0 z-20 shadow-2xl relative border-r border-white/5 transition-[width] duration-300 ease-in-out dark group w-68`}
        >
            <div className={`p-8 pb-10 flex justify-center transition-all duration-300`}>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className="hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    title="Ir al Dashboard"
                >
                    <img src="/logo-white.png" alt="ZeroCart" className="h-9 w-auto object-contain animate-in fade-in duration-300" />
                </button>
            </div>

            <div className={`flex-1 overflow-y-auto px-4 custom-scrollbar`}>
                <div className="mb-8 w-full">
                    <p className="px-5 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-70">Menú Principal</p>
                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', label: 'Tutoriales', icon: LayoutDashboard },
                            { id: 'products', label: 'Productos', icon: Package },
                            { id: 'one-click', label: '1 Click $', icon: Zap }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-300 font-medium text-[14px] px-5 ${activeTab === item.id
                                    ? 'sidebar-active-glow text-white shadow-lg shadow-primary/10'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className={`flex items-center gap-3 justify-start`} style={{ width: '85%' }}>
                                    <item.icon className={`w-4.5 h-4.5 shrink-0 ${activeTab === item.id ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className={activeTab === item.id ? 'text-white' : 'text-slate-300'}>{item.label}</span>
                                </div>
                                {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                            </button>
                        ))}
                    </nav>
                </div>


            </div>

            <div className="p-4 border-t border-white/5 bg-[#080d18]/50 overflow-hidden">
                <div className="bg-white/[0.03] rounded-2xl p-4 mb-4 border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status-pulse" />
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate">Store #{storeId || '7317678'}</p>
                    <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full shadow-[0_0_8px_rgba(0,82,255,0.4)]" />
                    </div>
                </div>

                <div className={`flex items-center px-2 justify-center`}>
                    <button
                        onClick={toggleTheme}
                        className={`p-2 text-slate-400 hover:text-white transition-all bg-white/5 rounded-lg border border-white/5 hover:border-white/10 w-full flex items-center justify-center gap-2`}
                    >
                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        <span className="text-[11px] font-medium uppercase tracking-wider">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
