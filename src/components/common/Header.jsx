import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  LogOut,
  Sparkles,
  Percent,
} from "lucide-react";
import sounds from "../../services/soundEffects";

// ============================================================================
// HEADER PRINCIPAL
// ============================================================================
export default function Header({
  mySlot = null,
  onTakeSlot,
  onBecomeSpectator,
  players,
  connectedUsersCount = 1,
  onOpenConnectedModal,
  onOpenProbabilityModal,
  availableCount = 0,
  historyCount = 0,
  onOpenPoolModal,
  soundMuted,
  onToggleSound,
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú con click fuera o ESC
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

  // Detectar ocupación
  const p1 = players?.player1;
  const p2 = players?.player2;
  const p1Occupied = !!p1?.is_occupied;
  const p2Occupied = !!p2?.is_occupied;

  const isP1Me = mySlot === "player1";
  const isP2Me = mySlot === "player2";
  const isSpectator = !mySlot;

  // Iconos del rol actual
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

  // Handlers
  const handleSelectRole = (slot) => {
    setRoleMenuOpen(false);
    if (slot === mySlot) return;
    sounds.playClick();
    onTakeSlot && onTakeSlot(slot);
  };

  const handleBecomeSpectator = () => {
    setRoleMenuOpen(false);
    if (isSpectator) return;
    sounds.playClick();
    onBecomeSpectator && onBecomeSpectator();
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="relative bg-[#111422]/95 border-b-4 border-black backdrop-blur-md sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
    >
      {/* Línea superior decorativa */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4 py-2.5">
        {/* ─── LOGO ──────────────────────────────────────────────────── */}
        <a
          href="/"
          className="group flex items-center gap-2 cursor-pointer select-none flex-shrink-0"
          aria-label="Ir al tablero principal"
        >
          <motion.div
            whileHover={{ rotate: 0, scale: 1.05 }}
            className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] transform -rotate-3 transition"
          >
            <Gamepad2 className="w-5 h-5 text-black" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-['Press_Start_2P'] text-xs sm:text-base text-yellow-400 tracking-wider drop-shadow-[2px_2px_0_#000] group-hover:text-glow-gold transition">
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

        {/* ─── CONTROLES ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
          {/* POOL */}
          <NavButton
            id="btn-pool"
            icon={Package}
            label="POOL"
            count={availableCount}
            color="yellow"
            title="Ver personajes disponibles"
            onClick={() => {
              sounds.playClick();
              onOpenPoolModal && onOpenPoolModal("available");
            }}
            ariaLabel={`Ver pool disponible: ${availableCount} personajes`}
          />

          {/* HISTORIAL */}
          <NavButton
            id="btn-history"
            icon={ScrollText}
            label="HISTORIAL"
            count={historyCount}
            color="cyan"
            title="Ver historial de personajes"
            onClick={() => {
              sounds.playClick();
              onOpenPoolModal && onOpenPoolModal("selected");
            }}
            ariaLabel={`Ver historial: ${historyCount} personajes`}
          />

          {/* PROBABILIDADES */}
          <motion.button
            type="button"
            id="btn-probabilities"
            onClick={() => {
              sounds.playClick();
              onOpenProbabilityModal && onOpenProbabilityModal();
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-fuchsia-500/80 bg-fuchsia-950/60 hover:bg-fuchsia-900/80 text-fuchsia-300 shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            title="Ver probabilidades actuales del gacha"
            aria-label="Ver probabilidades del gacha"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Percent className="w-3.5 h-3.5 text-fuchsia-400" strokeWidth={2.5} aria-hidden="true" />
            </motion.div>
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] hidden sm:inline">
              PROB.
            </span>
          </motion.button>

          {/* USUARIOS */}
          <motion.button
            type="button"
            id="btn-users"
            onClick={() => {
              sounds.playClick();
              onOpenConnectedModal();
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-emerald-500/80 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title="Ver personas conectadas en vivo"
            aria-label={`Ver usuarios conectados: ${connectedUsersCount}`}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Users className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px]">
              {connectedUsersCount}
            </span>
          </motion.button>

          {/* ─── SELECTOR DE ROL ─────────────────────────────────────── */}
          <div className="relative" ref={menuRef}>
            <motion.button
              type="button"
              id="role-selector"
              onClick={() => {
                sounds.playClick();
                setRoleMenuOpen((v) => !v);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-haspopup="menu"
              aria-expanded={roleMenuOpen}
              aria-label={`Rol actual: ${currentRoleLabel}. Click para cambiar`}
              className={`flex items-center gap-1.5 rounded-xl p-0.5 pl-2 pr-1.5 py-1 shadow-inner transition border-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                roleMenuOpen
                  ? "bg-[#0d101a] border-yellow-400"
                  : "bg-[#0d101a] border-slate-700 hover:border-slate-500"
              }`}
            >
              {currentRoleIcon}
              <span className="font-['Chakra_Petch'] font-bold text-white text-xs py-0.5 max-w-[100px] sm:max-w-[130px] truncate">
                {currentRoleLabel}
              </span>
              <motion.span
                animate={{ rotate: roleMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {roleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  aria-label="Seleccionar rol"
                  className="absolute right-0 top-full mt-2 w-64 bg-[#151928] border-2 border-slate-700 rounded-xl shadow-[4px_4px_0_#000] overflow-hidden z-50"
                >
                  <div className="px-3 py-2 bg-gradient-to-r from-yellow-400/20 to-transparent border-b border-slate-700 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-400" aria-hidden="true" />
                    <p className="font-['Press_Start_2P'] text-[9px] text-yellow-300">
                      TU ROL
                    </p>
                  </div>

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

                  <RoleOption
                    id="role-opt-spectator"
                    icon={
                      isSpectator ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )
                    }
                    title={isSpectator ? "Espectador" : "Volver a Espectador"}
                    color="slate"
                    subtitle={
                      isSpectator ? "Modo actual" : "Liberar tu slot y salir"
                    }
                    disabled={false}
                    active={isSpectator}
                    onClick={handleBecomeSpectator}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── BOTÓN SONIDO ────────────────────────────────────────── */}
          <motion.button
            type="button"
            id="btn-sound"
            onClick={onToggleSound}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={soundMuted ? "Activar sonido" : "Silenciar sonido"}
            aria-pressed={!soundMuted}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
            title={soundMuted ? "Activar Sonido" : "Silenciar"}
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// ============================================================================
// SUB-COMPONENTE: NavButton
// ============================================================================
function NavButton({ id, icon: Icon, label, count, color, onClick, title, ariaLabel }) {
  const palettes = {
    yellow: {
      container:
        "border-yellow-500/80 bg-yellow-950/60 hover:bg-yellow-900/80 text-yellow-300 focus:ring-yellow-400",
      icon: "text-yellow-400",
      badge: "bg-yellow-400 text-black",
    },
    cyan: {
      container:
        "border-cyan-500/80 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 focus:ring-cyan-400",
      icon: "text-cyan-400",
      badge: "bg-cyan-400 text-black",
    },
  }[color];

  return (
    <motion.button
      type="button"
      id={id}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 ${palettes.container}`}
      title={title}
      aria-label={ariaLabel}
    >
      <Icon className={`w-3.5 h-3.5 ${palettes.icon}`} strokeWidth={2.5} aria-hidden="true" />
      <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] flex items-center gap-1">
        <span className="hidden sm:inline">{label}:</span>
        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[9px] font-bold ${palettes.badge}`}>
          {count}
        </span>
      </span>
    </motion.button>
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
      glow: active ? "shadow-[inset_0_0_20px_rgba(34,211,238,0.15)]" : "",
    },
    rose: {
      iconActive: "text-rose-400",
      iconIdle: "text-rose-300/70",
      bg: active ? "bg-rose-950/60" : "hover:bg-rose-950/30",
      border: active ? "border-l-rose-400" : "border-l-transparent",
      glow: active ? "shadow-[inset_0_0_20px_rgba(244,63,94,0.15)]" : "",
    },
    slate: {
      iconActive: "text-slate-300",
      iconIdle: "text-slate-400",
      bg: active ? "bg-slate-800/60" : "hover:bg-slate-800/30",
      border: active ? "border-l-slate-400" : "border-l-transparent",
      glow: "",
    },
  }[color];

  return (
    <motion.button
      type="button"
      id={id}
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? { x: 4 } : {}}
      className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left border-l-4 ${palette.border} ${palette.bg} ${palette.glow} transition disabled:opacity-40 disabled:cursor-not-allowed border-b border-slate-800 last:border-b-0 focus:outline-none focus:bg-slate-800/80`}
    >
      <span
        className={
          disabled
            ? "text-slate-600"
            : active
            ? palette.iconActive
            : palette.iconIdle
        }
        aria-hidden="true"
      >
        {disabled ? (
          <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
        ) : (
          icon
        )}
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
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}