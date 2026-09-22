import React, { useEffect, useRef } from "react";
import { X, Users, Gamepad2, Flame, Eye } from "lucide-react";

export default function ConnectedUsersModal({
  isOpen,
  onClose,
  connectedUsers = [],
  mySlot = null,
}) {
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);

  // Cerrar con ESC + bloquear scroll del body
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);

    // Focus inicial en el botón de cierre (accesibilidad)
    closeButtonRef.current?.focus();

    // Bloquear scroll de fondo
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ordenar: yo primero, luego jugadores, luego espectadores
  const sortedUsers = [...connectedUsers].sort((a, b) => {
    const isAMe = a.slot === mySlot && mySlot;
    const isBMe = b.slot === mySlot && mySlot;
    if (isAMe && !isBMe) return -1;
    if (isBMe && !isAMe) return 1;

    const roleWeight = (u) => (u.slot === "player1" ? 0 : u.slot === "player2" ? 1 : 2);
    return roleWeight(a) - roleWeight(b);
  });

  const playerCount = connectedUsers.filter(
    (u) => u.slot === "player1" || u.slot === "player2"
  ).length;
  const spectatorCount = connectedUsers.length - playerCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        // Cerrar al hacer click en el backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connected-users-title"
        aria-describedby="connected-users-desc"
        className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-md w-full p-5 shadow-[8px_8px_0_#eab308] text-white"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-400/20 border border-yellow-400 rounded-lg">
              <Users className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="connected-users-title"
                className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider"
              >
                USUARIOS EN LA SALA
              </h2>
              <p
                id="connected-users-desc"
                className="text-[11px] text-slate-400 font-['Chakra_Petch']"
              >
                {connectedUsers.length}{" "}
                {connectedUsers.length === 1
                  ? "persona conectada"
                  : "personas conectadas"}{" "}
                en tiempo real
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            id="btn-close-users-modal"
            name="btn-close-users-modal"
            onClick={onClose}
            aria-label="Cerrar modal de usuarios conectados"
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Resumen de roles */}
        {connectedUsers.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3 text-[10px] font-['Chakra_Petch']">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/60 text-cyan-300">
              {playerCount} en juego
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700 text-slate-400">
              {spectatorCount} {spectatorCount === 1 ? "espectador" : "espectadores"}
            </span>
          </div>
        )}

        {/* Lista de Usuarios Conectados */}
        <div
          className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-4"
          role="list"
          aria-live="polite"
          aria-label="Lista de usuarios conectados"
        >
          {connectedUsers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-['Chakra_Petch'] text-xs">
              No hay otros usuarios detectados aún.
            </div>
          ) : (
            sortedUsers.map((user) => {
              const isMe = !!mySlot && user.slot === mySlot;
              return (
                <div
                  key={user.id}
                  role="listitem"
                  className={`p-3 rounded-xl border-2 flex items-center justify-between gap-3 transition ${
                    isMe
                      ? "bg-yellow-400/10 border-yellow-400/80 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                      : "bg-[#0d101a] border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Chakra_Petch'] font-bold text-sm text-white truncate max-w-[140px]">
                          {user.name || "Jugador"}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-['Press_Start_2P'] text-yellow-400 bg-yellow-400/20 px-1 py-0.2 rounded border border-yellow-400/40">
                            TÚ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-['Chakra_Petch']">
                        En línea ahora
                      </span>
                    </div>
                  </div>

                  <div>{getRoleBadge(user.slot)}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            id="btn-confirm-close-users-modal"
            name="btn-confirm-close-users-modal"
            onClick={onClose}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] transition active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BADGE DE ROL
// ============================================================================
function getRoleBadge(slot) {
  switch (slot) {
    case "player1":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-cyan-400 text-black border border-black flex items-center gap-1 whitespace-nowrap">
          <Gamepad2 className="w-3 h-3" aria-hidden="true" />
          JUGADOR 1
        </span>
      );
    case "player2":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-rose-500 text-white border border-black flex items-center gap-1 whitespace-nowrap">
          <Flame className="w-3 h-3" aria-hidden="true" />
          JUGADOR 2
        </span>
      );
    case "spectator":
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1 whitespace-nowrap">
          <Eye className="w-3 h-3" aria-hidden="true" />
          ESPECTADOR
        </span>
      );
  }
}