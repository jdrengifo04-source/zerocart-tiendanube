import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Package
} from 'lucide-react';
import axios from 'axios';

// Import local components
import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import OneClickConfig from './components/OneClickConfig';
import ThankYouConfig from './components/ThankYouConfig';
import WhatsAppButton from './components/WhatsAppButton';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';

import { Button } from 'speed-code';

interface Product {
  id: number;
  name: string;
  price: string;
  promotional_price?: string | null;
  image: string | null;
  googleDriveLink: string;
}

type FilterStatus = 'all' | 'linked' | 'unlinked';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Obtain store_id from URL
  const queryParams = new URLSearchParams(window.location.search);
  const storeId = queryParams.get('store_id') || localStorage.getItem('zerocart_store_id') || '';

  useEffect(() => {
    if (storeId) {
      localStorage.setItem('zerocart_store_id', storeId);
      axios.defaults.headers.common['x-store-id'] = storeId;
    }
    fetchProducts();
  }, [storeId]);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      const msg = error.response?.data?.error || 'Error al conectar con el servidor';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (id: number, value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, googleDriveLink: value } : p));
  };

  const saveLink = async (productId: number, link: string) => {
    try {
      setSaving(productId);
      await axios.put('/api/products/link', { productId, googleDriveLink: link });
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Failed to save link');
    } finally {
      setSaving(null);
    }
  };

  // Filter logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'linked' && p.googleDriveLink) ||
      (filterStatus === 'unlinked' && !p.googleDriveLink);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-[var(--bg-app)] font-jakarta text-[var(--text-main)] overflow-hidden theme-transition">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeId={storeId}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative theme-transition">

        {/* VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">

            {/* Dashboard Headers - Professional Three-Row Redesign */}
            <div className="flex flex-col gap-8 mb-10">
              {/* Row 1: Information Layer */}
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-4xl font-jakarta font-extrabold text-[var(--text-main)] dark:text-white tracking-tightest mb-3">
                  {activeTab === 'dashboard' ? 'Tutorial de Configuración' : activeTab === 'one-click' ? 'Configurar 1 Click $' : activeTab === 'thank-you' ? 'Configurar Página de Gracias' : 'Tus Productos'}
                </h1>
                <p className="text-base font-medium text-slate-500 max-w-3xl leading-relaxed">
                  {activeTab === 'dashboard'
                    ? 'Aprende a configurar tu tienda y enlazar tus productos paso a paso.'
                    : activeTab === 'one-click' ? 'Personaliza el botón de compra directa para aumentar conversiones.'
                      : activeTab === 'thank-you' ? 'Personaliza la experiencia de entrega de tus productos digitales.'
                        : activeTab === 'privacy' ? 'Cómo protegemos la información de tu tienda.'
                          : activeTab === 'terms' ? 'Reglas y condiciones para el uso de ZeroCart.'
                            : 'Gestiona los enlaces de descarga digital para tus productos físicos.'}
                </p>
              </div>

              {activeTab === 'products' && (
                <>
                  {/* Row 2: Action Layer (Search & Sync) */}
                  <div className="flex flex-col md:flex-row items-stretch gap-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
                    {/* Dominant Search Bar */}
                    <div className="relative group flex items-center flex-grow bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/20 transition-all shadow-sm">
                      <div className="flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-all duration-300 mr-4">
                        <Search size={22} strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        placeholder="Busca por nombre, categoría o ID de producto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-4.5 text-base font-semibold placeholder:text-slate-400 outline-none dark:text-white bg-transparent"
                      />
                    </div>

                    {/* Compact Fixed-Size Sync Button */}
                    <Button
                      variant="outline"
                      onClick={fetchProducts}
                      className="md:w-56 h-auto min-h-[64px] rounded-2xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 font-black text-xs uppercase tracking-widest gap-3 transition-all shadow-sm premium-button"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>Sincronizar</span>
                    </Button>
                  </div>

                  {/* Row 3: Filter Layer (Professional Tabs) */}
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-black/20 w-fit rounded-[20px] border border-slate-200/50 dark:border-white/5 backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                    {['all', 'linked', 'unlinked'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status as FilterStatus)}
                        className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-500 relative ${filterStatus === status
                          ? 'bg-white dark:bg-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-primary scale-100'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                      >
                        {status === 'all' ? 'Todos los Productos' : status === 'linked' ? 'Vinculados' : 'Sin Enlace'}
                        {filterStatus === status && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {activeTab === 'dashboard' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-10 border border-slate-200/50 dark:border-white/5 shadow-sm premium-card">
                  <div className="w-full aspect-video bg-slate-100 dark:bg-black/50 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent dark:from-primary/10 opacity-50 transition-opacity group-hover:opacity-100"></div>
                    <div className="text-center relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-xl mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-1">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                      <p className="text-slate-500 font-bold dark:text-slate-400">Espacio para Video Tutorial</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'one-click' ? (
              loading ? (
                <div className="flex items-center justify-center py-20 animate-pulse text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <OneClickConfig product={products[0]} />
              )
            ) : activeTab === 'thank-you' ? (
              <ThankYouConfig product={products[0]} />
            ) : activeTab === 'privacy' ? (
              <PrivacyPolicy />
            ) : activeTab === 'terms' ? (
              <TermsOfUse />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                  ))
                ) : error ? (
                  <div className="col-span-full py-20 text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm border border-red-100 dark:border-red-500/20">
                      <RefreshCw size={36} className="animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error de Conexión</h3>
                    <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400 font-medium px-4">
                      {error}
                    </p>
                    <Button
                      variant="primary"
                      onClick={fetchProducts}
                      className="mt-8 rounded-full px-8"
                    >
                      Intentar de nuevo
                    </Button>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      saving={saving === product.id}
                      onLinkChange={handleLinkChange}
                      onSave={saveLink}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Package size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">No se encontraron productos.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <WhatsAppButton />
    </div>
  );
}

export default App;
