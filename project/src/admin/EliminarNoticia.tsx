// src/admin/EliminarNoticia.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EliminarNoticia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const confirmarEliminacion = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/noticias/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      alert('🗑 Noticia eliminada correctamente');
      navigate('/admin/panel');
    } catch {
      alert('❌ No se pudo eliminar la noticia');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 bg-white p-8 rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-600">¿Eliminar Noticia?</h2>
      <p className="text-gray-700 mb-6">Esta acción no se puede deshacer.</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/admin/panel')}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancelar
        </button>
        <button
          onClick={confirmarEliminacion}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default EliminarNoticia;
