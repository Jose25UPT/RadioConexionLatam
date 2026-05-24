import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModernEditor from '../components/ModernEditor';
import { PANEL_BASE } from './secureRoute';
import { API_BASE, fetchJson } from '../lib/api';

const EditarNoticia: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [formulario, setFormulario] = useState({
		titulo: '', resumen: '', contenido: '', imagen: '', categoria: '', programa: '',
		destacada: false, estado: 'publicado',
		audio_url: '', audio_titulo: '', permitir_anonimos: true,
		articulos_relacionados: [] as number[], destacado: '',
	});
	const [categorias, setCategorias] = useState<string[]>(['noticias', 'reviews', 'eventos', 'entrevistas']);
	const [subiendoImagen, setSubiendoImagen] = useState(false);
	const [guardando, setGuardando] = useState(false);
	const [cargando, setCargando] = useState(true);
	const [errorMsg, setErrorMsg] = useState<string>('');
	const guardadoExitosoRef = useRef(false);

	useEffect(() => {
		const cargar = async () => {
			try {
				const data = await fetchJson(`/api/noticias/admin/${id}`);
				setFormulario({
					titulo:    data.titulo    ?? '',
					resumen:   data.resumen   ?? '',
					contenido: data.contenido ?? '',
					imagen:    data.imagen    ?? '',
					categoria: data.categoria ?? '',
					programa:  data.programa  ?? '',
					destacada: data.destacada ?? false,
					estado: data.estado ?? 'publicado',
					audio_url: data.audio_url ?? '',
					audio_titulo: data.audio_titulo ?? '',
					permitir_anonimos: data.permitir_anonimos ?? true,
					articulos_relacionados: data.articulos_relacionados ?? [],
					destacado: data.destacado ?? '',
				});
			} catch (e: any) {
				setErrorMsg('Error cargando noticia: ' + (e?.message || ''));
			} finally {
				setCargando(false);
			}
		};

		const cargarCategorias = async () => {
			try {
				const data: string[] = await fetchJson('/api/noticias/categorias/');
				if (Array.isArray(data) && data.length) setCategorias(data);
			} catch {}
		};

		cargar();
		cargarCategorias();
	}, [id]);

	const textoPlano = useMemo(() => formulario.contenido.replace(/<[^>]+>/g, ' '), [formulario.contenido]);
	const conteoPalabras = useMemo(() => textoPlano.trim().split(/\s+/).filter(Boolean).length, [textoPlano]);
	const tiempoLecturaEstimado = useMemo(() => conteoPalabras ? Math.max(1, Math.ceil(conteoPalabras / 200)) : 0, [conteoPalabras]);

	const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		const nuevoValor = type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value;
		setFormulario(prev => ({ ...prev, [name]: nuevoValor }));
	};

	const subirImagen = async (file: File) => {
		setErrorMsg('');
		setSubiendoImagen(true);
		const formData = new FormData();
		formData.append('file', file);
		try {
			const headers: Record<string, string> = {};
			const token = localStorage.getItem('auth_token');
			if (token) headers['Authorization'] = `Bearer ${token}`;
			const response = await fetch(`${API_BASE}/api/uploads/imagen`, { method: 'POST', body: formData, headers });
			if (!response.ok) throw new Error(await response.text());
			const result = await response.json();
			setFormulario(prev => ({ ...prev, imagen: result.url }));
		} catch (e: any) {
			setErrorMsg('Error subiendo imagen: ' + (e?.message || ''));
		} finally {
			setSubiendoImagen(false);
		}
	};

	const validar = (): string | null => {
		if (!formulario.titulo.trim()) return 'El título es obligatorio';
		if (!formulario.categoria?.trim()) return 'Selecciona una categoría';
		const contenidoPlano = formulario.contenido.replace(/<[^>]+>/g, '').trim();
		if (contenidoPlano.length < 20) return 'El contenido es muy corto (mín. 20 caracteres)';
		return null;
	};

	const enviarFormulario = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg('');
		const err = validar();
		if (err) { setErrorMsg(err); return; }
		try {
			setGuardando(true);
			const payload = { ...formulario, tiempo_lectura: tiempoLecturaEstimado };
			await fetchJson(`/api/noticias/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
			alert('✅ Noticia actualizada con éxito');
			guardadoExitosoRef.current = true;
			navigate(PANEL_BASE);
		} catch (err: any) {
			setErrorMsg('Error al guardar: ' + (err?.message || ''));
		} finally {
			setGuardando(false);
		}
	};

	if (cargando) {
		return (
			<div className="min-h-screen bg-stone-50 flex items-center justify-center">
				<div className="text-stone-500 text-lg">Cargando noticia...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-stone-50 p-4 sm:p-6">
			<div className="max-w-6xl mx-auto mb-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<h2 className="text-2xl font-bold text-stone-800">Editar noticia</h2>
					<div className="text-sm text-stone-500">Palabras: <b>{conteoPalabras}</b> · Lectura: <b>{tiempoLecturaEstimado || '—'} min</b></div>
				</div>
			</div>

			<form onSubmit={enviarFormulario} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Columna principal */}
				<div className="lg:col-span-2 space-y-5">
					{errorMsg && (
						<div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{errorMsg}</div>
					)}

					<div className="space-y-2">
						<label className="block text-sm font-medium text-stone-700">Título *</label>
						<input name="titulo" value={formulario.titulo} onChange={manejarCambio} placeholder="Ingresa el título"
							required maxLength={110}
							className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
						<div className="text-xs text-stone-400">{formulario.titulo.length}/110</div>
					</div>

					<div className="space-y-2">
						<label className="flex justify-between items-center text-sm font-medium text-stone-700">
							<span>Resumen (máx. 50 caracteres)</span>
							<span className="text-xs text-stone-400">{formulario.resumen.length}/50</span>
						</label>
						<textarea name="resumen" value={formulario.resumen} onChange={manejarCambio} rows={3} maxLength={50}
							placeholder="Escribe un resumen atractivo (máx. 50 caracteres)"
							className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-vertical" />
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-stone-700">Contenido *</label>
						<div className="bg-white rounded-lg border border-stone-200">
							<ModernEditor data={formulario.contenido} onChange={(data) => setFormulario(prev => ({ ...prev, contenido: data }))}
								placeholder="Escribe contenido enriquecido..." height="420px" />
						</div>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-stone-700">Imagen principal</label>
						<div className="flex flex-col sm:flex-row gap-3 items-start">
							<div className="flex-1 space-y-2 w-full">
								<input name="imagen" value={formulario.imagen} onChange={manejarCambio} placeholder="/api/uploads/..."
									className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500" />
								<div className="flex items-center gap-3 text-xs">
									<input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f); }} disabled={subiendoImagen} />
									<span>{subiendoImagen ? 'Subiendo...' : 'Sube un archivo o pega una ruta'}</span>
								</div>
							</div>
							{formulario.imagen && (
								<img src={formulario.imagen.startsWith('http') ? formulario.imagen : `${API_BASE}${formulario.imagen}`}
									alt="preview" className="w-28 h-20 object-cover rounded border border-stone-200 flex-shrink-0" />
							)}
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-5">
					<div className="p-4 rounded-lg border border-stone-200 bg-white space-y-3">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Categoría *</label>
							<select name="categoria" value={formulario.categoria} onChange={manejarCambio} required
								className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500">
								<option value="">Seleccionar</option>
								{categorias.map(c => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Estado</label>
							<select name="estado" value={formulario.estado ?? 'publicado'} onChange={manejarCambio}
								className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500">
								<option value="publicado">Publicado</option>
								<option value="borrador">Borrador</option>
							</select>
						</div>

						<div className="flex items-center gap-3">
							<input name="destacada" type="checkbox" checked={formulario.destacada} onChange={manejarCambio}
								className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded" />
							<label className="text-sm text-stone-700">Marcar como destacada</label>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Cita destacada <span className="text-stone-400 font-normal">(opcional)</span></label>
							<textarea name="destacado" value={formulario.destacado} onChange={manejarCambio} rows={3}
								placeholder="Frase memorable del artículo que aparecerá resaltada..."
								className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-vertical text-sm" />
							<p className="text-xs text-stone-400">Si no se completa, el bloque de cita no aparecerá en la noticia.</p>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row lg:flex-col gap-3">
						<button type="submit" disabled={guardando}
							className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-medium disabled:opacity-60">
							{guardando ? 'Guardando…' : 'Guardar cambios'}
						</button>
						<button type="button" onClick={() => navigate(PANEL_BASE)}
							className="flex-1 px-6 py-3 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-all font-medium">
							Cancelar
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default EditarNoticia;
