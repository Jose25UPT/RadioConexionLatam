import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-700 flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <p className="text-8xl font-extrabold text-pink-300 mb-2 drop-shadow-lg">404</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Página no encontrada</h1>
        <p className="text-white/70 mb-8 leading-relaxed">
          La página que buscas no existe o fue movida. No te preocupes, puedes regresar a donde estabas.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-purple-900 font-semibold shadow-lg hover:bg-pink-100 transition-colors duration-200"
        >
          ← Regresar
        </button>
      </div>
    </div>
  );
}
