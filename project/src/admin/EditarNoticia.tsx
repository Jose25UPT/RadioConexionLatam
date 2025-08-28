// src/admin/EditarNoticia.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Noticia } from '../types/Noticia';

const EditarNoticia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState<Omit<Noticia, 'vistas'>>({
    id: 0,
    titulo: '',
    resumen: '',
    contenido: '',
    autor: '',
    fecha: '',
    imagen: '',
    categoria: '',
    destacada: false,
  });

  useEffect(() => {
    fetch(`http://localhost:8000/api/noticias/${id}`)
      .then((res) => res.json())
      .then((data) => setFormulario(data));
  }, [id]);

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(`http://localhost:8000/api/noticias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });
      if (!respuesta.ok) throw new Error();
      alert('✅ Noticia actualizada');
      navigate('/admin/panel');
    } catch {
      alert('❌ Error al actualizar la noticia');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">✏️ Editar Noticia</h2>
      <form onSubmit={enviarFormulario} className="space-y-4">
        {[
          ['titulo', 'Título'],
          ['resumen', 'Resumen'],
          ['autor', 'Autor'],
          ['imagen', 'URL Imagen'],
          ['categoria', 'Categoría'],
        ].map(([name, label]) => (
          <input
            key={name}
            name={name}
            placeholder={label}
            value={(formulario as any)[name]}
            onChange={manejarCambio}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        ))}
        <textarea
          name="contenido"
          value={formulario.contenido}
          onChange={manejarCambio}
          placeholder="Contenido"
          className="w-full p-2 border border-gray-300 rounded h-40"
          required
        />
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="destacada"
            checked={formulario.destacada}
            onChange={manejarCambio}
            className="mr-2"
          />
          Noticia destacada
        </label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditarNoticia;
