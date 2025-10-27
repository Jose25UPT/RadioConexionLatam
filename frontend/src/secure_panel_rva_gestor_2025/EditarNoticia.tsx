import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Plus, X, Eye, Edit as EditIcon, User } from 'lucide-react';
import ModernEditor from '../components/ModernEditor';
import { PANEL_BASE } from './secureRoute';
import { fetchJson } from '../lib/api';
import { getUserRole } from './auth';

// PANEL_BASE ofuscado importado

interface NoticiaEditar {
	id: number;
	autor_id?: number | null;
	titulo: string;
	slug: string;
	resumen: string;
	contenido: string;
	fecha: string;
	imagen: string;
	categoria: string;
	programa?: string;
	tags: string[];
	vistas: number;
	likes: number;
	comentarios: number;
	compartidos: number;
	destacada: boolean;
	autor_info?: { nombre?: string };
}

interface UsuarioLite {
	id: number;
	nombre_usuario: string;
	activo?: boolean;
	nombre_completo?: string | null;
}

const EditarNoticia: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [formulario, setFormulario] = useState<NoticiaEditar>({
		id: 0, titulo: '', slug: '', resumen: '', contenido: '', fecha: '', imagen: '', categoria: '', programa: '',
		tags: [], vistas: 0, likes: 0, comentarios: 0, compartidos: 0, destacada: false, autor_info: { nombre: '' }
	});
	const [nuevoTag, setNuevoTag] = useState('');
	const [vistaActual, setVistaActual] = useState<'editar' | 'preview'>('editar');
	const [tagsSugeridos, setTagsSugeridos] = useState<string[]>([]);
	const [usuarios, setUsuarios] = useState<UsuarioLite[]>([]);
	const [categorias, setCategorias] = useState<string[]>(["noticias","reviews","eventos","entrevistas"]);
	const role = getUserRole();

	useEffect(() => {
		const cargar = async () => {
			try {
				const data = await fetchJson(`/api/noticias/${id}`);
				console.log('Datos cargados de la noticia:', data);
				console.log('autor_id cargado:', data.autor_id);
				setFormulario(data);
			} catch (e) {
				console.error('Error cargando noticia', e);
				alert('Error cargando noticia');
			}
			try {
				const t = await fetchJson<string[]>(`/api/noticias/tags/`);
				setTagsSugeridos(t);
			} catch {}
			try {
				const cats = await fetchJson<string[]>(`/api/noticias/categorias/`);
				if (Array.isArray(cats) && cats.length) setCategorias(cats);
			} catch (e) {
				console.debug('No se pudieron cargar categorías:', e);
			}
			if (role === 'ADMIN') {
				try {
					const us = await fetchJson<any[]>(`/api/admin/users`);
					const editores = (us || []).filter(u => (u.rol === 'editor') && (u.activo !== false)).map(u => ({
						id: u.id,
						nombre_usuario: u.nombre_usuario,
						activo: u.activo,
						nombre_completo: u.nombre_completo || null
					}));
					setUsuarios(editores);
				} catch (e) {
					console.warn('No se pudo listar usuarios (requiere admin)', e);
				}
			}
		};
		cargar();
	}, [id, role]);

	const agregarTag = () => {
		if (nuevoTag.trim() && !formulario.tags.includes(nuevoTag.trim())) {
			setFormulario(prev => ({ ...prev, tags: [...prev.tags, nuevoTag.trim()] }));
			setNuevoTag('');
		}
	};
	const eliminarTag = (tag: string) => setFormulario(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

	const limitarCaracteres = (texto: string, maxLen = 50) => texto.slice(0, maxLen);

	const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type, checked } = e.target as HTMLInputElement;
		const v = type === 'checkbox' ? checked : value;
		if (name.startsWith('autor_info.')) {
			const campo = name.split('.')[1];
			setFormulario(prev => ({ ...prev, autor_info: { ...(prev.autor_info || {}), [campo]: v } }));
		} else {
			if (name === 'resumen' && typeof v === 'string') {
				const limitado = limitarCaracteres(v, 50);
				setFormulario(prev => ({ ...prev, resumen: limitado }));
				return;
			}
			setFormulario(prev => ({ ...prev, [name]: v }));
		}
	};

	const enviarFormulario = async (e?: React.FormEvent) => {
		e?.preventDefault();
		try {
			const payload: any = {
				titulo: formulario.titulo,
				resumen: formulario.resumen,
				contenido: formulario.contenido,
				imagen: formulario.imagen,
				categoria: formulario.categoria,
				programa: formulario.programa,
				tags: formulario.tags,
				destacada: formulario.destacada,
			};
			if (formulario.fecha) payload.fecha = formulario.fecha;
			if (role === 'ADMIN') {
				payload.autor_id = formulario.autor_id ?? null;
				console.log('Enviando autor_id:', payload.autor_id, 'desde formulario.autor_id:', formulario.autor_id);
			}
			console.log('Payload completo a enviar:', payload);
			await fetchJson(`/api/noticias/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
			alert('✅ Noticia actualizada');
			navigate(PANEL_BASE);
		} catch (e) {
			console.error('Error al actualizar', e);
			alert('❌ Error al actualizar');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
			<div className="max-w-6xl mx-auto mb-8">
				<nav className="flex items-center space-x-2 text-sm">
					<Link to="/" className="text-amber-700 hover:text-amber-900 font-medium">Inicio</Link>
					<ChevronRight className="w-4 h-4 text-stone-400" />
					<Link to={PANEL_BASE} className="text-amber-700 hover:text-amber-900 font-medium">Panel</Link>
					<ChevronRight className="w-4 h-4 text-stone-400" />
					<span className="text-stone-600 font-medium">Editar: {formulario.titulo || 'Cargando...'}</span>
				</nav>
			</div>
			<div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-stone-200">
				<div className="text-center mb-6">
					<h2 className="text-3xl font-bold text-amber-900 font-['Cinzel']">✏️ Editar Noticia</h2>
					<p className="text-stone-600 mt-2 font-['Cormorant_Garamond'] text-lg">ID: {id} - {formulario.titulo}</p>
				</div>
				<div className="flex border-b border-stone-300 mb-8">
					<button type="button" onClick={() => setVistaActual('editar')} className={`px-6 py-3 flex items-center gap-2 transition-colors font-['Cormorant_Garamond'] text-lg ${vistaActual === 'editar' ? 'text-amber-800 border-b-2 border-amber-600 font-semibold' : 'text-stone-500 hover:text-stone-700'}`}><EditIcon className="w-5 h-5" />Editar</button>
					<button type="button" onClick={() => setVistaActual('preview')} className={`px-6 py-3 flex items-center gap-2 transition-colors font-['Cormorant_Garamond'] text-lg ${vistaActual === 'preview' ? 'text-amber-800 border-b-2 border-amber-600 font-semibold' : 'text-stone-500 hover:text-stone-700'}`}><Eye className="w-5 h-5" />Vista Previa</button>
				</div>
				{vistaActual === 'editar' && (
					<form onSubmit={enviarFormulario} className="space-y-6">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Título *</label>
							<input name="titulo" value={formulario.titulo} onChange={manejarCambio} required className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
						</div>
						<div className="space-y-2">
							<label className="flex justify-between items-center text-sm font-medium text-stone-700"><span>Resumen * <span className="text-xs text-amber-600">(máx. 50 caracteres)</span></span><span className="text-xs text-stone-400">{formulario.resumen.length}/50</span></label>
							<textarea name="resumen" value={formulario.resumen} onChange={manejarCambio} rows={3} maxLength={50} required className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
						</div>
						<div className="space-y-2">
							<label className="flex justify-between items-center text-sm font-medium text-stone-700"><span>Contenido * <span className="text-xs text-amber-600">(CKEditor)</span></span><span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✨ Editor</span></label>
							<div className="bg-white rounded-lg shadow-sm border-2 border-amber-100 hover:border-amber-200 transition-colors">
								<ModernEditor data={formulario.contenido} onChange={(data) => setFormulario(prev => ({ ...prev, contenido: data }))} placeholder="Contenido de la noticia..." height="500px" />
							</div>
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Autor</label>
							{role === 'ADMIN' ? (
								<select
									name="autor_id"
									value={formulario.autor_id ?? ''}
									onChange={(e) => {
										const nuevoAutorId = e.target.value ? Number(e.target.value) : null;
										console.log('Cambiando autor_id de', formulario.autor_id, 'a', nuevoAutorId);
										setFormulario(prev => ({ ...prev, autor_id: nuevoAutorId }));
									}}
									className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500"
								>
									<option value="">Sin autor asignado</option>
									{usuarios.map(u => {
										const label = (u.nombre_completo && u.nombre_completo.trim()) ? `${u.nombre_completo} (@${u.nombre_usuario})` : u.nombre_usuario;
										return (
											<option key={u.id} value={u.id}>{label}</option>
										);
									})}
								</select>
							) : (
								<input name="autor_info.nombre" value={formulario.autor_info?.nombre || ''} onChange={manejarCambio} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500" />
							)}
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Categoría *</label>
							<select name="categoria" value={formulario.categoria} onChange={manejarCambio} required className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500">
								<option value="">Seleccionar</option>
								{categorias.map(c => (
									<option key={c} value={c}>{c}</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">URL Imagen</label>
							<input name="imagen" value={formulario.imagen} onChange={manejarCambio} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-amber-500" />
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-stone-700">Tags</label>
							<div className="flex gap-2">
								<input value={nuevoTag} onChange={(e) => setNuevoTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarTag())} placeholder="Añadir tag" className="flex-1 p-3 border border-stone-300 rounded-lg focus:ring-amber-500" />
								<button type="button" onClick={agregarTag} className="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"><Plus className="w-4 h-4" /></button>
							</div>
							{tagsSugeridos.length > 0 && (
								<div className="mt-2">
									<p className="text-xs text-stone-500 mb-1">Sugerencias:</p>
									<div className="flex flex-wrap gap-2">
										{tagsSugeridos.map(tag => {
											const selected = formulario.tags.includes(tag);
											return (
												<button
													key={tag}
													type="button"
													onClick={() => selected ? eliminarTag(tag) : setFormulario(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
													className={`px-3 py-1 rounded-full border text-sm ${selected ? 'bg-amber-600 text-white border-amber-700' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'}`}
												>
													{tag}
												</button>
											);
										})}
									</div>
								</div>
							)}
							<div className="flex flex-wrap gap-2">{formulario.tags.map(tag => <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm border border-amber-300">{tag}<X className="w-3 h-3 cursor-pointer" onClick={() => eliminarTag(tag)} /></span>)}</div>
						</div>
						<div className="flex items-center gap-3">
							<input name="destacada" type="checkbox" checked={formulario.destacada} onChange={manejarCambio} className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded" />
							<label className="text-sm font-medium text-stone-700">Marcar como destacada</label>
						</div>
						<div className="flex gap-4 pt-4">
							<button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all font-medium text-lg shadow-md">💾 Guardar Cambios</button>
							<button type="button" onClick={() => navigate(PANEL_BASE)} className="px-6 py-3 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-all font-medium">Cancelar</button>
						</div>
					</form>
				)}
				{vistaActual === 'preview' && (
					<div className="space-y-6">
						<div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
							<h3 className="text-xl font-bold text-amber-900 mb-4 font-['Cinzel']">Vista Previa</h3>
							<div className="bg-white p-6 rounded-lg shadow-md border border-amber-100">
								<h1 className="text-4xl font-bold text-amber-900 mb-6 font-['Cinzel'] leading-tight">{formulario.titulo || 'Título'}</h1>
								{formulario.imagen && <div className="mb-6"><img src={formulario.imagen} alt={formulario.titulo} className="w-full h-96 object-cover rounded-lg shadow-lg border border-amber-200" /></div>}
								<div className="flex items-center gap-4 text-stone-600 mb-6 font-['Cormorant_Garamond']">
									<span>📅 {formulario.fecha ? new Date(formulario.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
									{formulario.categoria && <><span>•</span><span className="bg-amber-100 px-3 py-1 rounded-full text-amber-800 text-sm">{formulario.categoria}</span></>}
								</div>
								<div className="prose prose-lg max-w-none mb-8 font-['Cormorant_Garamond'] text-lg leading-relaxed text-stone-700" dangerouslySetInnerHTML={{ __html: formulario.contenido.replace(/\n/g, '<br />') }} />
								{formulario.tags.length > 0 && <div className="mb-6"><h4 className="text-lg font-semibold text-amber-900 mb-3 font-['Cinzel']">🏷️ Tags</h4><div className="flex flex-wrap gap-2">{formulario.tags.map(tag => <span key={tag} className="bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-full text-amber-800 text-sm border border-amber-300">{tag}</span>)}</div></div>}
								<div className="border-t border-stone-200 pt-6">
									<div className="bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-lg border border-amber-200 flex gap-4 items-start">
										<div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"><User className="w-8 h-8" /></div>
										<div className="flex-1">
											<h4 className="text-xl font-bold text-amber-900 mb-2 font-['Cinzel']">{formulario.autor_info?.nombre || 'Autor'}</h4>
											<p className="text-stone-600 font-['Cormorant_Garamond']">Datos del autor se mostrarán aquí.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex gap-4">
							<button type="button" onClick={() => setVistaActual('editar')} className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"><EditIcon className="w-5 h-5" />Volver a Editar</button>
							<button type="button" onClick={() => enviarFormulario()} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">💾 Guardar</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default EditarNoticia;
