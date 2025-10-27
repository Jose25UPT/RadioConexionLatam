import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { PANEL_BASE } from './secureRoute';
import { API_BASE } from '../lib/api';

const EliminarNoticia: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const confirmarEliminacion = async () => {
		try {
			const headers: Record<string, string> = {};
			const token = localStorage.getItem('auth_token');
			if (token) headers['Authorization'] = `Bearer ${token}`;
			const res = await fetch(`${API_BASE}/api/noticias/${id}`, { method: 'DELETE', headers });
			if (!res.ok) throw new Error(await res.text());
			alert('🗑 Noticia eliminada correctamente');
			navigate(PANEL_BASE);
		} catch (e: any) {
			console.error('Error eliminando noticia', e);
			alert('❌ No se pudo eliminar la noticia: ' + (e?.message || ''));
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-stone-100 p-6">
			<div className="max-w-6xl mx-auto mb-8">
				<nav className="flex items-center space-x-2 text-sm">
					<Link to="/" className="text-amber-700 hover:text-amber-900 font-medium transition-colors">Inicio</Link>
					<ChevronRight className="w-4 h-4 text-stone-400" />
					<Link to={PANEL_BASE} className="text-amber-700 hover:text-amber-900 font-medium transition-colors">Panel</Link>
					<ChevronRight className="w-4 h-4 text-stone-400" />
					<span className="text-stone-600 font-medium">Eliminar Noticia #{id}</span>
				</nav>
			</div>
			<div className="max-w-xl mx-auto">
				<div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
							<AlertTriangle className="h-8 w-8 text-red-600" />
						</div>
						<h2 className="text-3xl font-bold mb-4 text-red-600 font-['Cinzel']">¿Eliminar Noticia?</h2>
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
							<p className="text-red-800 font-medium font-['Cormorant_Garamond'] text-lg">⚠️ Esta acción eliminará permanentemente la noticia ID: <strong>{id}</strong></p>
							<p className="text-red-600 mt-2">Esta operación no se puede deshacer.</p>
						</div>
						<div className="flex justify-center gap-4">
							<button onClick={() => navigate(PANEL_BASE)} className="px-6 py-3 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-all duration-300 font-medium">↩️ Cancelar</button>
							<button onClick={confirmarEliminacion} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md">🗑️ Confirmar Eliminación</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EliminarNoticia;
