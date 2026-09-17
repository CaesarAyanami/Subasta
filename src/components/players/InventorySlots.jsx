import React from "react";
import CharacterCard from "../auction/CharacterCard";
import { Shield } from "lucide-react";

export default function InventorySlots({ inventory = [], onCharacterClick = null }) {
  const slots = [0, 1, 2, 3];

  return (
    <div className="mt-2 bg-[#0d101a] border-2 border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-inner">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-['Press_Start_2P'] text-[10px] text-yellow-400 uppercase tracking-wider">
            EQUIPO ({inventory.length}/4)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2">
        {slots.map((index) => {
          const char = inventory[index];
          if (char) {
            return (
              <CharacterCard
                key={char.id || index}
                character={char}
                size="slot"
                onClick={() => onCharacterClick && onCharacterClick(char)}
              />
            );
          }
          return (
            <div
              key={index}
              className="h-12 rounded-xl border-2 border-dashed border-slate-800 bg-black/40 flex items-center justify-center gap-1.5 text-slate-600 select-none"
            >
              <span className="font-['Press_Start_2P'] text-[9px] text-slate-600">
                [ {index + 1} ]
              </span>
              <span className="text-[10px] font-['Chakra_Petch'] text-slate-600 italic">
                Libre
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
