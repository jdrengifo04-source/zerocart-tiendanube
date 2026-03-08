import React from 'react';
import { ExternalLink, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Input } from 'speed-code';

interface Product {
    id: number;
    name: string;
    price: string;
    promotional_price?: string | null;
    image: string | null;
    googleDriveLink: string;
}

interface ProductCardProps {
    product: Product;
    saving: boolean;
    onLinkChange: (id: number, value: string) => void;
    onSave: (id: number, link: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, saving, onLinkChange, onSave }) => {
    return (
        <div className="premium-card bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full">
            <div className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-50 dark:bg-white/5">
                                N/A
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ID #{product.id}</span>
                            {product.googleDriveLink ? (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle size={10} />
                                    <span className="text-[9px] font-black uppercase">Vinculado</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                                    <AlertCircle size={10} />
                                    <span className="text-[9px] font-black uppercase">Sin Enlace</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm font-sora font-extrabold text-slate-900 dark:text-white truncate mb-1 leading-tight group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-primary">$ {product.promotional_price || product.price}</p>
                            {product.promotional_price && (
                                <p className="text-[11px] font-bold text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600">$ {product.price}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="relative group/input">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Enlace de Google Drive</p>
                        <Input
                            placeholder="https://drive.google.com/..."
                            value={product.googleDriveLink}
                            onChange={(e) => onLinkChange(product.id, e.target.value)}
                            className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-xs h-10 transition-all focus:bg-white dark:focus:bg-white/10"
                        />
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                <Button
                    onClick={() => onSave(product.id, product.googleDriveLink)}
                    disabled={saving}
                    className="flex-[2] h-11 rounded-xl bg-[#0052FF] hover:bg-[#0045D9] text-white border-none hover:-translate-y-0.5 active:scale-[0.98] font-bold text-xs uppercase tracking-widest gap-2 shadow-[0_8px_20px_-4px_rgba(0,82,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 disabled:scale-100"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mb-0.5" />}
                    {saving ? 'Guardando...' : 'Actualizar'}
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-slate-200 dark:border-white/10 text-slate-500 hover:text-[#0052FF] hover:border-[#0052FF]/30 hover:bg-[#0052FF]/5 hover:-translate-y-0.5 active:scale-[0.98] font-bold text-xs uppercase tracking-widest gap-2 transition-all duration-300"
                    onClick={() => product.googleDriveLink && window.open(product.googleDriveLink, '_blank')}
                    disabled={!product.googleDriveLink}
                >
                    <ExternalLink className="w-4 h-4" />
                    Abrir
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;
