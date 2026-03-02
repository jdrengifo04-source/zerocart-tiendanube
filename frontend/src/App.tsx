import { useState, useEffect } from 'react';
import { ShoppingBag, FileText, Settings, ShieldCheck, Save, ExternalLink, RefreshCw, LayoutDashboard } from 'lucide-react';
import axios from 'axios';

// Importar componentes de speed-code (si no están en index, lo hacemos por path o intentamos el general)
import { Button, Card, Input } from 'speed-code';

interface Product {
  id: number;
  name: string;
  price: string;
  googleDriveLink: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  // Obtener store_id de la URL
  const queryParams = new URLSearchParams(window.location.search);
  const storeId = queryParams.get('store_id') || localStorage.getItem('zerocart_store_id') || '';

  useEffect(() => {
    if (storeId) {
      localStorage.setItem('zerocart_store_id', storeId);
      // Configurar axios para enviar el storeId en todas las peticiones
      axios.defaults.headers.common['x-store-id'] = storeId;
    }
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
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
      console.error('Error guardando enlace:', error);
      alert('Fallo al guardar el enlace');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">

      {/* Sidebar - Premium Style de Speed Code */}
      <div className="flex">
        <aside className="w-72 h-screen border-r border-slate-800 bg-[#020617]/50 backdrop-blur-xl sticky top-0 flex flex-col p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-6 h-6 text-slate-900 font-bold" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Zerocart</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Productos', icon: FileText },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <footer className="mt-auto">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-black tracking-widest">Cuenta Activa</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">ID: {storeId || 'Tienda de Prueba'}</p>
            </div>
          </footer>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 p-12 bg-gradient-to-br from-[#020617] via-[#020617] to-cyan-950/10">
          <header className="flex justify-between items-end mb-12">
            <div>
              <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Panel Administrativo</p>
              <h2 className="text-5xl font-black text-white tracking-tight">
                {activeTab === 'dashboard' ? 'Métricas' : 'Catálogo Digital'}
              </h2>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={fetchProducts}
                className="rounded-xl border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8">
                Ir a Tiendanube
              </Button>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900/50 rounded-3xl border border-slate-800" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 border-slate-800 bg-transparent flex flex-col items-center">
                  <ShoppingBag className="w-12 h-12 text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-400">No hay productos vinculados</h3>
                  <p className="text-slate-600">Actualiza tu tienda para importar productos de Tiendanube.</p>
                </Card>
              ) : (
                products.map((p) => (
                  <Card key={p.id} className="p-6 bg-slate-900/30 border-slate-800/50 flex items-center gap-8 group hover:border-emerald-500/30 transition-all duration-500 hover:bg-slate-900/50">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8" />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                      <p className="text-slate-500 font-medium text-sm">{p.price}</p>
                    </div>

                    <div className="w-2/5 relative">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-2 block">Google Drive Link</label>
                      <Input
                        placeholder="https://drive.google.com/..."
                        value={p.googleDriveLink}
                        onChange={(e) => handleLinkChange(p.id, e.target.value)}
                        className="bg-slate-950/50 border-slate-800 rounded-xl focus:ring-emerald-500/20 pr-10 text-emerald-50 font-medium h-12"
                      />
                      {p.googleDriveLink && (
                        <a href={p.googleDriveLink} target="_blank" rel="noreferrer" className="absolute right-3 top-9 text-slate-600 hover:text-emerald-400 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <Button
                      onClick={() => saveLink(p.id, p.googleDriveLink)}
                      disabled={saving === p.id}
                      className={`rounded-2xl h-12 px-6 ${saving === p.id ? 'bg-slate-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950'}`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving === p.id ? '...' : 'Guardar'}
                    </Button>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

