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
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
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
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden theme-transition">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeId={storeId}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative theme-transition">

        {/* HEADER - Stitch Style */}
        <header className="h-16 px-8 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-10">
          {activeTab === 'products' && (
            <div className="flex-1 max-w-xl">
              <div className="relative group flex items-center w-full max-w-md bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/20 transition-all shadow-sm">
                <div className="flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300 mr-3">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 text-sm font-medium placeholder:text-slate-500 outline-none dark:text-white bg-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="flex items-center gap-4 ml-auto">
              <Button
                variant="outline"
                onClick={fetchProducts}
                className="h-9 px-4 rounded-lg border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-xs gap-2 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            </div>
          )}
        </header>

        {/* VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">

            {/* Dashboard Headers */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-sora font-extrabold text-slate-900 dark:text-white tracking-tightest mb-1.5">
                  {activeTab === 'dashboard' ? 'Tutorial de Configuración' : activeTab === 'one-click' ? 'Configurar 1 Click $' : activeTab === 'thank-you' ? 'Configurar Página de Gracias' : 'Tus Productos'}
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  {activeTab === 'dashboard'
                    ? 'Aprende a configurar tu tienda y enlazar tus productos paso a paso.'
                    : activeTab === 'one-click' ? 'Personaliza el botón de compra directa para aumentar conversiones.'
                      : activeTab === 'thank-you' ? 'Personaliza la experiencia de entrega de tus productos digitales.'
                        : 'Gestiona los enlaces de descarga digital para tus productos físicos.'}
                </p>
              </div>

              {activeTab === 'products' && (
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                  {['all', 'linked', 'unlinked'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status as FilterStatus)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterStatus === status
                        ? 'bg-white dark:bg-white/10 shadow-sm text-primary'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                      {status === 'all' ? 'Todos' : status === 'linked' ? 'Vinculados' : 'Sin Enlace'}
                    </button>
                  ))}
                </div>
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
              <ThankYouConfig />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                  ))
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
    </div>
  );
}

export default App;
