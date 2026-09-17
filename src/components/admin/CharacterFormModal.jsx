import React, { useState, useEffect } from "react";
import { X, Sparkles, Image, Check, Plus } from "lucide-react";
import { RARITY_CONFIG } from "../auction/CharacterCard";

const PRESET_IMAGES = [
  { label: "Espadachín", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80" },
  { label: "Cibernético", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80" },
  { label: "Guerrera Neon", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80" },
  { label: "Mago Arcano", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" },
  { label: "Dragón de Fuego", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80" },
  { label: "Soldado Sci-Fi", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80" }
];

export default function CharacterFormModal({ isOpen, onClose, onSave, characterToEdit = null }) {
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState("SR");
  const [acceptance, setAcceptance] = useState(3);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (characterToEdit) {
        setName(characterToEdit.name || "");
        setRarity(characterToEdit.rarity || "SR");
        setAcceptance(characterToEdit.acceptance ?? 2);
        setImageUrl(characterToEdit.imageUrl || "");
        setDescription(characterToEdit.description || "");
      } else {
        setName("");
        setRarity("SR");
        setAcceptance(2);
        setImageUrl(PRESET_IMAGES[0].url);
        setDescription("");
      }
      setError("");
    }
  }, [isOpen, characterToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor ingresa un nombre para el personaje.");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Por favor especifica una URL de imagen.");
      return;
    }

    const payload = {
      id: characterToEdit?.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      rarity,
      acceptance: Math.max(0, parseInt(acceptance, 10) || 0),
      imageUrl: imageUrl.trim(),
      description: description.trim()
    };

    onSave(payload);
    onClose();
  };

  const rarities = ["R", "SR", "SSR", "UR", "LR"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-[8px_8px_0_#eab308] text-white">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400">
              {characterToEdit ? "EDITAR PERSONAJE" : "AGREGAR NUEVO PERSONAJE"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500 rounded-lg text-rose-300 text-xs font-['Chakra_Petch']">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1">
              Nombre del Personaje:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Valkyrie Omega"
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-sm text-white font-['Chakra_Petch'] font-semibold outline-none transition"
            />
          </div>

          {/* Rareza (R, SR, SSR, UR, LR con diseño visual) */}
          <div>
            <label className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
              Rareza del Personaje:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {rarities.map((r) => {
                const config = RARITY_CONFIG[r];
                const isSelected = rarity === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRarity(r)}
                    className={`py-2 px-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? `${config.badgeClass} ring-2 ring-yellow-400 scale-105 shadow-md` 
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span className="font-['Press_Start_2P'] text-xs uppercase">{r}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 font-['Chakra_Petch'] mt-1">
              R (Gris), SR (Dorado), SSR (Azul Arcoíris), UR (Morado Cósmico), LR (Plateado Vibrante con estrellas)
            </p>
          </div>

          {/* Aceptación (Rango de monedas mínimas) */}
          <div>
            <label className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1">
              Aceptación (Rango de Compra):
            </label>
            <input
              type="number"
              min="0"
              max="20"
              required
              value={acceptance}
              onChange={(e) => setAcceptance(e.target.value)}
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-sm text-yellow-300 font-['Press_Start_2P'] outline-none"
            />
            <p className="text-[10px] text-slate-400 font-['Chakra_Petch'] mt-1">
              Al salir en el sorteo, se generará un precio mínimo aleatorio entre 0 y este valor (ej. si colocas 4, saldrá entre 0 y 4. Si sale 3, no podrá comprarse por menos de 3 monedas).
            </p>
          </div>

          {/* URL de Imagen + Presets */}
          <div>
            <label className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1">
              URL de Imagen del Personaje:
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-xs font-mono text-cyan-300 outline-none"
            />

            {/* Galería rápida de imágenes preset */}
            <div className="mt-2">
              <span className="text-[10px] text-slate-400 font-['Chakra_Petch'] block mb-1">
                O elige una imagen rápida de demostración:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-['Chakra_Petch'] text-slate-300 border border-slate-600"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vista previa de imagen */}
          {imageUrl && (
            <div className="flex items-center gap-3 p-2 bg-black/50 border border-slate-700 rounded-xl">
              <img 
                src={imageUrl} 
                alt="Vista previa" 
                className="w-16 h-16 rounded-lg object-cover border border-yellow-400"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";
                }}
              />
              <div className="text-xs font-['Chakra_Petch'] text-slate-400">
                Vista previa del avatar que verán los jugadores.
              </div>
            </div>
          )}

          {/* Descripción opcional */}
          <div>
            <label className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1">
              Descripción o Lore (Opcional):
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Asesina veloz con ataques críticos"
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2 text-xs text-white font-['Chakra_Petch'] outline-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] transition"
            >
              {characterToEdit ? "Guardar Cambios" : "Crear Personaje"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Press_Start_2P'] text-xs rounded-xl border-2 border-slate-600 transition"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
