import React, { useState, useRef, useEffect } from "react";
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Users,
  Eye,
  Flame,
  Package,
  ScrollText,
  ChevronDown,
  Lock,
} from "lucide-react";
import sounds from "../../services/soundEffects";

export default function Header({
  mySlot = null,
  onTakeSlot,
  players,
  connectedUsersCount = 1,
  onOpenConnectedModal,
  availableCount = 0,
  historyCount = 0,
  onOpenPoolModal,
  soundMuted,
  onToggleSound,
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera o pulsar ESC
  useEffect(() => {
    if (!roleMenuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setRoleMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [roleMenuOpen]);

  // Detectar ocupación de slots
  const p1 = players?.player1;
  const p2 = players?.player2;
  const p1Occupied = !!p1?.client_id;
  const p2Occupied = !!p2?.client_id;

  const isP1Me = mySlot === "player1";
  const isP2Me = mySlot === "player2";
  const isSpectator = !mySlot;

  // Icono y texto del rol actual
  const currentRoleIcon = isP1Me ? (
    <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
  ) : isP2Me ? (
    <Flame className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
  ) : (
    <Eye className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
  );

  const currentRoleLabel = isP1Me
    ? "Jugador 1"
    : isP2Me
    ? "Jugador 2"
    : "Espectador";

  const handleSelectRole = (slot) => {
    setRoleMenuOpen(false);
    sounds.playClick();
    if (slot === mySlot) return;
    onTakeSlot && onTakeSlot(slot);
  };

  return (
    <header className="bg-[#111422]/95 border-b-4 border-black backdrop-blur-md sticky top-0 z-40 px-2 sm:px-4 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* LOGO ARCADE */}
        <a
          href="/"
          className="flex items-center gap-2 cursor-pointer select-none"
          aria-label="Ir al tablero principal"
        >
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] transform -rotate-3 hover:rotate-0 transition">
            <Gamepad2 className="w-5 h-5 text-black" aria-hidden="true" />
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
          {/* BOTÓN 1: POOL RESTANTE */}
          <button
            type="button"
            id="btn-pool"
            name="btn-pool"
            onClick={() => {
              sounds.playClick();
              onOpenPoolModal && onOpenPoolModal("available");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-yellow-500/80 bg-yellow-950/60 hover:bg-yellow-900/80 text-yellow-300 transition shadow-[2px_2px_0_#000] active:translate-y-0.5"
            title="Ver personajes disponibles que aún no han salido en la ruleta"
            aria-label={`Ver pool disponible: ${availableCount} personajes`}
          >
            <Package className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              <span className="hidden sm:inline">POOL: </span>
              {availableCount}
            </span>
          </button>

          {/* BOTÓN 2: HISTORIAL */}
          <button
            type="button"
            id="btn-history"
            name="btn-history"
            onClick={() => {
              sounds.playClick();
              onOpenPoolModal && onOpenPoolModal("selected");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-cyan-500/80 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 transition shadow-[2px_2px_0_#000] active:translate-y-0.5"
            title="Ver personajes seleccionados (en juego) y desechados"
            aria-label={`Ver historial: ${historyCount} personajes`}
          >
            <ScrollText className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              <span className="hidden sm:inline">HISTORIAL: </span>
              {historyCount}
            </span>
          </button>

          {/* BOTÓN 3: USUARIOS CONECTADOS */}
          <button
            type="button"
            id="btn-users"
            name="btn-users"
            onClick={() => {
              sounds.playClick();
              onOpenConnectedModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-emerald-500/80 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 transition shadow-[2px_2px_0_#000] active:translate-y-0.5"
            title="Ver personas conectadas en vivo"
            aria-label={`Ver usuarios conectados: ${connectedUsersCount}`}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              {connectedUsersCount}
            </span>
          </button>

          {/* SELECTOR DE ROL (CUSTOM DROPDOWN) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              id="role-selector"
              name="role-selector"
              onClick={() => {
                sounds.playClick();
                setRoleMenuOpen((v) => !v);
              }}
              aria-haspopup="menu"
              aria-expanded={roleMenuOpen}
              aria-label={`Rol actual: ${currentRoleLabel}. Click para cambiar`}
              className="flex items-center gap-1.5 bg-[#0d101a] border-2 border-slate-700 hover:border-slate-500 rounded-xl p-0.5 pl-2 pr-1.5 py-1 shadow-inner transition"
              title="Tu rol en la subasta"
            >
              {currentRoleIcon}
              <span className="font-['Chakra_Petch'] font-bold text-white text-xs py-0.5 max-w-[100px] sm:max-w-[130px] truncate">
                {currentRoleLabel}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  roleMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {roleMenuOpen && (
              <div
                role="menu"
                aria-label="Seleccionar rol"
                className="absolute right-0 top-full mt-1.5 w-60 bg-[#151928] border-2 border-slate-700 rounded-xl shadow-[4px_4px_0_#000] overflow-hidden z-50 animate-fade-in"
              >
                <div className="px-3 py-1.5 bg-black/40 border-b border-slate-700">
                  <p className="font-['Press_Start_2P'] text-[9px] text-slate-300">
                    TU ROL
                  </p>
                </div>

                {/* Jugador 1 */}
                <RoleOption
                  id="role-opt-player1"
                  icon={<Gamepad2 className="w-3.5 h-3.5" />}
                  title="Jugador 1"
                  color="cyan"
                  subtitle={
                    isP1Me
                      ? "Controlas este slot"
                      : p1Occupied
                      ? "Ocupado por otro"
                      : "Disponible"
                  }
                  disabled={p1Occupied && !isP1Me}
                  active={isP1Me}
                  onClick={() => handleSelectRole("player1")}
                />

                {/* Jugador 2 */}
                <RoleOption
                  id="role-opt-player2"
                  icon={<Flame className="w-3.5 h-3.5" />}
                  title="Jugador 2"
                  color="rose"
                  subtitle={
                    isP2Me
                      ? "Controlas este slot"
                      : p2Occupied
                      ? "Ocupado por otro"
                      : "Disponible"
                  }
                  disabled={p2Occupied && !isP2Me}
                  active={isP2Me}
                  onClick={() => handleSelectRole("player2")}
                />

                {/* Espectador */}
                <RoleOption
                  id="role-opt-spectator"
                  icon={<Eye className="w-3.5 h-3.5" />}
                  title="Espectador"
                  color="slate"
                  subtitle={isSpectator ? "Modo actual" : "Solo ver"}
                  disabled={isSpectator}
                  active={isSpectator}
                  onClick={() => setRoleMenuOpen(false)}
                />
              </div>
            )}
          </div>

          {/* BOTÓN SILENCIO / AUDIO */}
          <button
            type="button"
            id="btn-sound"
            name="btn-sound"
            onClick={() => onToggleSound()}
            aria-label={soundMuted ? "Activar sonido" : "Silenciar sonido"}
            aria-pressed={!soundMuted}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] transition active:translate-y-0.5"
            title={soundMuted ? "Activar Sonido" : "Silenciar"}
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// SUB-COMPONENTE: RoleOption
// ============================================================================
function RoleOption({ id, icon, title, subtitle, disabled, active, onClick, color }) {
  const palette = {
    cyan: {
      iconActive: "text-cyan-400",
      iconIdle: "text-cyan-300/70",
      bg: active ? "bg-cyan-950/60" : "hover:bg-cyan-950/30",
      border: active ? "border-l-cyan-400" : "border-l-transparent",
    },
    rose: {
      iconActive: "text-rose-400",
      iconIdle: "text-rose-300/70",
      bg: active ? "bg-rose-950/60" : "hover:bg-rose-950/30",
      border: active ? "border-l-rose-400" : "border-l-transparent",
    },
    slate: {
      iconActive: "text-slate-300",
      iconIdle: "text-slate-400",
      bg: active ? "bg-slate-800/60" : "hover:bg-slate-800/30",
      border: active ? "border-l-slate-400" : "border-l-transparent",
    },
  }[color];

  return (
    <button
      type="button"
      id={id}
      name={id}
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={onClick}
      className={`w-full px-3 py-2 flex items-center gap-2.5 text-left border-l-4 ${palette.border} ${palette.bg} transition disabled:opacity-40 disabled:cursor-not-allowed border-b border-slate-800 last:border-b-0`}
    >
      <span
        className={disabled ? "text-slate-600" : active ? palette.iconActive : palette.iconIdle}
        aria-hidden="true"
      >
        {disabled ? <Lock className="w-3.5 h-3.5" /> : icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-['Chakra_Petch'] font-bold text-xs text-white truncate">
          {title}
        </div>
        <div className="text-[10px] font-['Chakra_Petch'] text-slate-400 truncate">
          {subtitle}
        </div>
      </div>
      {active && (
        <span className="text-[10px] text-emerald-400" aria-hidden="true">
          ●
        </span>
      )}
    </button>
  );
}