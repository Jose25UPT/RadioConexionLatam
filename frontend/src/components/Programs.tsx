import React, { useMemo, useState } from 'react';
import { Clock, Mic, Music, Coffee, Moon, Sun, Sunset, Play } from 'lucide-react';

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Domingo

interface ScheduleItem {
  id: number;
  day: DayIndex; // 0..6
  start: string; // HH:MM 24h
  end: string;   // HH:MM 24h
  name: string;
  host: string;
  description?: string;
  icon?: React.ReactNode;
}

const days: { key: DayIndex; label: string }[] = [
  { key: 1, label: 'Lun' },
  { key: 2, label: 'Mar' },
  { key: 3, label: 'Mié' },
  { key: 4, label: 'Jue' },
  { key: 5, label: 'Vie' },
  { key: 6, label: 'Sáb' },
  { key: 0, label: 'Dom' },
];

const baseSchedule: ScheduleItem[] = [
  { id: 1, day: 1, start: '06:00', end: '10:00', name: 'Conexión Matutina', host: 'María González', description: 'Noticias y música para arrancar el día', icon: <Coffee className="w-4 h-4" /> },
  { id: 2, day: 1, start: '10:00', end: '14:00', name: 'Ritmos Sin Fronteras', host: 'Carlos Rodríguez', description: 'Éxitos latinos de todos los tiempos', icon: <Music className="w-4 h-4" /> },
  { id: 3, day: 1, start: '14:00', end: '18:00', name: 'Tarde Latina', host: 'Ana Martínez', description: 'Entretenimiento y conversación', icon: <Sun className="w-4 h-4" /> },
  { id: 4, day: 1, start: '18:00', end: '22:00', name: 'Conexión Nocturna', host: 'Luis Fernández', description: 'Baladas y compañía', icon: <Sunset className="w-4 h-4" /> },
  { id: 5, day: 1, start: '22:00', end: '23:59', name: 'Madrugada Latina', host: 'Sofía Herrera', description: 'Música suave y romántica', icon: <Moon className="w-4 h-4" /> },
  // Copiamos la misma parrilla como ejemplo al resto de días
  // En producción, puedes cargarla desde la API.
];

// Rellena días 2..6 y 0 con variaciones simples para demo
for (const d of [2, 3, 4, 5, 6, 0] as DayIndex[]) {
  baseSchedule.push(
    { id: Number(`${d}1`), day: d, start: '06:00', end: '10:00', name: 'Conexión Matutina', host: 'María González', icon: <Coffee className="w-4 h-4" /> },
    { id: Number(`${d}2`), day: d, start: '10:00', end: '14:00', name: 'Ritmos Sin Fronteras', host: 'Carlos Rodríguez', icon: <Music className="w-4 h-4" /> },
    { id: Number(`${d}3`), day: d, start: '14:00', end: '18:00', name: 'Tarde Latina', host: 'Ana Martínez', icon: <Sun className="w-4 h-4" /> },
    { id: Number(`${d}4`), day: d, start: '18:00', end: '22:00', name: 'Conexión Nocturna', host: 'Luis Fernández', icon: <Sunset className="w-4 h-4" /> },
    { id: Number(`${d}5`), day: d, start: '22:00', end: '23:59', name: 'Madrugada Latina', host: 'Sofía Herrera', icon: <Moon className="w-4 h-4" /> },
  );
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isNowBetween(start: string, end: string, now = new Date()): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const a = toMinutes(start);
  const b = toMinutes(end);
  // Sincrono (no cruza medianoche):
  return minutes >= a && minutes <= b;
}

export default function Programs() {
  const today = (new Date().getDay()) as DayIndex; // 0..6
  const [activeDay, setActiveDay] = useState<DayIndex>(today);

  const daySchedule = useMemo(() => {
    return baseSchedule
      .filter(s => s.day === activeDay)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [activeDay]);

  const nowPlaying = useMemo(() => {
    const list = baseSchedule
      .filter(s => s.day === today)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const current = list.find(s => isNowBetween(s.start, s.end));
    return current || null;
  }, [today]);

  return (
    <section id="programas" className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            Programación en vivo
          </h2>
          <p className="text-purple-200">Consulta los horarios por día. Sin ruleta, claro y directo.</p>
        </div>

        {/* Ahora en vivo */}
        <div className="mb-8">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-purple-200">Ahora en vivo</p>
                <p className="text-lg font-bold">
                  {nowPlaying ? (
                    <>
                      {nowPlaying.name} <span className="text-purple-200 font-normal">con {nowPlaying.host}</span>
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {nowPlaying.start} – {nowPlaying.end}
                      </span>
                    </>
                  ) : '—'}
                </p>
              </div>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl font-semibold">
              <Play className="w-4 h-4" /> Escuchar
            </button>
          </div>
        </div>

        {/* Tabs de días */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
          {days.map(d => (
            <button
              key={d.key}
              onClick={() => setActiveDay(d.key)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap ${
                activeDay === d.key ? 'bg-white text-purple-900 border-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Lista/cronograma del día */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daySchedule.map((item) => {
            const live = activeDay === today && isNowBetween(item.start, item.end);
            return (
              <div key={item.id} className={`rounded-2xl border p-4 bg-white/5 ${live ? 'border-emerald-400/60' : 'border-white/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> {item.start} – {item.end}
                    </span>
                    {item.icon}
                  </div>
                  {live && <span className="text-[11px] font-bold text-emerald-300">EN VIVO</span>}
                </div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-purple-200">con {item.host}</p>
              </div>
            );
          })}
        </div>

        {/* Nota */}
        <p className="text-xs text-purple-200 mt-6">Horario en hora local.</p>
      </div>
    </section>
  );
}