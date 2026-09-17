import React, { useState, useEffect } from "react";
import { X, Package, Trash2, Trophy, Sparkles } from "lucide-react";
import CharacterCard from "../auction/CharacterCard";

export default function CharacterPoolModal({
  isOpen,
  onClose,
  initialTab = "available", // 'available' | 'discarded' | 'used'
  available = [],
  discarded = [],
  used = [],
  players
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Personajes actualmente seleccionados (en juego en los inventarios + used)
  const p1Chars = players?.player1?.inventory || [];
  const p2Chars = players?.player2?.inventory || [];
  const selectedChars = [...p1Chars, ...p2Chars, ...used];

  const tabs = [
    {
      id: "available",
      label: "Aún no salen",
      icon: <Package className="w-3.5 h-3.5" />,
      count: available.length,
      color: "text-yellow-400 border-yellow-400 bg-yellow-400/20"
    },
    {
      id: "selected",
      label: "Seleccionados",
      icon: <Trophy className="w-3.5 h-3.5" />,
      count: selectedChars.length,
      color: "text-cyan-400 border-cyan-400 bg-cyan-400/20"
    },
    {
      id: "discarded",
      label: "Desechados",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      count: discarded.length,
      color: "text-rose-400 border-rose-400 bg-rose-400/20"
    }
  ];

  const getActiveList = () => {
    if (activeTab === "available") return available;
    if (activeTab === "selected") return selectedChars;
    if (activeTab === "discarded") return discarded;
    return [];
  };

  const currentList = getActiveList();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col p-4 sm:p-5 shadow-[8px_8px_0_#eab308] text-white">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider">
              LISTA DE PERSONAJES
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 sm:px-3 rounded-xl border-2 font-['Press_Start_2P'] text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 transition ${
                  isSelected
                    ? `${tab.color} shadow-[2px_2px_0_#000]`
                    : "bg-black/40 border-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="hidden xs:inline">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/60 text-[9px]">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contenedor de la lista scrolleable */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[55vh]">
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-['Chakra_Petch'] text-xs border-2 border-dashed border-slate-800 rounded-xl bg-black/30">
              No hay personajes en esta categoría por ahora.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentList.map((char, index) => (
                <CharacterCard
                  key={char.id || index}
                  character={char}
                  size="slot"
                  showMinPriceBadge={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="pt-3 border-t-2 border-slate-800 text-right">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-yellow-400 hover:bg-yellow-300 text-black font-['Press_Start_2P'] text-[10px] rounded-xl border-2 border-black shadow-[2px_2px_0_#000] transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
