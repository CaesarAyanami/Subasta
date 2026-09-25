import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Package,
  Trash2,
  Trophy,
  Sparkles,
  Flame,
  Gamepad2,
  Crown,
  Search,
} from "lucide-react";
import CharacterCard from "../auction/CharacterCard";

// ============================================================================
// CONFIG DE TABS
// ============================================================================
const TAB_CONFIG = {
  available: {
    label: "Aún no salen",
    icon: Package,
    color: "yellow",
    gradient: "from-yellow-500 to-amber-600",
    border: "border-yellow-400",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.4)]",
    text: "text-yellow-300",
  },
  selected: {
    label: "Seleccionados",
    icon: Trophy,
    color: "cyan",
    gradient: "from-cyan-400 to-blue-600",
    border: "border-cyan-400",
    glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]",
    text: "text-cyan-300",
  },
  discarded: {
    label: "Desechados",
    icon: Trash2,
    color: "rose",
    gradient: "from-rose-500 to-red-600",
    border: "border-rose-500",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]",
    text: "text-rose-300",
  },
};

// ============================================================================
// COMPONENTE
// ============================================================================
export default function CharacterPoolModal({
  isOpen,
  onClose,
  initialTab = "available",
  available = [],
  discarded = [],
  used = [],
  players,
  onCharacterInfo = null, // ← NUEVO
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const closeButtonRef = useRef(null);

  // Sincronizar tab al abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
    }
  }, [isOpen, initialTab]);

  // ESC + focus + scroll lock
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

  const selectedChars = [...p1Chars, ...p2Chars, ...usedChars];

  const tabs = [
    {
      id: "available",
      ...TAB_CONFIG.available,
      count: available.length,
    },
    {
      id: "selected",
      ...TAB_CONFIG.selected,
      count: selectedChars.length,
    },
    {
      id: "discarded",
      ...TAB_CONFIG.discarded,
      count: discarded.length,
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

  // Filtrar por búsqueda
  const filteredList = searchQuery.trim()
    ? currentList.filter((c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentList;

  const currentTabConfig = TAB_CONFIG[activeTab];

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pool-modal-title"
            className="relative bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-[8px_8px_0_#eab308] text-white overflow-hidden"
          >
            {/* Glow decorativos */}
            <div
              className="absolute -top-32 -right-32 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* ─── Cabecera ──────────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between p-4 sm:p-5 pb-3 border-b-2 border-slate-800">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
                  aria-hidden="true"
                >
                  <Sparkles className="w-5 h-5 text-black" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2
                    id="pool-modal-title"
                    className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider drop-shadow-[1px_1px_0_#000]"
                  >
                    LISTA DE PERSONAJES
                  </h2>
                  <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">
                    {filteredList.length} de {currentList.length} personajes
                  </p>
                </div>
              </div>

              <motion.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </motion.button>
            </div>

            {/* ─── Buscador ──────────────────────────────────────────────── */}
            <div className="relative px-4 sm:px-5 pt-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  aria-label="Buscar personaje por nombre"
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border-2 border-slate-700 focus:border-cyan-400 rounded-xl text-sm font-['Chakra_Petch'] text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/40 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* ─── Tabs ──────────────────────────────────────────────────── */}
            <div
              role="tablist"
              aria-label="Categorías"
              className="grid grid-cols-3 gap-2 p-4 sm:p-5 pb-3"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-2 px-2 rounded-xl border-2 font-['Press_Start_2P'] text-[9px] sm:text-[10px] transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                      isActive
                        ? `bg-gradient-to-br ${tab.gradient} ${tab.border} ${tab.glow} text-black scale-[1.02]`
                        : "bg-black/40 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        isActive
                          ? "bg-black/40 text-white"
                          : "bg-black/60 text-slate-300"
                      }`}
                    >
                      {tab.count}
                    </span>

                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        animate={{
                          boxShadow: [
                            `0 0 0 0 ${tab.color === "yellow" ? "rgba(234,179,8,0.5)" : tab.color === "cyan" ? "rgba(34,211,238,0.5)" : "rgba(244,63,94,0.5)"}`,
                            `0 0 0 6px rgba(0,0,0,0)`,
                          ],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── Lista ─────────────────────────────────────────────────── */}
            <div
              id={`tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              className="relative flex-1 overflow-y-auto px-4 sm:px-5 pb-4"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredList.length === 0 ? (
                    <EmptyState
                      searchQuery={searchQuery}
                      activeTab={activeTab}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredList.map((char, index) => (
                        <motion.div
                          key={char.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.3) }}
                          className="relative"
                        >
                          <CharacterCard
                            character={char}
                            size="slot"
                            showMinPriceBadge={true}
                            onInfo={onCharacterInfo}
                          />
                          {/* Badge de ganador */}
                          {activeTab === "selected" && char._wonBy && (
                            <WinnerBadge wonBy={char._wonBy} />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ─── Footer ────────────────────────────────────────────────── */}
            <div className="relative p-4 sm:p-5 pt-3 border-t-2 border-slate-800">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-200"
              >
                CERRAR
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// SUB-COMPONENTE: EmptyState
// ============================================================================
function EmptyState({ searchQuery, activeTab }) {
  const isEmptyList = !searchQuery;
  const Icon = isEmptyList ? TAB_CONFIG[activeTab].icon : Search;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-black/30"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block mb-3"
      >
        <Icon className="w-12 h-12 text-slate-600 mx-auto" strokeWidth={1.5} aria-hidden="true" />
      </motion.div>
      <p className="font-['Press_Start_2P'] text-[10px] text-slate-400 mb-1">
        {isEmptyList ? "Sin personajes" : "Sin resultados"}
      </p>
      <p className="text-[11px] text-slate-500 font-['Chakra_Petch']">
        {isEmptyList
          ? "No hay personajes en esta categoría por ahora."
          : `No se encontró "${searchQuery}"`}
      </p>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENTE: WinnerBadge
// ============================================================================
function WinnerBadge({ wonBy }) {
  const isP1 = wonBy === "player1";
  const Icon = isP1 ? Gamepad2 : Flame;

  return (
    <motion.span
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={`absolute -top-2 -left-2 px-2 py-1 rounded-lg text-[9px] font-['Press_Start_2P'] border-2 border-black flex items-center gap-1 shadow-[2px_2px_0_#000] ${
        isP1
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
          : "bg-gradient-to-r from-rose-500 to-red-600 text-white"
      }`}
      aria-label={`Ganado por ${isP1 ? "Jugador 1" : "Jugador 2"}`}
    >
      <Icon className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
      {isP1 ? "P1" : "P2"}
    </motion.span>
  );
}