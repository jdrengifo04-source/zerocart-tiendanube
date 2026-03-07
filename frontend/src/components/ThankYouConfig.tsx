import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input } from 'speed-code';
import { ToggleLeft, ToggleRight, Check, CheckCircle, ImageIcon, Loader2, Type, AlignLeft } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: string;
    promotional_price?: string | null;
    image: string | null;
    googleDriveLink: string;
}

interface ThankYouConfigProps {
    product?: Product;
}

const ThankYouConfig: React.FC<ThankYouConfigProps> = ({ product }) => {
    const [headline, setHeadline] = useState('¡Tu descarga está lista!');
    const [message, setMessage] = useState('Gracias por tu compra. Aquí tienes los enlaces de tus productos digitales.');
    const [showImage, setShowImage] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get('/api/store/config');
                const config = response.data;
                setHeadline(config.thankYouHeadline || '¡Tu descarga está lista!');
                setMessage(config.thankYouMessage || 'Gracias por tu compra. Aquí tienes los enlaces de tus productos digitales.');
                setShowImage(config.thankYouShowImage !== undefined ? config.thankYouShowImage : true);
            } catch (error) {
                console.error('Error fetching Thank You config', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.patch('/api/store/config', {
                thankYouHeadline: headline,
                thankYouMessage: message,
                thankYouShowImage: showImage
            });
            alert('Configuración de la página de Gracias guardada');
        } catch (error) {
            console.error('Error saving config', error);
            alert('Hubo un error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CONFIGURATION PANEL */}
                <div className="space-y-6">
                    <Card className="bg-white dark:bg-[#080d18] p-8 rounded-[32px] border-slate-200 dark:border-white/5 shadow-sm premium-card space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Type size={16} className="text-primary" />
                                Titular de la página
                            </h4>
                            <Input
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Ej: ¡Tu descarga está lista!"
                                className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-medium"
                            />
                        </div>

                        <hr className="border-slate-100 dark:border-white/5" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlignLeft size={16} className="text-primary" />
                                Mensaje de agradecimiento
                            </h4>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ej: Gracias por tu compra..."
                                className="w-full min-h-[100px] p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                            />
                        </div>

                        <hr className="border-slate-100 dark:border-white/5" />

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-primary" />
                                    Mostrar imágenes
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">Incluye la imagen del producto en la tarjeta.</p>
                            </div>
                            <button
                                onClick={() => setShowImage(!showImage)}
                                className={`transition-all duration-300 ${showImage ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
                            >
                                {showImage ? <ToggleRight strokeWidth={1.5} size={40} /> : <ToggleLeft strokeWidth={1.5} size={40} />}
                            </button>
                        </div>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white dark:bg-primary text-slate-900 dark:text-white border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-primary/80 rounded-xl font-bold px-8 py-6 h-auto shadow-sm dark:shadow-xl dark:shadow-primary/10 group transition-all"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 w-5 h-5 animate-spin text-slate-500 dark:text-white" />
                            ) : (
                                <Check className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform text-emerald-500 dark:text-white" />
                            )}
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </Button>
                    </div>
                </div>

                {/* VISUAL PREVIEW */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <Card className="bg-slate-50 dark:bg-white/[0.02] p-8 md:p-12 rounded-[32px] border-slate-200 dark:border-white/5 overflow-hidden relative">
                        <div className="mt-4 text-center">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Vista Previa de Entrega</h3>

                            {/* Thank You Card Preview - Exact Match with mockup-paginagracias.html */}
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-2xl overflow-hidden max-w-sm mx-auto text-center animate-in zoom-in-95 duration-500">
                                {/* Success Header */}
                                <div className="pt-10 pb-6 px-8 flex flex-col items-center">
                                    <div className="mb-4 bg-emerald-50 p-3 rounded-full">
                                        <CheckCircle size={48} className="text-emerald-500" />
                                    </div>
                                    <h4 className="text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
                                        {headline}
                                    </h4>
                                    <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                <hr className="border-gray-100 mx-8" />

                                {/* Product View Section */}
                                <div className="py-8 px-8 flex flex-col items-center">
                                    {showImage && (
                                        <div className="w-40 h-40 bg-primary/10 rounded-2xl shadow-lg flex items-center justify-center mb-6 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                                            {product?.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-primary text-6xl font-black select-none">Z</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                                            {product?.name || 'Producto Digital'}
                                        </h2>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                            Listo para descargar
                                        </span>
                                    </div>
                                </div>

                                {/* Action Section */}
                                <div className="px-8 pb-4">
                                    <a
                                        href={product?.googleDriveLink || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group no-underline"
                                    >
                                        <svg className="h-6 w-6 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                        Descargar Ahora
                                    </a>
                                </div>

                                {/* Tip Section Footer */}
                                <div className="p-6 bg-gray-50/50 border-t border-gray-100 mt-4">
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3 items-start text-left">
                                        <span className="text-lg">💡</span>
                                        <p className="text-xs text-yellow-800 leading-relaxed">
                                            <strong>Consejo:</strong> Guarda esta página en tus marcadores para acceder a tu descarga más tarde.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ThankYouConfig;
