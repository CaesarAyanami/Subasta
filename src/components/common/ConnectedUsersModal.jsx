import React from "react";
import { X, Users, ShieldCheck, Eye, Gamepad2, Flame } from "lucide-react";

export default function ConnectedUsersModal({ isOpen, onClose, connectedUsers = [], currentUserId }) {
  if (!isOpen) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case "player1":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-cyan-400 text-black border border-black flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" />
            JUGADOR 1
          </span>
        );
      case "player2":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-rose-500 text-white border border-black flex items-center gap-1">
            <Flame className="w-3 h-3" />
            JUGADOR 2
          </span>
        );
      case "both":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-yellow-400 text-black border border-black flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" />
            MODO DUAL
          </span>
        );
      case "spectator":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            ESPECTADOR
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-md w-full p-5 shadow-[8px_8px_0_#eab308] text-white">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-400/20 border border-yellow-400 rounded-lg">
              <Users className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider">
                USUARIOS EN LA SALA
              </h2>
              <p className="text-[11px] text-slate-400 font-['Chakra_Petch']">
                {connectedUsers.length} {connectedUsers.length === 1 ? "persona conectada" : "personas conectadas"} en tiempo real
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Usuarios Conectados */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-4">
          {connectedUsers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-['Chakra_Petch'] text-xs">
              No hay otros usuarios detectados aún.
            </div>
          ) : (
            connectedUsers.map((user, idx) => {
              const isMe = user.id === currentUserId;
              return (
                <div
                  key={user.id || idx}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between gap-3 ${
                    isMe
                      ? "bg-yellow-400/10 border-yellow-400/80 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                      : "bg-[#0d101a] border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
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

                  <div>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] transition active:translate-y-0.5"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
