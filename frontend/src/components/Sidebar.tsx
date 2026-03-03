import React from 'react';
import {
    LayoutDashboard,
    Package,
    Settings,
    ChevronRight,
    Sun,
    Moon
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
    return (
        <aside className="w-68 bg-[#0a0f1d] flex flex-col shrink-0 z-20 shadow-2xl relative border-r border-white-[0.02]">
            <div className="p-8 pb-10">
                <img src="/logo-white.png" alt="ZeroCart Logo" className="h-6 w-auto opacity-90" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                <div className="mb-8">
                    <p className="px-5 mb-4 text-[10px] font-bold text-slate-500/60 uppercase tracking-[0.2em]">Menú Principal</p>
                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'products', label: 'Productos', icon: Package }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-[14px] ${activeTab === item.id
                                    ? 'sidebar-active-glow text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-4.5 h-4.5 ${activeTab === item.id ? 'text-primary' : 'text-slate-600'}`} />
                                    {item.label}
                                </div>
                                {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mb-8">
                    <p className="px-5 mb-4 text-[10px] font-bold text-slate-500/60 uppercase tracking-[0.2em]">Configuración</p>
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center justify-between px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-[14px] ${activeTab === 'settings'
                                ? 'sidebar-active-glow text-white'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Settings className={`w-4.5 h-4.5 ${activeTab === 'settings' ? 'text-primary' : 'text-slate-600'}`} />
                                Ajustes
                            </div>
                            {activeTab === 'settings' && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                        </button>
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#080d18]">
                <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status-pulse" />
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-300 truncate">Store #{storeId || '7317678'}</p>
                    <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full" />
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5">
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[11px] font-bold text-white leading-tight">Admin</p>
                            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">v1.2.0 Stable</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                            AZ
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
