import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
  gradient?: 'blue' | 'purple' | 'green';
}

// Un marco sencillo tipo iPhone con notch y pantalla con borde redondeado
export default function DeviceFrame({ children, gradient = 'blue' }: DeviceFrameProps) {
  const bg =
    gradient === 'purple'
      ? 'from-fuchsia-200 via-purple-100 to-white'
      : gradient === 'green'
      ? 'from-emerald-200 via-teal-100 to-white'
      : 'from-sky-200 via-blue-100 to-white';

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* Cuerpo del dispositivo */}
      <div className="relative h-[740px] rounded-[48px] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-2">
        {/* Botones laterales (decorativo) */}
        <div className="absolute left-[-4px] top-24 w-1 h-16 bg-black/90 rounded-r"></div>
        <div className="absolute left-[-4px] top-44 w-1 h-10 bg-black/90 rounded-r"></div>
        <div className="absolute right-[-4px] top-36 w-1 h-14 bg-black/90 rounded-l"></div>

        {/* Pantalla */}
        <div className="relative h-full rounded-[40px] bg-white overflow-hidden">
          {/* Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20 w-40 h-7 bg-black rounded-b-2xl"></div>
          {/* Fondo de pantalla */}
          <div className={`absolute inset-0 bg-gradient-to-b ${bg}`}></div>
          {/* Área de contenido scrollable dentro de la pantalla */}
          <div className="relative h-full pt-10 pb-6 overflow-hidden">
            <div className="absolute inset-x-0 bottom-2 mx-auto h-1.5 w-28 rounded-full bg-black/10"></div>
            <div className="relative h-full overflow-auto px-3">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
