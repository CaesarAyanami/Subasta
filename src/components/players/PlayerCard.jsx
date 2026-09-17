import React, { useState } from "react";
import { Coins, Check, CheckCircle2, Edit2, Zap } from "lucide-react";
import sounds from "../../services/soundEffects";

export default function PlayerCard({
  playerId = "player1",
  player,
  isLocalPlayer = true,
  canToggleReady = true,
  onUpdateName,
  onToggleReady
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player?.name || "");

  const isP1 = playerId === "player1";
  const theme = isP1
    ? {
        border: "border-cyan-400 shadow-[4px_4px_0_#0891b2]",
        headerBg: "bg-cyan-950/60 border-cyan-400/40",
        badge: "bg-cyan-500 text-black",
        titleColor: "text-cyan-400",
        label: "Jugador 1"
      }
    : {
        border: "border-rose-500 shadow-[4px_4px_0_#be123c]",
        headerBg: "bg-rose-950/60 border-rose-500/40",
        badge: "bg-rose-500 text-white",
        titleColor: "text-rose-400",
        label: "Jugador 2"
      };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(playerId, nameInput.trim());
    }
    setEditingName(false);
  };

  const handleReadyClick = () => {
    if (!canToggleReady) return;
    sounds.playReady();
    onToggleReady(playerId);
  };

  return (
    <div className={`rounded-2xl border-4 ${theme.border} bg-[#121526] p-3 sm:p-4 text-white relative transition-all`}>
      
      {/* Cabecera del Jugador */}
      <div className={`p-2 rounded-xl border ${theme.headerBg} flex items-center justify-between gap-2 mb-3`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-['Press_Start_2P'] font-black uppercase ${theme.badge}`}>
            {isP1 ? "P1" : "P2"}
          </span>
          
          {editingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                maxLength={14}
                className="bg-black border border-yellow-400 px-1.5 py-0.5 rounded text-xs font-['Press_Start_2P'] text-yellow-300 w-24 sm:w-32 outline-none"
              />
              <button type="submit" className="p-1 bg-yellow-400 text-black rounded hover:bg-yellow-300">
                <Check className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 group cursor-pointer min-w-0" onClick={() => isLocalPlayer && setEditingName(true)}>
              <span className={`font-['Press_Start_2P'] text-xs sm:text-sm ${theme.titleColor} truncate max-w-[110px] sm:max-w-[150px]`}>
                {player?.name || theme.label}
              </span>
              {isLocalPlayer && (
                <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-yellow-400 transition flex-shrink-0" />
              )}
            </div>
          )}
        </div>

        {/* Indicador Sutil de Conexión (Sin textos largos que desborden) */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 border border-slate-700" title="Jugador en línea">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Saldo de Monedas Simplificado */}
      <div className="bg-black/50 border-2 border-yellow-400/60 rounded-xl p-2.5 mb-3 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-400/20 border border-yellow-400 rounded-lg flex-shrink-0">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-lg sm:text-xl font-['Press_Start_2P'] text-yellow-400 drop-shadow-[2px_2px_0_#000]">
            {player?.coins ?? 20} <span className="text-[10px] text-yellow-200">MON.</span>
          </div>
        </div>
      </div>

      {/* Botón LISTO / READY Compacto */}
      <div>
        <button
          onClick={handleReadyClick}
          disabled={!canToggleReady || !isLocalPlayer}
          className={`w-full py-2.5 sm:py-3 px-3 rounded-xl border-4 font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider transition-all transform active:translate-y-1 ${
            player?.ready
              ? "bg-emerald-500 hover:bg-emerald-400 text-black border-black shadow-[3px_3px_0_#000]"
              : `${theme.badge} hover:brightness-110 text-white border-black shadow-[3px_3px_0_#000] animate-pulse`
          } ${(!canToggleReady || !isLocalPlayer) ? "opacity-60 cursor-not-allowed filter grayscale-[30%]" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            {player?.ready ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
                <span>¡LISTO!</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-yellow-300 animate-bounce flex-shrink-0" />
                <span>MARCAR LISTO</span>
              </>
            )}
          </div>
        </button>

        {!isLocalPlayer && (
          <p className="text-[9px] text-center text-slate-500 font-['Chakra_Petch'] mt-1">
            (Controlado por otro dispositivo)
          </p>
        )}
      </div>

    </div>
  );
}
