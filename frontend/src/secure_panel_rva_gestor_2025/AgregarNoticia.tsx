import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import ModernEditor from '../components/ModernEditor';
import { NoticiaCrear } from '../types/Noticia';
import { PANEL_BASE } from './secureRoute';
import { API_BASE, fetchJson } from '../lib/api';

const AgregarNoticia: React.FC = () => {
	const navigate = useNavigate();
	const [formulario, setFormulario] = useState<NoticiaCrear>({
		titulo: '', resumen: '', contenido: '', imagen: '', categoria: '', programa: '',
		tags: [], destacada: false, autor_info: undefined,
		audio_url: '', audio_titulo: '', permitir_comentarios: true, permitir_anonimos: true,
		articulos_relacionados: []
	});
	const [categorias, setCategorias] = useState<string[]>(['noticias', 'reviews', 'eventos', 'entrevistas']);
	const [nuevoTag, setNuevoTag] = useState('');
	const [subiendoImagen, setSubiendoImagen] = useState(false);
	const [guardando, setGuardando] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string>('');

	// Autosave simple
	const DRAFT_KEY = 'draft_noticia_creacion_v2';
	useEffect(() => {
		const draft = localStorage.getItem(DRAFT_KEY);
		if (draft) {
			try { setFormulario(prev => ({ ...prev, ...JSON.parse(draft) })); } catch {}
		}
	}, []);
	useEffect(() => {
		const t = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(formulario)), 600);
		return () => clearTimeout(t);
	}, [formulario]);

	// Cargar categorías desde API
	useEffect(() => {
		(async () => {
			try {
				const data: string[] = await fetchJson('/api/noticias/categorias/');
				if (Array.isArray(data) && data.length) setCategorias(data);
			} catch (e) {
				// keep defaults on error
				console.debug('No se pudieron cargar categorías:', e);
			}
		})();
	}, []);

	const textoPlano = useMemo(() => formulario.contenido.replace(/<[^>]+>/g, ' '), [formulario.contenido]);
	const conteoPalabras = useMemo(() => textoPlano.trim().split(/\s+/).filter(Boolean).length, [textoPlano]);
	const tiempoLecturaEstimado = useMemo(() => conteoPalabras ? Math.max(1, Math.ceil(conteoPalabras / 200)) : 0, [conteoPalabras]);

	const limitarCaracteres = (texto: string, maxLen = 50) => texto.slice(0, maxLen);

	const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		const nuevoValor = type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value;
		// Limitar resumen a 50 caracteres
		if (name === 'resumen' && typeof nuevoValor === 'string') {
			const limitado = limitarCaracteres(nuevoValor, 50);
			setFormulario(prev => ({ ...prev, resumen: limitado }));
			return;
		}
		setFormulario(prev => ({ ...prev, [name]: nuevoValor }));
	};

	const subirImagen = async (file: File) => {
		setErrorMsg('');
		setSubiendoImagen(true);
		const formData = new FormData(); formData.append('file', file);
			try {
				const headers: Record<string, string> = {};
				const token = localStorage.getItem('auth_token');
				if (token) headers['Authorization'] = `Bearer ${token}`;
				const response = await fetch(`${API_BASE}/api/uploads/imagen`, { method: 'POST', body: formData, headers });
				if (!response.ok) throw new Error(await response.text());
				const result = await response.json();
				setFormulario(prev => ({ ...prev, imagen: `${API_BASE}${result.url}` }));
			} catch (e: any) {
			setErrorMsg('Error subiendo imagen: ' + (e?.message || ''));
		} finally { setSubiendoImagen(false); }
	};
	const manejarCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]; if (file) subirImagen(file);
	};

	const agregarTag = () => {
		const val = nuevoTag.trim();
		if (val && !formulario.tags.includes(val)) {
			setFormulario(prev => ({ ...prev, tags: [...prev.tags, val] }));
			setNuevoTag('');
		}
	};
	const eliminarTag = (tag: string) => setFormulario(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

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
				await fetchJson('/api/noticias/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
				alert('✅ Noticia guardada con éxito');
				localStorage.removeItem(DRAFT_KEY);
				navigate(PANEL_BASE);
			} catch (err: any) {
			setErrorMsg('Error al guardar: ' + (err?.message || ''));
		} finally {
			setGuardando(false);
		}
	};

	return (
		<div className="min-h-screen bg-stone-50 p-6">
			<div className="max-w-6xl mx-auto mb-6">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold text-stone-800">Crear noticia</h2>
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
						<div className="flex gap-3 items-start">
							<div className="flex-1 space-y-2">
								<input name="imagen" value={formulario.imagen} onChange={manejarCambio} placeholder="https://..."
									className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500" />
								<div className="flex items-center gap-3 text-xs">
									<input type="file" accept="image/*" onChange={manejarCambioImagen} disabled={subiendoImagen} />
									<span>{subiendoImagen ? 'Subiendo...' : 'Sube un archivo o pega una URL'}</span>
								</div>
							</div>
							{formulario.imagen && (
								<img src={formulario.imagen} alt="preview" className="w-28 h-20 object-cover rounded border border-stone-200" />
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
							<label className="block text-sm font-medium text-stone-700">Tags</label>
							<div className="flex gap-2">
								<input value={nuevoTag} onChange={(e) => setNuevoTag(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarTag())}
									placeholder="Añadir tag"
									className="flex-1 p-3 border border-stone-300 rounded-lg focus:ring-amber-500" />
								<button type="button" onClick={agregarTag}
									className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">
									<Plus className="w-4 h-4" />
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{formulario.tags.map(tag => (
									<span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm border border-amber-300">
										{tag}
										<X className="w-3 h-3 cursor-pointer" onClick={() => eliminarTag(tag)} />
									</span>
								))}
							</div>
						</div>

						<div className="flex items-center gap-3">
							<input name="destacada" type="checkbox" checked={formulario.destacada} onChange={manejarCambio}
								className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded" />
							<label className="text-sm text-stone-700">Marcar como destacada</label>
						</div>

						<div className="flex items-center gap-3">
							<input name="permitir_comentarios" type="checkbox" checked={!!formulario.permitir_comentarios} onChange={manejarCambio}
								className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded" />
							<label className="text-sm text-stone-700">Permitir comentarios</label>
						</div>
					</div>

					<div className="flex gap-3">
						<button type="submit" disabled={guardando}
							className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-medium disabled:opacity-60">
							{guardando ? 'Guardando…' : 'Guardar noticia'}
						</button>
						<button type="button" onClick={() => navigate(PANEL_BASE)}
							className="px-6 py-3 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-all font-medium">
							Cancelar
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AgregarNoticia;
