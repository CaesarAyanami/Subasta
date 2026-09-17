import React from "react";
import { Coins, CheckCircle, Flame, ShieldAlert } from "lucide-react";
import sounds from "../../services/soundEffects";

export default function BiddingControls({
  userRole = "both", // 'both' | 'player1' | 'player2' | 'spectator'
  players,
  currentBid,
  highestBidder,
  minAcceptancePrice = 0,
  timerRunning,
  onBid,
  onToggleFinish
}) {
  const p1 = players?.player1;
  const p2 = players?.player2;

  // Calcular la siguiente puja requerida
  const nextBid = currentBid === 0 ? Math.max(minAcceptancePrice, 1) : currentBid + 1;

  // Comprobar si cada jugador puede pujar
  const canP1Bid = p1 && p1.coins >= nextBid && highestBidder !== "player1" && (p1.inventory?.length || 0) < 4;
  const canP2Bid = p2 && p2.coins >= nextBid && highestBidder !== "player2" && (p2.inventory?.length || 0) < 4;

  const handleBidClick = (playerId) => {
    if (!timerRunning) return;
    const player = players[playerId];
    if (!player || player.coins < nextBid) return;

    sounds.playCoin();
    onBid(playerId, nextBid);
  };

  const handleFinishClick = (playerId) => {
    if (!timerRunning) return;
    sounds.playClick();
    onToggleFinish(playerId);
  };

  const showP1Controls = userRole === "both" || userRole === "player1";
  const showP2Controls = userRole === "both" || userRole === "player2";

  return (
    <div className="w-full space-y-4">
      
      {/* Botones de Puja para Jugadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Control de Puja: Jugador 1 */}
        {showP1Controls && (
          <div className="p-3 bg-cyan-950/40 border-2 border-cyan-500/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-['Press_Start_2P'] text-[10px] text-cyan-400 uppercase">
                {p1?.name || "Jugador 1"}
              </span>
              <span className="text-[10px] font-['Chakra_Petch'] text-slate-300">
                Saldo: <strong className="text-yellow-400 font-bold">{p1?.coins ?? 0}</strong> mon.
              </span>
            </div>

            <button
              onClick={() => handleBidClick("player1")}
              disabled={!canP1Bid || !timerRunning}
              className={`w-full py-3 px-4 rounded-xl font-['Press_Start_2P'] text-xs border-4 transition-all transform active:translate-y-1 ${
                highestBidder === "player1"
                  ? "bg-emerald-600 text-white border-black shadow-[3px_3px_0_#000] cursor-default"
                  : canP1Bid && timerRunning
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black border-black shadow-[4px_4px_0_#000] cursor-pointer"
                  : "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-4 h-4 text-yellow-300" />
                <span>
                  {highestBidder === "player1" 
                    ? "¡LIDERANDO PUJA!" 
                    : `PUJAR (${nextBid} MON.)`}
                </span>
              </div>
            </button>

            {/* Botón Finalizar de P1 */}
            <button
              onClick={() => handleFinishClick("player1")}
              disabled={!timerRunning}
              className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-['Press_Start_2P'] border-2 transition ${
                p1?.finishRequested
                  ? "bg-amber-400 text-black border-black font-bold shadow-[2px_2px_0_#000]"
                  : "bg-black/60 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {p1?.finishRequested ? "✓ FINALIZAR PEDIDO (P1)" : "FINALIZAR SUBASTA (P1)"}
            </button>
          </div>
        )}

        {/* Control de Puja: Jugador 2 */}
        {showP2Controls && (
          <div className="p-3 bg-rose-950/40 border-2 border-rose-500/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-['Press_Start_2P'] text-[10px] text-rose-400 uppercase">
                {p2?.name || "Jugador 2"}
              </span>
              <span className="text-[10px] font-['Chakra_Petch'] text-slate-300">
                Saldo: <strong className="text-yellow-400 font-bold">{p2?.coins ?? 0}</strong> mon.
              </span>
            </div>

            <button
              onClick={() => handleBidClick("player2")}
              disabled={!canP2Bid || !timerRunning}
              className={`w-full py-3 px-4 rounded-xl font-['Press_Start_2P'] text-xs border-4 transition-all transform active:translate-y-1 ${
                highestBidder === "player2"
                  ? "bg-emerald-600 text-white border-black shadow-[3px_3px_0_#000] cursor-default"
                  : canP2Bid && timerRunning
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black border-black shadow-[4px_4px_0_#000] cursor-pointer"
                  : "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-4 h-4 text-yellow-300" />
                <span>
                  {highestBidder === "player2" 
                    ? "¡LIDERANDO PUJA!" 
                    : `PUJAR (${nextBid} MON.)`}
                </span>
              </div>
            </button>

            {/* Botón Finalizar de P2 */}
            <button
              onClick={() => handleFinishClick("player2")}
              disabled={!timerRunning}
              className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-['Press_Start_2P'] border-2 transition ${
                p2?.finishRequested
                  ? "bg-amber-400 text-black border-black font-bold shadow-[2px_2px_0_#000]"
                  : "bg-black/60 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {p2?.finishRequested ? "✓ FINALIZAR PEDIDO (P2)" : "FINALIZAR SUBASTA (P2)"}
            </button>
          </div>
        )}

      </div>

      {/* Estado de Consenso para Finalizar */}
      <div className="text-center p-2 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-['Chakra_Petch'] text-slate-400 flex items-center justify-center gap-4">
        <span>Consenso para terminar anticipadamente:</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p1?.finishRequested ? "bg-green-500/20 text-green-300 border border-green-500" : "bg-slate-800 text-slate-500"}`}>
            P1: {p1?.finishRequested ? "LISTO" : "PENDIENTE"}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p2?.finishRequested ? "bg-green-500/20 text-green-300 border border-green-500" : "bg-slate-800 text-slate-500"}`}>
            P2: {p2?.finishRequested ? "LISTO" : "PENDIENTE"}
          </span>
        </div>
      </div>

    </div>
  );
}
