import React from 'react';
import { Button } from 'speed-code';
import { Save, ExternalLink, RefreshCw } from 'lucide-react';
import { Switch } from './ui/switch';

const Styleguide: React.FC = () => {
    return (
        <div className="h-screen bg-[var(--bg-app)] p-8 lg:p-12 custom-scrollbar overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <header className="space-y-4">
                    <h1 className="text-5xl font-jakarta font-extrabold text-[var(--text-main)] dark:text-white tracking-tightest">
                        ZeroCart Styleguide
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-3xl leading-relaxed">
                        Referencia central de diseño y componentes para ZeroCart. Esta guía garantiza la consistencia visual
                        y sirve como documentación para futuros desarrollos e integraciones de IA.
                    </p>
                </header>

                {/* Section 1: Colors & Tokens */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-[#0052FF] rounded-full" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400">01. Colores & Tokens</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ColorCard name="Brand Blue (Primary)" hex="#0052FF" variable="--primary-fixed" />
                        <ColorCard name="App Background" hex="var(--bg-app)" variable="--bg-app" />
                        <ColorCard name="Card Background" hex="var(--bg-card)" variable="--bg-card" />
                        <ColorCard name="Border Main" hex="var(--border-main)" variable="--border-main" />
                        <ColorCard name="Text Main" hex="var(--text-main)" variable="--text-main" />
                    </div>
                </section>

                {/* Section 2: Premium Buttons */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-[#0052FF] rounded-full" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400">02. Botones Premium</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/5">
                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Botón de Acción Principal (Actualizar)</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button className="h-11 rounded-xl bg-[#0052FF] hover:bg-[#0045D9] text-white border-none hover:-translate-y-0.5 active:scale-[0.98] font-bold text-xs uppercase tracking-widest gap-2 shadow-[0_8px_20px_-4px_rgba(0,82,255,0.3)] transition-all duration-300 px-8">
                                    <Save className="w-4 h-4 mb-0.5" />
                                    Actualizar
                                </Button>
                                <Button disabled className="h-11 rounded-xl bg-[#0052FF] text-white opacity-50 font-bold text-xs uppercase tracking-widest gap-2 px-8">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </Button>
                            </div>
                            <p className="text-sm text-slate-500 bg-slate-100 dark:bg-black/20 p-4 rounded-xl font-mono">
                                bg-[#0052FF] shadow-[0_8px_20px_-4px_rgba(0,82,255,0.3)] hover:-translate-y-0.5
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Botón de Enlace Externo (Abrir)</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button variant="outline" className="h-11 rounded-xl border-slate-200 dark:border-white/10 text-slate-500 hover:text-[#0052FF] hover:border-[#0052FF]/30 hover:bg-[#0052FF]/5 hover:-translate-y-0.5 active:scale-[0.98] font-bold text-xs uppercase tracking-widest gap-2 transition-all duration-300 px-8">
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir
                                </Button>
                            </div>
                            <p className="text-sm text-slate-500 bg-slate-100 dark:bg-black/20 p-4 rounded-xl font-mono">
                                variant="outline" hover:bg-[#0052FF]/5 hover:text-[#0052FF]
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Interactive Components */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-[#0052FF] rounded-full" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400">03. Componentes Interactivos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6">
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Brand Switch</h3>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Estado Activo</span>
                                <Switch defaultChecked variant="brand" />
                            </div>
                            <p className="text-xs text-slate-500">
                                Usa el color branding `#0052FF` con sombras difuminadas y animación de thumb suave.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6 col-span-2">
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Filtros de Navegación</h3>
                            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-black/40 w-fit rounded-[20px] border border-slate-200 dark:border-white/5">
                                {['Opción 1', 'Opción 2', 'Opción 3'].map((label, i) => (
                                    <button
                                        key={label}
                                        className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-300 relative ${i === 0
                                            ? 'bg-white dark:bg-white/10 shadow-sm text-[#0052FF]'
                                            : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {label}
                                        {i === 0 && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0052FF] rounded-full" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Typography & Layout */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-[#0052FF] rounded-full" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400">04. Tipografía & Layout</h2>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/5 space-y-8">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">H1 Heading Principal</p>
                            <h1 className="text-4xl font-jakarta font-extrabold text-slate-900 dark:text-white tracking-tightest">
                                ZeroCart Premium SaaS Interface
                            </h1>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Body Paragraph</p>
                            <p className="text-base font-medium text-slate-500 max-w-2xl leading-relaxed">
                                Nuestra interfaz utiliza Plus Jakarta Sans para titulares de alto impacto y Inter para legibilidad técnica.
                                El espaciado es generoso para mantener una estética de lujo y baja carga cognitiva.
                            </p>
                        </div>
                    </div>
                </section>

                {/* AI Reference Note */}
                <footer className="pt-20 border-t border-slate-200 dark:border-white/5">
                    <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-3xl border border-primary/20">
                        <h3 className="text-lg font-bold text-primary mb-3">🚀 Nota para Agentes de IA</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Al construir nuevas secciones, prioriza el uso de <b>variables CSS</b> (`var(--primary-fixed)`, etc.).
                            Usa exclusivamente <b>bordes redondeados XL (24px - 32px)</b> para contenedores de segundo nivel.
                            Cualquier botón de acción principal DEBE tener el el efecto de resplandor <b>shadow-[#0052FF/30]</b>
                            y la micro-animación de elevación <b>hover:-translate-y-0.5</b>.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const ColorCard = ({ name, hex, variable }: { name: string; hex: string; variable: string }) => (
    <div className="group flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 transition-all hover:border-[#0052FF]/30">
        <div
            className="w-12 h-12 shrink-0 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm"
            style={{ backgroundColor: hex.startsWith('var') ? hex : hex }}
        />
        <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase truncate">{variable}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{hex.startsWith('var') ? '' : hex}</p>
        </div>
    </div>
);

export default Styleguide;
