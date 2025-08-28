import React, { useEffect, useState } from 'react';
import { FileText, Eye, Edit, TrendingUp, Users, Calendar, Pencil, Trash2, ArrowUp } from 'lucide-react';
import { Noticia } from '../types/Noticia';
import { Link } from 'react-router-dom';

const PanelAdministrador: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  const obtenerNoticias = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/noticias/');
      const data = await res.json();
      setNoticias(data);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    }
  };

  const eliminarNoticia = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia?')) return;
    try {
      await fetch(`http://localhost:8000/api/noticias/${id}`, { method: 'DELETE' });
      setNoticias(noticias.filter((n) => n.id !== id));
    } catch (error) {
      alert('Error al eliminar la noticia');
    }
  };

  useEffect(() => {
    obtenerNoticias();
  }, []);

  const publicadas = noticias.filter((n) => n.destacada).length;
  const borradores = noticias.length - publicadas;

  const estadisticas = [
    {
      icon: FileText,
      label: 'Total Noticias',
      valor: noticias.length,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Eye,
      label: 'Publicadas',
      valor: publicadas,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Edit,
      label: 'Borradores',
      valor: borradores,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: TrendingUp,
      label: 'Vistas del Mes',
      valor: '235.2K',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">NewsAdmin</h1>
        <nav className="space-y-4 text-gray-700">
          <Link to="/admin" className="block font-medium text-blue-600">📄 Todas las Noticias</Link>
          <Link to="/admin/agregar" className="block">➕ Crear Noticia</Link>
          <a href="#" className="block">📁 Categorías</a>
          <a href="#" className="block">📊 Analíticas</a>
          <a href="#" className="block">👥 Usuarios</a>
          <a href="#" className="block">⚙️ Configuración</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel de Administración</h2>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {estadisticas.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.valor}</p>
                    <div className="flex items-center mt-2 text-green-600 text-sm">
                      <ArrowUp size={16} className="mr-1" />
                      +12% este mes
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Noticias recientes */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📑 Noticias Recientes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="py-2 px-4">Noticia</th>
                  <th className="py-2 px-4">Categoría</th>
                  <th className="py-2 px-4">Estado</th>
                  <th className="py-2 px-4">Autor</th>
                  <th className="py-2 px-4">Fecha</th>
                  <th className="py-2 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {noticias.map((n) => (
                  <tr key={n.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img src={n.imagen} alt="" className="w-12 h-12 rounded object-cover" />
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{n.titulo}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{n.resumen}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {n.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {n.destacada ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Publicado</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Borrador</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{n.autor}</td>
                    <td className="py-3 px-4">
                      {new Date(n.fecha).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <Link to={`/admin/editar/${n.id}`} className="text-blue-600 hover:text-blue-800" title="Editar">
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => eliminarNoticia(n.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {noticias.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">No hay noticias aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PanelAdministrador;
