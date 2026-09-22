import React, { useState, useEffect } from "react";
import {
  Coins,
  Check,
  CheckCircle2,
  Edit2,
  Zap,
  Lock,
  UserPlus,
  Flame,
} from "lucide-react";
import sounds from "../../services/soundEffects";

export default function PlayerCard({
  playerId = "player1",
  player,
  isLocalPlayer = false,
  isOccupied = false,
  canToggleReady = true,
  onUpdateName,
  onToggleReady,
  onTakeSlot,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player?.name || "");

  // Sincronizar input si cambia el nombre desde fuera
  useEffect(() => {
    if (!editingName) setNameInput(player?.name || "");
  }, [player?.name, editingName]);

  const isP1 = playerId === "player1";
  const theme = isP1
    ? {
        border: "border-cyan-400 shadow-[4px_4px_0_#0891b2]",
        headerBg: "bg-cyan-950/60 border-cyan-400/40",
        badge: "bg-cyan-500 text-black",
        titleColor: "text-cyan-400",
        label: "Jugador 1",
      }
    : {
        border: "border-rose-500 shadow-[4px_4px_0_#be123c]",
        headerBg: "bg-rose-950/60 border-rose-500/40",
        badge: "bg-rose-500 text-white",
        titleColor: "text-rose-400",
        label: "Jugador 2",
      };

  const isEmpty = !isOccupied;
  const isMine = isLocalPlayer;
  const isOtherPlayer = isOccupied && !isLocalPlayer;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim() && nameInput.trim() !== player?.name) {
      onUpdateName(playerId, nameInput.trim());
    }
    setEditingName(false);
  };

  const handleReadyClick = () => {
    if (!canToggleReady || !isMine) return;
    sounds.playReady();
    onToggleReady(playerId);
  };

  const handleTakeSlot = () => {
    sounds.playClick();
    onTakeSlot?.(playerId);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div
      className={`rounded-2xl border-4 ${theme.border} bg-[#121526] p-3 sm:p-4 text-white relative transition-all`}
      aria-label={`Panel de ${theme.label}`}
    >
      {/* Cabecera */}
      <div
        className={`p-2 rounded-xl border ${theme.headerBg} flex items-center justify-between gap-2 mb-3`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-['Press_Start_2P'] font-black uppercase ${theme.badge}`}
          >
            {isP1 ? "P1" : "P2"}
          </span>

          {editingName && isMine ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
              <input
                type="text"
                id={`player-name-input-${playerId}`}
                name={`player-name-input-${playerId}`}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                maxLength={14}
                aria-label="Nombre del jugador"
                className="bg-black border border-yellow-400 px-1.5 py-0.5 rounded text-xs font-['Press_Start_2P'] text-yellow-300 w-24 sm:w-32 outline-none focus:ring-2 focus:ring-yellow-400"
                onBlur={() => setEditingName(false)}
              />
              <button
                type="submit"
                aria-label="Guardar nombre"
                className="p-1 bg-yellow-400 text-black rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <Check className="w-3 h-3" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <div
              className={`flex items-center gap-1.5 group min-w-0 ${
                isMine ? "cursor-pointer" : ""
              }`}
              onClick={() => isMine && setEditingName(true)}
              role={isMine ? "button" : undefined}
              tabIndex={isMine ? 0 : -1}
              onKeyDown={(e) => {
                if (isMine && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setEditingName(true);
                }
              }}
              aria-label={isMine ? "Click para editar tu nombre" : undefined}
            >
              <span
                className={`font-['Press_Start_2P'] text-xs sm:text-sm ${theme.titleColor} truncate max-w-[110px] sm:max-w-[150px]`}
              >
                {player?.name || theme.label}
              </span>
              {isMine && (
                <Edit2
                  className="w-3 h-3 text-slate-500 group-hover:text-yellow-400 transition flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>

        {/* Indicador de conexión */}
        {isOccupied && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 border border-slate-700"
            title="Jugador en línea"
            aria-label="Jugador en línea"
          >
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"
              aria-hidden="true"
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Saldo de monedas */}
      <div className="bg-black/50 border-2 border-yellow-400/60 rounded-xl p-2.5 mb-3 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-400/20 border border-yellow-400 rounded-lg flex-shrink-0">
            <Coins className="w-5 h-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div
            className="text-lg sm:text-xl font-['Press_Start_2P'] text-yellow-400 drop-shadow-[2px_2px_0_#000]"
            aria-live="polite"
            aria-label={`${player?.coins ?? 20} monedas`}
          >
            {player?.coins ?? 20}{" "}
            <span className="text-[10px] text-yellow-200">MON.</span>
          </div>
        </div>

        {/* Racha ganadora */}
        {player?.win_streak > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500"
            title={`Racha ganadora: ${player.win_streak}`}
            aria-label={`Racha ganadora de ${player.win_streak}`}
          >
            <Flame className="w-3 h-3 text-orange-400" aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] text-orange-300">
              {player.win_streak}
            </span>
          </div>
        )}
      </div>

      {/* ZONA INFERIOR */}
      {isEmpty && (
        <button
          type="button"
          id={`btn-take-slot-${playerId}`}
          name={`btn-take-slot-${playerId}`}
          onClick={handleTakeSlot}
          aria-label={`Tomar el slot de ${theme.label}`}
          className="w-full py-2.5 sm:py-3 px-3 rounded-xl border-4 border-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider transition-all transform active:translate-y-1 shadow-[3px_3px_0_#000] focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <div className="flex items-center justify-center gap-1.5">
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>TOMAR ESTE SLOT</span>
          </div>
        </button>
      )}

      {isOtherPlayer && (
        <div
          className="w-full py-2.5 sm:py-3 px-3 rounded-xl border-4 border-slate-700 bg-slate-900/60 text-slate-500 font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider flex items-center justify-center gap-1.5"
          role="status"
          aria-label="Slot ocupado por otro jugador"
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span>OCUPADO</span>
        </div>
      )}

      {isMine && (
        <>
          <button
            type="button"
            id={`btn-ready-${playerId}`}
            name={`btn-ready-${playerId}`}
            onClick={handleReadyClick}
            disabled={!canToggleReady}
            aria-pressed={!!player?.ready}
            aria-label={player?.ready ? "Cancelar listo" : "Marcar como listo"}
            className={`w-full py-2.5 sm:py-3 px-3 rounded-xl border-4 font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider transition-all transform active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
              player?.ready
                ? "bg-emerald-500 hover:bg-emerald-400 text-black border-black shadow-[3px_3px_0_#000]"
                : `${theme.badge} hover:brightness-110 text-white border-black shadow-[3px_3px_0_#000] animate-pulse`
            } ${!canToggleReady ? "opacity-60 cursor-not-allowed filter grayscale-[30%]" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-center gap-1.5">
              {player?.ready ? (
                <>
                  <CheckCircle2
                    className="w-4 h-4 text-black flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>¡LISTO!</span>
                </>
              ) : (
                <>
                  <Zap
                    className="w-3.5 h-3.5 text-yellow-300 animate-bounce flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>MARCAR LISTO</span>
                </>
              )}
            </div>
          </button>

          {!canToggleReady && (
            <p className="text-[9px] text-center text-slate-500 font-['Chakra_Petch'] mt-1">
              (Esperando fin de ronda)
            </p>
          )}
        </>
      )}
    </div>
  );
}