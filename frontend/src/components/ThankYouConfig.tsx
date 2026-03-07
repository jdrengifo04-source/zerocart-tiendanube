import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input } from 'speed-code';
import {
    Check,
    Loader2,
    Type,
    AlignLeft,
    Image as ImageIcon,
    CheckCircle,
    Package
} from "lucide-react";
import { Switch } from "./ui/switch";

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto font-jakarta">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CONFIGURATION PANEL */}
                <div className="space-y-6">
                    <Card className="bg-[var(--bg-card)] p-8 rounded-[var(--radius-xl)] border-[var(--border-main)] shadow-[var(--shadow-soft)] premium-card space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Type size={16} className="text-[var(--primary-fixed)]" />
                                Titular de la página
                            </h4>
                            <Input
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Ej: ¡Tu descarga está lista!"
                                className="w-full bg-[var(--input-bg)] border-[#475569]/30 dark:border-[#475569] rounded-[var(--radius-sm)] font-medium focus:ring-2 focus:ring-[var(--primary-fixed)]/20 focus:border-[var(--primary-fixed)] transition-all text-[var(--text-main)]"
                            />
                        </div>

                        <hr className="border-[var(--border-main)] opacity-50" />

                        <div>
                            <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlignLeft size={16} className="text-[var(--primary-fixed)]" />
                                Mensaje de agradecimiento
                            </h4>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ej: Gracias por tu compra..."
                                className="w-full min-h-[100px] p-4 bg-[var(--input-bg)] border border-[#475569]/30 dark:border-[#475569] rounded-[var(--radius-sm)] font-medium text-sm outline-none focus:ring-2 focus:ring-[var(--primary-fixed)]/20 focus:border-[var(--primary-fixed)] transition-all text-[var(--text-main)]"
                            />
                        </div>

                        <hr className="border-[var(--border-main)] opacity-50" />

                        <div className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">Mostrar imágenes</p>
                                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-normal">Ver fotos de productos en el resumen</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={showImage}
                                    onCheckedChange={setShowImage}
                                    size="default"
                                    variant="brand"
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#0052FF] hover:bg-[#0045D9] text-white rounded-xl font-semibold px-6 py-3 h-auto shadow-none border-none transition-all !opacity-100 disabled:!opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 w-5 h-5 animate-spin text-white" />
                            ) : (
                                <Check className="mr-2 w-5 h-5 text-white" />
                            )}
                            <span className="text-white">{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
                        </Button>
                    </div>
                </div>

                {/* VISUAL PREVIEW - FIXED LIGHT MODE */}
                <div className="lg:sticky lg:top-8 h-fit light">
                    <Card className="bg-white p-8 md:p-12 rounded-[var(--radius-xl)] border-[#E2E8F0] overflow-hidden relative shadow-[var(--shadow-soft)]">
                        <div className="mt-4 text-center">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Vista Previa de Entrega</h3>

                            {/* Thank You Card Preview - Forced dark text for visibility in both modes */}
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-2xl overflow-hidden max-w-sm mx-auto text-center animate-in zoom-in-95 duration-500">
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-green-500 w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-[#0F172A] mb-3">{headline || '¡Tu descarga está lista!'}</h2>
                                    <p className="text-slate-600 font-medium leading-relaxed">
                                        {message || 'Gracias por tu compra. Tu pedido está siendo procesado con éxito.'}
                                    </p>
                                </div>

                                {showImage && (
                                    <div className="px-8 pb-8">
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2">
                                                    {product?.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <Package className="text-slate-400 w-10 h-10" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Producto Premium</p>
                                                    <p className="text-[#0F172A] font-bold leading-tight">{product?.name || 'Video Masterclass: Estrategias de Venta 2024'}</p>
                                                    <p className="text-[#0052FF] font-bold mt-1 text-sm">{product?.price || '$47.00'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="px-8 pb-10">
                                    <a
                                        href={product?.googleDriveLink || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl py-4 h-auto font-bold tracking-wide transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 no-underline"
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
