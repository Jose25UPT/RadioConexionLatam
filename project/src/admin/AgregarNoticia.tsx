import React, { useState } from 'react';
import { Noticia } from '../types/Noticia';

const AgregarNoticia: React.FC = () => {
  // Formulario sin campos automáticos como 'id', 'fecha', 'vistas'
  const [formulario, setFormulario] = useState<Omit<Noticia, 'id' | 'fecha' | 'vistas'>>({
    titulo: '',
    resumen: '',
    contenido: '',
    autor: '',
    imagen: '',
    categoria: '',
    destacada: false,
  });

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const nuevoValor =
      type === 'checkbox' && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;

    setFormulario((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://localhost:8000/api/noticias/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });

      if (!respuesta.ok) throw new Error('Error al guardar la noticia');
      alert('✅ Noticia guardada con éxito');

      // Reiniciar formulario
      setFormulario({
        titulo: '',
        resumen: '',
        contenido: '',
        autor: '',
        imagen: '',
        categoria: '',
        destacada: false,
      });
    } catch (error) {
      alert('❌ Ocurrió un error al guardar la noticia');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">📝 Agregar Nueva Noticia</h2>
      <form onSubmit={enviarFormulario} className="space-y-4">
        {[
          ['titulo', 'Título'],
          ['resumen', 'Resumen'],
          ['autor', 'Autor'],
          ['imagen', 'URL de imagen'],
          ['categoria', 'Categoría'],
        ].map(([name, label]) => (
          <input
            key={name}
            name={name}
            placeholder={label}
            value={(formulario as any)[name]}
            onChange={manejarCambio}
            className="w-full p-2 border rounded"
            required
          />
        ))}

        <textarea
          name="contenido"
          placeholder="Contenido"
          value={formulario.contenido}
          onChange={manejarCambio}
          className="w-full p-2 border rounded"
          required
        />

        <label className="flex items-center">
          <input
            type="checkbox"
            name="destacada"
            checked={formulario.destacada}
            onChange={manejarCambio}
            className="mr-2"
          />
          Noticia destacada
        </label>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Guardar Noticia
        </button>
      </form>
    </div>
  );
};

export default AgregarNoticia;
