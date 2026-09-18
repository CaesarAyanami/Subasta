import React, { useState, useEffect, useRef } from "react";
import { X, Package, Trash2, Trophy, Sparkles } from "lucide-react";
import CharacterCard from "../auction/CharacterCard";

export default function CharacterPoolModal({
  isOpen,
  onClose,
  initialTab = "available", // 'available' | 'selected' | 'discarded'
  available = [],
  discarded = [],
  used = [],
  players,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);

  // Sincronizar tab inicial al abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // ESC + focus + bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ==========================================================================
  // DATOS POR TAB
  // ==========================================================================
  const p1Chars = (players?.player1?.inventory || []).map((c) => ({
    ...c,
    _wonBy: "player1",
  }));
  const p2Chars = (players?.player2?.inventory || []).map((c) => ({
    ...c,
    _wonBy: "player2",
  }));
  const usedChars = (used || []).map((c) => ({ ...c, _wonBy: null }));

  // Orden: P1 → P2 → usados
  const selectedChars = [...p1Chars, ...p2Chars, ...usedChars];

  const tabs = [
    {
      id: "available",
      label: "Aún no salen",
      icon: <Package className="w-3.5 h-3.5" aria-hidden="true" />,
      count: available.length,
      color: "text-yellow-400 border-yellow-400 bg-yellow-400/20",
    },
    {
      id: "selected",
      label: "Seleccionados",
      icon: <Trophy className="w-3.5 h-3.5" aria-hidden="true" />,
      count: selectedChars.length,
      color: "text-cyan-400 border-cyan-400 bg-cyan-400/20",
    },
    {
      id: "discarded",
      label: "Desechados",
      icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,
      count: discarded.length,
      color: "text-rose-400 border-rose-400 bg-rose-400/20",
    },
  ];

  const currentList =
    activeTab === "available"
      ? available
      : activeTab === "selected"
      ? selectedChars
      : activeTab === "discarded"
      ? discarded
      : [];

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pool-modal-title"
        className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col p-4 sm:p-5 shadow-[8px_8px_0_#eab308] text-white"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles
              className="w-5 h-5 text-yellow-400"
              aria-hidden="true"
            />
            <h2
              id="pool-modal-title"
              className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider"
            >
              LISTA DE PERSONAJES
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            id="btn-close-pool-modal"
            name="btn-close-pool-modal"
            onClick={onClose}
            aria-label="Cerrar modal de personajes"
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Categorías de personajes"
          className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                name={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 sm:px-3 rounded-xl border-2 font-['Press_Start_2P'] text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
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

        {/* Lista */}
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[55vh]"
        >
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-['Chakra_Petch'] text-xs border-2 border-dashed border-slate-800 rounded-xl bg-black/30">
              No hay personajes en esta categoría por ahora.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentList.map((char, index) => (
                <div key={char.id || index} className="relative">
                  <CharacterCard
                    character={char}
                    size="slot"
                    showMinPriceBadge={true}
                  />
                  {/* Badge de jugador que lo ganó (solo en tab "selected") */}
                  {activeTab === "selected" && char._wonBy && (
                    <span
                      className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded text-[8px] font-['Press_Start_2P'] border border-black ${
                        char._wonBy === "player1"
                          ? "bg-cyan-400 text-black"
                          : "bg-rose-500 text-white"
                      }`}
                      aria-label={`Ganado por ${
                        char._wonBy === "player1" ? "Jugador 1" : "Jugador 2"
                      }`}
                    >
                      {char._wonBy === "player1" ? "P1" : "P2"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-slate-800 text-right">
          <button
            type="button"
            id="btn-confirm-close-pool-modal"
            name="btn-confirm-close-pool-modal"
            onClick={onClose}
            className="py-2 px-5 bg-yellow-400 hover:bg-yellow-300 text-black font-['Press_Start_2P'] text-[10px] rounded-xl border-2 border-black shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}