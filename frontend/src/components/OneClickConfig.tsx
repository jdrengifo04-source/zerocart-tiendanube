import React, { useState } from 'react';
import { Card, Button, Input } from 'speed-code';
import { ToggleLeft, ToggleRight, Check, Palette, Expand, Zap, ImageIcon } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: string;
    promotional_price?: string | null;
    image: string | null;
    googleDriveLink: string;
}

interface OneClickConfigProps {
    product?: Product;
}

const OneClickConfig: React.FC<OneClickConfigProps> = ({ product }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [buttonText, setButtonText] = useState('Comprar Ahora');
    const [bgColor, setBgColor] = useState('#0052FF'); // Primary Brand Color
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [buttonSize, setButtonSize] = useState<'normal' | 'grande' | 'completo'>('normal');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CONFIGURATION PANEL */}
                <div className="space-y-6">
                    {/* Enable Toggle */}
                    <Card className="bg-white dark:bg-[#080d18] p-8 rounded-[32px] border-slate-200 dark:border-white/5 shadow-sm premium-card">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-xl font-sora font-extrabold text-slate-900 dark:text-white mb-1">Activar 1 Click $</h3>
                                <p className="text-sm font-medium text-slate-500">Reemplaza "Agregar al Carrito" por compra directa.</p>
                            </div>
                            <button
                                onClick={() => setIsEnabled(!isEnabled)}
                                className={`transition-all duration-300 ${isEnabled ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
                            >
                                {isEnabled ? <ToggleRight strokeWidth={1.5} size={48} /> : <ToggleLeft strokeWidth={1.5} size={48} />}
                            </button>
                        </div>
                    </Card>

                    {/* Customization Options */}
                    <div className={`transition-all duration-500 ${isEnabled ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
                        <Card className="bg-white dark:bg-[#080d18] p-8 rounded-[32px] border-slate-200 dark:border-white/5 shadow-sm premium-card space-y-8">

                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                                    Texto del Botón
                                </h4>
                                <Input
                                    value={buttonText}
                                    onChange={(e) => setButtonText(e.target.value)}
                                    placeholder="Ej: Comprar Ahora"
                                    className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-medium"
                                />
                            </div>

                            <hr className="border-slate-100 dark:border-white/5" />

                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Palette size={16} className="text-primary" />
                                    Colores
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Fondo</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                            <Input
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="uppercase text-sm font-mono h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Texto</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                            <Input
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="uppercase text-sm font-mono h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-white/5" />

                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Expand size={16} className="text-primary" />
                                    Tamaño
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {['normal', 'grande', 'completo'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setButtonSize(size as any)}
                                            className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${buttonSize === size
                                                ? 'bg-primary/10 border-primary text-primary dark:text-white shadow-sm'
                                                : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </Card>
                    </div>

                    <div className={`transition-all duration-500 flex justify-end ${isEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <Button className="bg-white dark:bg-primary text-slate-900 dark:text-white border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-primary/80 rounded-xl font-bold px-8 py-6 h-auto shadow-sm dark:shadow-xl dark:shadow-primary/10 group transition-all">
                            <Check className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform text-emerald-500 dark:text-white" />
                            Guardar Configuración
                        </Button>
                    </div>
                </div>

                {/* LIVE PREVIEW PANEL */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <Card className="bg-slate-50 dark:bg-white/[0.02] p-8 md:p-12 rounded-[32px] border-slate-200 dark:border-white/5 overflow-hidden relative">
                        {/* Fake Store Chrome */}
                        <div className="absolute top-0 left-0 right-0 h-10 bg-slate-200/50 dark:bg-white/5 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>

                        <div className="mt-8 text-center">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Vista Previa Móvil</h3>

                            <div className="w-[320px] mx-auto bg-white dark:bg-slate-900 rounded-[40px] border-[8px] border-slate-200 dark:border-slate-800 h-[640px] shadow-2xl overflow-hidden flex flex-col relative text-left">
                                {/* Navigation Bar Tiendanube Style */}
                                <div className="h-14 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-5 shrink-0 bg-white dark:bg-slate-900">
                                    {/* Hamburger */}
                                    <div className="w-5 h-4 flex flex-col justify-between">
                                        <div className="w-full h-[2px] bg-slate-800 dark:bg-white"></div>
                                        <div className="w-full h-[2px] bg-slate-800 dark:bg-white"></div>
                                        <div className="w-full h-[2px] bg-slate-800 dark:bg-white"></div>
                                    </div>
                                    <div className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Mi Tienda</div>
                                    {/* Cart Icon */}
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 dark:text-white"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">1</div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-white dark:bg-slate-900">
                                    {/* Product Image Carousel */}
                                    <div className="relative w-full aspect-square bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex items-center justify-center overflow-hidden">
                                        {product?.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-300 dark:text-white/10">
                                                <ImageIcon size={64} className="mb-2" />
                                                <p className="text-xs font-medium">Sin imagen</p>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 flex gap-1.5 z-10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-white"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-5 bg-white dark:bg-slate-900">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Producto</div>
                                        <h1 className="text-[19px] font-bold text-slate-900 dark:text-white leading-snug mb-3 opacity-90">
                                            {product?.name || 'Producto de Ejemplo para Tienda'}
                                        </h1>

                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                                $ {product?.promotional_price || product?.price || '299.00'}
                                            </span>
                                            {(product?.promotional_price || (!product?.price && !product?.promotional_price)) && (
                                                <span className="text-sm line-through text-slate-400 dark:text-slate-500">
                                                    $ {product?.price || '359.00'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-1.5 font-bold bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2.5 py-1 rounded">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Envío gratis disponible
                                        </div>

                                        <div className="space-y-3 opacity-60">
                                            <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full"></div>
                                            <div className="h-2.5 w-5/6 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                                            <div className="h-2.5 w-4/6 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar / Checkout Button Area */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
                                    <button
                                        style={isEnabled ? {
                                            backgroundColor: bgColor,
                                            color: textColor,
                                        } : {
                                            backgroundColor: '#1e293b', // Generic dark button for Tiendanube
                                            color: '#ffffff',
                                        }}
                                        className={`
                                            transition-all duration-300 flex items-center justify-center tracking-wide font-bold
                                            ${!isEnabled && 'w-full py-4 rounded-md text-[15px] hover:bg-slate-800'} 
                                            ${isEnabled && buttonSize === 'normal' ? 'py-3.5 px-6 rounded-md text-[15px] mx-auto w-auto shadow-lg shadow-black/10' : ''}
                                            ${isEnabled && buttonSize === 'grande' ? 'py-4 px-8 rounded-lg text-[16px] mx-auto w-auto shadow-xl shadow-black/10' : ''}
                                            ${isEnabled && buttonSize === 'completo' ? 'py-4 px-6 rounded-md text-[16px] w-full shadow-lg shadow-black/10' : ''}
                                        `}
                                    >
                                        {isEnabled && <Zap size={18} fill="currentColor" strokeWidth={0} className="mr-2 opacity-90" />}
                                        {isEnabled ? buttonText : 'Agregar al carrito'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default OneClickConfig;
