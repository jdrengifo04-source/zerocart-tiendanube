import { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  ExternalLink,
  RefreshCw,
  LayoutDashboard,
  Search,
  CheckCircle,
  AlertCircle,
  User,
  Package,
  MoreVertical,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import axios from 'axios';

// Import components from speed-code
import { Button, Card, Input } from 'speed-code';

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

      {/* SIDEBAR - ExitBot Style */}
      <aside className="w-68 bg-slate-950 flex flex-col shrink-0 z-20 shadow-2xl relative">
        <div className="p-8 pb-12">
          <img src="/logo-white.png" alt="ZeroCart Logo" className="h-7 w-auto" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mb-8">
            <p className="px-5 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Menú Principal</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'products', label: 'Productos', icon: Package }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-300 font-bold text-[13px] ${activeTab === item.id
                    ? 'sidebar-active-glow text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
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
            <p className="px-5 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Configuración</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-300 font-bold text-[13px] ${activeTab === 'settings'
                  ? 'sidebar-active-glow text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
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

        {/* Footer Sidebar - ExitBot Style */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Estado</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-status-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-300 truncate">Store #{storeId || '7317678'}</p>
            <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full" />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-white transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] font-black text-white leading-tight">Admin</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">v1.2.0 Stable</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs">
                AZ
              </div>
            </div>
          </div>
        </div>
      </aside>

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
                  {activeTab === 'dashboard' ? 'Panel de Control' : 'Tus Productos'}
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  {activeTab === 'dashboard'
                    ? 'Gestiona tus automatizaciones y membresías en tiempo real.'
                    : 'Gestiona los enlaces de descarga digital para tus productos físicos.'}
                </p>
              </div>

              {activeTab === 'products' && (
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                  {['all', 'linked', 'unlinked'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status as FilterStatus)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === status
                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                      {status === 'all' ? 'Todos' : status === 'linked' ? 'Vinculados' : 'Sin Enlace'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="transition-all duration-500">
                {activeTab === 'dashboard' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Horizontal KPI Cards - ExitBot Style */}
                    <Card className="premium-card p-6 rounded-[24px] flex items-center gap-5">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total</p>
                        <p className="text-2xl font-sora font-extrabold text-slate-900 dark:text-white">{products.length}</p>
                      </div>
                    </Card>

                    <Card className="premium-card p-6 rounded-[24px] flex items-center gap-5">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Vinculados</p>
                        <p className="text-2xl font-sora font-extrabold text-slate-900 dark:text-white">
                          {products.filter(p => p.googleDriveLink).length}
                        </p>
                      </div>
                    </Card>

                    <Card className="premium-card p-6 rounded-[24px] flex items-center gap-5">
                      <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Pendientes</p>
                        <p className="text-2xl font-sora font-extrabold text-slate-900 dark:text-white">
                          {products.filter(p => !p.googleDriveLink).length}
                        </p>
                      </div>
                    </Card>

                    <Card className="premium-card p-6 rounded-[24px] flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Logs</p>
                        <p className="text-2xl font-sora font-extrabold text-slate-900 dark:text-white">128</p>
                      </div>
                    </Card>
                  </div>
                ) : (
                  /* PRODUCT GRID - Stitch Mockup Style */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => (
                      <Card key={p.id} className="premium-card p-5 rounded-2xl flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              {p.googleDriveLink ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                  Vinculado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500">
                                  Sin Enlace
                                </span>
                              )}
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{p.price}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white truncate leading-tight mb-1">{p.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {p.id}</p>
                          </div>
                        </div>

                        <div className="mt-auto space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 p-0.5">Google Drive Link</label>
                            <div className="relative group/input">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors">
                                <ExternalLink size={14} />
                              </div>
                              <Input
                                placeholder="drive.google.com/file/..."
                                value={p.googleDriveLink}
                                onChange={(e) => handleLinkChange(p.id, e.target.value)}
                                className="h-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium pl-9 pr-4 focus:ring-primary/10 transition-all dark:text-white"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => saveLink(p.id, p.googleDriveLink)}
                            disabled={saving === p.id}
                            className={`w-full h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${saving === p.id
                              ? 'bg-slate-100 dark:bg-white/5 text-slate-400'
                              : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/10'
                              }`}
                          >
                            {saving === p.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : p.googleDriveLink ? (
                              <>
                                <Save className="w-4 h-4" />
                                <span>Guardar Cambios</span>
                              </>
                            ) : (
                              <span>Vincular Contenido</span>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
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
