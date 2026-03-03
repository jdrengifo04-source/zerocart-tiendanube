import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Package,
  TrendingUp,
  CreditCard,
  CloudLightning
} from 'lucide-react';
import axios from 'axios';

// Import local components
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import ProductCard from './components/ProductCard';

// Import components from speed-code
import { Button, Card } from 'speed-code';

interface Product {
  id: number;
  name: string;
  price: string;
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
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-lg py-2 pl-10 pr-4 text-sm font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-primary/10 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={fetchProducts}
              className="h-9 px-4 rounded-lg border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-xs gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </header>

        {/* VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">

            {/* Dashboard Headers */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-sora font-extrabold text-slate-900 dark:text-white tracking-tightest mb-1.5">
                  {activeTab === 'dashboard' ? 'Panel de Control' : activeTab === 'products' ? 'Tus Productos' : 'Ajustes'}
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  {activeTab === 'dashboard'
                    ? 'Gestiona tus automatizaciones y membresías en tiempo real.'
                    : activeTab === 'products' ? 'Gestiona los enlaces de descarga digital para tus productos físicos.' : 'Configuración general de la aplicación.'}
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
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    label="Conversión"
                    value="12.4%"
                    icon={TrendingUp}
                    subValue="+2.1% mes"
                    trend="up"
                  />
                  <MetricCard
                    label="Ventas Hoy"
                    value="$1,420"
                    icon={CreditCard}
                    subValue="+15% ayer"
                    trend="up"
                  />
                  <MetricCard
                    label="Uptime API"
                    value="99.9%"
                    icon={CloudLightning}
                    subValue="Excelente"
                    trend="neutral"
                  />
                </div>

                <div className="bg-white dark:bg-white/5 rounded-[40px] p-10 border border-slate-200/50 dark:border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-700" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-4xl font-sora font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                        Optimiza tus ventas automáticas
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-xl font-medium">
                        ZeroCart ahora sincroniza tus productos de Tiendanube con contenido digital en Google Drive para enviar correos automáticos.
                      </p>
                      <Button
                        size="lg"
                        onClick={() => setActiveTab('products')}
                        className="rounded-2xl px-10 h-14 bg-primary text-white hover:bg-primary/90 font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                      >
                        Empezar Ahora
                      </Button>
                    </div>
                    <div className="w-full md:w-80 h-80 bg-slate-100 dark:bg-white/5 rounded-[32px] border border-slate-200 dark:border-white/10 flex items-center justify-center p-8 group-hover:rotate-2 transition-transform duration-700">
                      <div className="w-full aspect-square bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex items-center justify-center p-6 border border-slate-100 dark:border-white/5">
                        <img src="/logo-black.png" alt="Icon" className="dark:hidden w-full h-auto opacity-80" />
                        <img src="/logo-white.png" alt="Icon" className="hidden dark:block w-full h-auto opacity-80" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'products' ? (
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
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="bg-white dark:bg-white/5 p-12 rounded-[40px] border-slate-200 dark:border-white/5 text-center">
                  <h2 className="text-2xl font-sora font-extrabold text-slate-900 dark:text-white mb-4">Ajustes</h2>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">
                    La configuración de la tienda y las credenciales de la API se gestionan automáticamente a través de Tiendanube.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
