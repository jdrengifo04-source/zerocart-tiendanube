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

                            {/* Thank You Card Preview */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-primary/10 p-8 shadow-xl text-left max-w-sm mx-auto">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-5 mx-auto">
                                    <CheckCircle size={24} className="text-emerald-500" />
                                </div>

                                <h4 className="text-xl font-sora font-extrabold text-slate-900 dark:text-white text-center mb-2 leading-tight">
                                    {headline}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed">
                                    {message}
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex items-center gap-4">
                                        {showImage && (
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                                {product?.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">
                                                {product?.name || 'Nombre del Producto Digital'}
                                            </div>
                                            <a
                                                href={product?.googleDriveLink || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-primary/90 transition-colors cursor-pointer no-underline"
                                            >
                                                Descargar Ahora
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 opacity-40">
                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full mb-2"></div>
                                    <div className="h-2 w-2/3 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                                </div>
                            </div>

                            <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Página de Éxito Tiendanube</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ThankYouConfig;
