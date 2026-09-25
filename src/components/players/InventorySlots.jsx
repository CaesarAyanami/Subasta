import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Package } from "lucide-react";
import CharacterCard from "../auction/CharacterCard";

// ============================================================================
// INVENTORY SLOTS
// ============================================================================
export default function InventorySlots({
  inventory = [],
  maxSlots = 4,
  onCharacterClick = null,
  onCharacterInfo = null, // ← NUEVO: callback para abrir el modal de info
}) {
  const slots = Array.from({ length: maxSlots }, (_, i) => i);
  const isFull = inventory.length >= maxSlots;
  const fillPercent = (inventory.length / maxSlots) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-2 bg-gradient-to-b from-[#0d101a] to-[#0a0d16] border-2 border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-inner overflow-hidden"
      aria-label={`Equipo del jugador: ${inventory.length} de ${maxSlots} slots ocupados`}
    >
      {/* Glow de fondo cuando está lleno */}
      <AnimatePresence>
        {isFull && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-transparent to-emerald-500/20 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={isFull ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className={`p-1 rounded-md ${isFull ? "bg-emerald-500/20" : "bg-yellow-500/10"}`}
          >
            {isFull ? (
              <CheckCircle2
                className="w-3.5 h-3.5 text-emerald-400"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            ) : (
              <Shield
                className="w-3.5 h-3.5 text-yellow-400"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            )}
          </motion.div>
          <span
            className={`font-['Press_Start_2P'] text-[10px] uppercase tracking-wider ${
              isFull ? "text-emerald-400" : "text-yellow-400"
            }`}
          >
            EQUIPO ({inventory.length}/{maxSlots})
          </span>
        </div>

        {/* Badge COMPLETO */}
        <AnimatePresence>
          {isFull && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="font-['Press_Start_2P'] text-[8px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500 flex items-center gap-1"
            >
              <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
              COMPLETO
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Barra de progreso ────────────────────────────────────── */}
      <div className="relative h-1 bg-slate-900 rounded-full overflow-hidden mb-2.5 border border-slate-800">
        <motion.div
          className={`h-full ${
            isFull
              ? "bg-gradient-to-r from-emerald-400 to-teal-500"
              : "bg-gradient-to-r from-yellow-400 to-amber-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5, type: "spring" }}
        />
      </div>

      {/* ─── Slots ────────────────────────────────────────────────── */}
      <div
        className="relative grid grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2"
        role="list"
        aria-label="Slots del equipo"
      >
        <AnimatePresence initial={false}>
          {slots.map((index) => {
            const char = inventory[index];

            if (char) {
              return (
                <motion.div
                  key={char.id || `filled-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  role="listitem"
                  tabIndex={onCharacterClick ? 0 : -1}
                  onClick={() => onCharacterClick?.(char)}
                  onKeyDown={(e) => {
                    if (
                      onCharacterClick &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      onCharacterClick(char);
                    }
                  }}
                  aria-label={`${char.name || "Personaje"} en slot ${index + 1}`}
                  className={
                    onCharacterClick
                      ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-xl"
                      : ""
                  }
                >
                  <CharacterCard
                    character={char}
                    size="slot"
                    onInfo={onCharacterInfo}
                  />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`empty-${index}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="listitem"
                aria-label={`Slot ${index + 1} vacío`}
                className="relative h-12 rounded-xl border-2 border-dashed border-slate-800 bg-black/40 flex items-center justify-center gap-1.5 select-none overflow-hidden group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1.5 relative z-10">
                  <Package
                    className="w-3 h-3 text-slate-700 group-hover:text-slate-600 transition-colors"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span className="font-['Press_Start_2P'] text-[9px] text-slate-600 group-hover:text-slate-500 transition-colors">
                    [ {index + 1} ]
                  </span>
                  <span className="text-[10px] font-['Chakra_Petch'] text-slate-600 group-hover:text-slate-500 italic transition-colors">
                    Libre
                  </span>
                </div>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 1.5 }}
                  aria-hidden="true"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}