import React from "react";
import { Sparkles, Trophy, AlertTriangle, Info } from "lucide-react";

export default function FloatingToast({ toast }) {
  if (!toast) return null;

  const iconMap = {
    trophy: <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />,
    sparkles: <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />,
    info: <Info className="w-6 h-6 text-blue-400" />
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 transform scale-100">
      <div className="flex items-center gap-3 px-6 py-3 bg-black/90 border-4 border-yellow-400 rounded-xl shadow-[6px_6px_0_#eab308] backdrop-blur-md animate-bounce">
        {iconMap[toast.type] || iconMap.info}
        <div>
          <div className="text-yellow-400 text-xs font-['Press_Start_2P'] uppercase tracking-wider">
            {toast.title || "ARCADE EVENT"}
          </div>
          <div className="text-white text-sm font-['Chakra_Petch'] font-bold">
            {toast.message}
          </div>
        </div>
      </div>
    </div>
  );
}
