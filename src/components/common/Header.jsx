import React from "react";
import { 
  Gamepad2, 
  Volume2, 
  VolumeX, 
  Users, 
  Eye, 
  Flame, 
  Package,
  ScrollText
} from "lucide-react";
import sounds from "../../services/soundEffects";

export default function Header({ 
  userRole = "spectator",
  onRoleChange,
  connectedUsersCount = 1,
  onOpenConnectedModal,
  availableCount = 0,
  historyCount = 0,
  onOpenPoolModal,
  soundMuted, 
  onToggleSound
}) {
  return (
    <header className="bg-[#111422]/95 border-b-4 border-black backdrop-blur-md sticky top-0 z-40 px-2 sm:px-4 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* LOGO ARCADE (Clic siempre te lleva al tablero) */}
        <a href="/" className="flex items-center gap-2 cursor-pointer select-none">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] transform -rotate-3 hover:rotate-0 transition">
            <Gamepad2 className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-['Press_Start_2P'] text-xs sm:text-base text-yellow-400 tracking-wider drop-shadow-[2px_2px_0_#000]">
                ARCADE
              </span>
              <span className="font-['Press_Start_2P'] text-xs sm:text-base text-cyan-400 tracking-wider drop-shadow-[2px_2px_0_#000]">
                AUCTION
              </span>
            </div>
            <p className="text-[8px] sm:text-[9px] font-['Chakra_Petch'] font-semibold text-slate-400 uppercase tracking-widest hidden xs:block">
              Subasta PvP en Tiempo Real
            </p>
          </div>
        </a>

        {/* BOTONES Y CONTROLES DEL NAVBAR */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
          
          {/* BOTÓN 1: PERSONAJES QUE AÚN NO HAN SALIDO (POOL RESTANTE) */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenPoolModal && onOpenPoolModal("available");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-yellow-500/80 bg-yellow-950/60 hover:bg-yellow-900/80 text-yellow-300 transition shadow-[2px_2px_0_#000] active:translate-y-0.5"
            title="Ver personajes disponibles que aún no han salido en la ruleta"
          >
            <Package className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              <span className="hidden sm:inline">POOL: </span>{availableCount}
            </span>
          </button>

          {/* BOTÓN 2: HISTORIAL (SELECCIONADOS Y DESECHADOS) */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenPoolModal && onOpenPoolModal("selected");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-cyan-500/80 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 transition shadow-[2px_2px_0_#000] active:translate-y-0.5"
            title="Ver personajes seleccionados (en juego) y desechados"
          >
            <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              <span className="hidden sm:inline">HISTORIAL: </span>{historyCount}
            </span>
          </button>

          {/* BOTÓN 3: USUARIOS CONECTADOS (SABER SI ESTÁS CON TU BRO) */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenConnectedModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-emerald-500/80 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 transition shadow-[2px_2px_0_#000] active:translate-y-0.5"
            title="Ver personas conectadas en vivo"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Users className="w-3.5 h-3.5" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              {connectedUsersCount}
            </span>
          </button>

          {/* SELECTOR DE ROL (DEFAULT: ESPECTADOR) */}
          <div className="flex items-center bg-[#0d101a] border-2 border-slate-700 rounded-xl p-0.5 shadow-inner">
            <div className="pl-1.5 pr-0.5 text-slate-400">
              {userRole === "player1" && <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />}
              {userRole === "player2" && <Flame className="w-3.5 h-3.5 text-rose-400" />}
              {userRole === "both" && <Gamepad2 className="w-3.5 h-3.5 text-yellow-400" />}
              {userRole === "spectator" && <Eye className="w-3.5 h-3.5 text-slate-400" />}
            </div>
            <select
              value={userRole}
              onChange={(e) => {
                sounds.playClick();
                onRoleChange(e.target.value);
              }}
              className="bg-transparent text-xs font-['Chakra_Petch'] font-bold text-white outline-none pr-1 py-0.5 cursor-pointer max-w-[130px] sm:max-w-none"
              title="Tu rol en la subasta"
            >
              <option value="spectator" className="bg-[#151928] text-slate-300">👁️ Espectador</option>
              <option value="player1" className="bg-[#151928] text-cyan-300">🎮 Jugador 1 (Azul)</option>
              <option value="player2" className="bg-[#151928] text-rose-300">🔥 Jugador 2 (Rojo)</option>
              <option value="both" className="bg-[#151928] text-yellow-300">🕹️ Dual (1 PC)</option>
            </select>
          </div>

          {/* BOTÓN SILENCIO / AUDIO */}
          <button
            onClick={() => onToggleSound()}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] transition active:translate-y-0.5"
            title={soundMuted ? "Activar Sonido" : "Silenciar"}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-400" />}
          </button>

        </div>
      </div>
    </header>
  );
}
