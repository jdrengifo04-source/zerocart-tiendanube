import React, { useState } from 'react';
import { ShoppingBag, FileText, BarChart3, Settings, ShieldCheck, Download } from 'lucide-react';

// Simulación de los productos de la tienda para el Dashboard
const PRODUCTS = [
  { id: 1, name: 'PDF de Gatos', price: '$15.00', status: 'Activo', downloads: 142 },
  { id: 2, name: 'E-book: Cocina Italiana', price: '$22.50', status: 'Activo', downloads: 87 },
  { id: 3, name: 'Manual: SEO Pro', price: '$45.00', status: 'Inactivo', downloads: 0 },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 w-full overflow-hidden">
      {/* Sidebar - Aesthetic Premium */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Zerocart
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">PDFs y Productos</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </nav>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-gray-700/50">
          <div className="flex items-center space-x-2 text-cyan-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Plan VIP</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Factura por transacción activada. Tasa: $0.15 / Venta.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,_#1c1917_0%,_#030712_100%)]">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              {activeTab === 'dashboard' ? 'Resumen de Ventas' : 'Mis Archivos Digitales'}
            </h1>
            <p className="text-gray-400 font-medium">Gestiona tus ventas instantáneas y entregas digitales.</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all border border-gray-700">
              Documentación
            </button>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">
              + Subir Nuevo PDF
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-800">
            <p className="text-gray-400 font-bold text-sm uppercase mb-1">Ventas Totales</p>
            <h3 className="text-3xl font-black text-white">$1,452.80</h3>
            <div className="mt-4 flex items-center text-emerald-400 text-sm font-bold">
              +12.5% vs ayer
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 font-bold">
            <p className="text-gray-400 text-sm uppercase mb-1">Entregas Digitales</p>
            <h3 className="text-3xl font-black text-white">436</h3>
            <div className="mt-4 flex items-center text-cyan-400 text-sm font-bold">
              100% éxito en entrega
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-800">
            <p className="text-gray-400 font-bold text-sm uppercase mb-1">Tasa Zerocart (15¢)</p>
            <h3 className="text-3xl font-black text-cyan-400">$65.40</h3>
            <div className="mt-4 text-xs text-gray-500 font-medium italic">
              Se facturará al próximo corte de Tiendanube
            </div>
          </div>
        </section>

        {/* Table - Products */}
        <div className="bg-gray-950/40 rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Producto</th>
                <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Precio</th>
                <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Descargas</th>
                <th className="px-6 py-5 text-gray-300 font-bold uppercase text-xs tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="font-bold text-gray-200">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-300">{p.price}</td>
                  <td className="px-6 py-5 text-gray-400 italic">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-700 text-gray-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 font-bold text-gray-300">
                      <Download className="w-4 h-4 text-gray-500" />
                      <span>{p.downloads}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button className="text-cyan-400 font-bold hover:text-cyan-300 text-sm">Gestionar Archivo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
