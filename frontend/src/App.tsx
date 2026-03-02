import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileText, BarChart3, Settings, ShieldCheck, Download, Save, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface Product {
  id: number;
  name: any;
  price: string;
  googleDriveLink: string;
  status?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      // Mapear los datos de Tiendanube a nuestra interfaz
      const mappedProducts = response.data.map((p: any) => ({
        id: p.id,
        name: p.name.es || Object.values(p.name)[0],
        price: `${p.currency} ${p.price}`,
        googleDriveLink: p.googleDriveLink || ''
      }));
      setProducts(mappedProducts);
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
      alert('¡Enlace guardado con éxito!');
    } catch (error) {
      console.error('Error guardando enlace:', error);
      alert('Fallo al guardar el enlace');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 w-full overflow-hidden font-sans">
      {/* Sidebar - Aesthetic Premium */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Zerocart
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Mis Productos Digitales</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configuración</span>
            </div>
          </button>
        </nav>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-gray-700/50">
          <div className="flex items-center space-x-2 text-cyan-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Plan VIP Hostinger</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Factura por transacción activada. Tarifa: $0.15 por venta.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,_#1c1917_0%,_#030712_100%)]">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              {activeTab === 'dashboard' ? 'Resumen de Ventas' : 'Enlaces de Google Drive'}
            </h1>
            <p className="text-gray-400 font-medium">Gestiona tus productos y automatiza la entrega instantánea.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={fetchProducts} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all border border-gray-700 flex items-center space-x-2">
              <span>Actualizar Tienda</span>
            </button>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">
              Panel Tiendanube
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            {/* Table - Products */}
            <div className="bg-gray-950/40 rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-gray-900/80">
                  <tr>
                    <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Producto (Tiendanube)</th>
                    <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Precio</th>
                    <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Enlace Google Drive</th>
                    <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="font-bold text-gray-200">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-400">{p.price}</td>
                      <td className="px-6 py-5">
                        <div className="relative group/input max-w-md">
                          <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-cyan-50 font-medium focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none"
                            placeholder="Pegar enlace de Google Drive..."
                            value={p.googleDriveLink}
                            onChange={(e) => handleLinkChange(p.id, e.target.value)}
                          />
                          {p.googleDriveLink && (
                            <a href={p.googleDriveLink} target="_blank" rel="noreferrer" className="absolute right-3 top-2.5 text-gray-500 hover:text-cyan-400 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => saveLink(p.id, p.googleDriveLink)}
                          disabled={saving === p.id}
                          className={`flex items-center space-x-2 font-bold text-sm px-4 py-2 rounded-lg transition-all ${saving === p.id ? 'bg-gray-700 text-gray-400' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black hover:shadow-cyan-500/30'}`}
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving === p.id ? 'Guardando...' : 'Guardar'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
