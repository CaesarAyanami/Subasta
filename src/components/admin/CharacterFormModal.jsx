import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Upload,
  Link2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Shield,
  Zap,
  Crown,
  Image as ImageIcon,
  Save,
  User,
  Wand2,
} from "lucide-react";
import { RARITY_CONFIG } from "../auction/CharacterCard";
import { uploadCharacterImage, validateImageFile } from "../../services/storageService";

// ============================================================================
// PRESETS DE IMÁGENES RÁPIDAS
// ============================================================================
const PRESET_IMAGES = [
  { label: "Espadachín", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80" },
  { label: "Cibernético", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80" },
  { label: "Guerrera Neon", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80" },
  { label: "Mago Arcano", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" },
  { label: "Dragón de Fuego", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80" },
  { label: "Soldado Sci-Fi", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80" },
];

const RARITIES = ["R", "SR", "SSR", "UR", "LR"];
const MAX_RACES = 3;
const MAX_TRAITS = 7;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";

// ============================================================================
// COMPONENTE
// ============================================================================
export default function CharacterFormModal({
  isOpen,
  onClose,
  onSave,
  characterToEdit = null,
  catalogs = { attributes: [], races: [], traits: [] },
}) {
  // --------------------------------------------------------------------------
  // ESTADO
  // --------------------------------------------------------------------------
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState("SR");
  const [acceptance, setAcceptance] = useState(3);
  const [description, setDescription] = useState("");
  const [attribute, setAttribute] = useState("Desconocido");
  const [races, setRaces] = useState([]);
  const [traits, setTraits] = useState([]);

  const [imageMode, setImageMode] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const closeButtonRef = useRef(null);

  const attributesList = catalogs?.attributes || [];
  const racesList = catalogs?.races || [];
  const traitsList = catalogs?.traits || [];

  // ==========================================================================
  // RESET AL ABRIR
  // ==========================================================================
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSubmitting(false);
    setImageFile(null);

    if (characterToEdit) {
      setName(characterToEdit.name || "");
      setRarity(characterToEdit.rarity || "SR");
      setAcceptance(characterToEdit.acceptance ?? 2);
      setDescription(characterToEdit.description || "");
      setAttribute(characterToEdit.attribute || "Desconocido");
      setRaces(Array.isArray(characterToEdit.races) ? characterToEdit.races : []);
      setTraits(Array.isArray(characterToEdit.traits) ? characterToEdit.traits : []);

      const existing = characterToEdit.image_url || characterToEdit.imageUrl || "";
      setImageUrl(existing);
      setImagePreview(existing);
      setImageMode("url");
    } else {
      setName("");
      setRarity("SR");
      setAcceptance(2);
      setDescription("");
      setAttribute("Desconocido");
      setRaces([]);
      setTraits([]);
      setImageUrl(PRESET_IMAGES[0].url);
      setImagePreview(PRESET_IMAGES[0].url);
      setImageMode("url");
    }
  }, [isOpen, characterToEdit]);

  // ==========================================================================
  // ESC + FOCUS + SCROLL LOCK
  // ==========================================================================
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === "Escape" && !submitting) onClose(); };
    document.addEventListener("keydown", handleEsc);
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, submitting]);

  // Cleanup del preview
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleFileSelect = (file) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setImageFile(file);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePresetClick = (url) => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImageUrl(url);
    setImagePreview(url);
    setImageMode("url");
  };

  const handleUrlChange = (url) => {
    setImageUrl(url);
    setImagePreview(url);
    if (imageFile) setImageFile(null);
  };

  const toggleRace = (race) => {
    setRaces((prev) => {
      if (prev.includes(race)) return prev.filter((r) => r !== race);
      if (prev.length >= MAX_RACES) {
        setError(`Máximo ${MAX_RACES} razas por personaje.`);
        setTimeout(() => setError(""), 2500);
        return prev;
      }
      return [...prev, race];
    });
  };

  const toggleTrait = (trait) => {
    setTraits((prev) => {
      if (prev.includes(trait)) return prev.filter((t) => t !== trait);
      if (prev.length >= MAX_TRAITS) {
        setError(`Máximo ${MAX_TRAITS} características por personaje.`);
        setTimeout(() => setError(""), 2500);
        return prev;
      }
      return [...prev, trait];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Por favor ingresa un nombre para el personaje.");
      return;
    }
    if (imageMode === "url" && !imageUrl.trim()) {
      setError("Por favor especifica una URL de imagen o sube un archivo.");
      return;
    }
    if (imageMode === "upload" && !imageFile) {
      setError("Por favor selecciona un archivo de imagen.");
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl.trim();
      if (imageMode === "upload" && imageFile) {
        const { publicUrl } = await uploadCharacterImage(imageFile, characterToEdit?.id || null);
        finalImageUrl = publicUrl;
      }

      const payload = {
        id: characterToEdit?.id || `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        rarity,
        acceptance: Math.max(0, parseInt(acceptance, 10) || 0),
        image_url: finalImageUrl,
        description: description.trim(),
        attribute,
        races,
        traits,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("[CharacterFormModal.submit]", err);
      setError(err.message || "No se pudo guardar el personaje.");
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-form-title"
            className="relative bg-gradient-to-b from-[#151928] to-[#0f1524] border-4 border-yellow-400 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-[8px_8px_0_#eab308] text-white"
          >
            {/* Glow decorativos */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

            {/* ─── Cabecera ─────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between border-b-2 border-yellow-400/40 p-4 sm:p-5">
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
                    id="character-form-title"
                    className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider drop-shadow-[1px_1px_0_#000]"
                  >
                    {characterToEdit ? "EDITAR PERSONAJE" : "NUEVO PERSONAJE"}
                  </h2>
                  <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">
                    {characterToEdit ? "Modifica los datos y guarda" : "Completa la información para agregar"}
                  </p>
                </div>
              </div>
              <motion.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                disabled={submitting}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cerrar formulario"
                className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
              >
                <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </motion.button>
            </div>

            {/* ─── Contenido scrolleable ────────────────────────────── */}
            <div className="relative overflow-y-auto max-h-[calc(92vh-140px)] p-4 sm:p-5">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    role="alert"
                    className="mb-4 p-3 bg-gradient-to-r from-rose-950/80 to-red-950/60 border-2 border-rose-500 rounded-xl text-rose-200 text-xs font-['Chakra_Petch'] flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ─── Nombre ──────────────────────────────────────── */}
                <FormSection icon={User} title="Identidad" color="yellow">
                  <label htmlFor="input-char-name" className="block text-[10px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
                    Nombre del Personaje:
                  </label>
                  <input
                    type="text"
                    id="input-char-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Valkyrie Omega"
                    maxLength={30}
                    className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm text-white font-['Chakra_Petch'] font-semibold outline-none transition focus:ring-2 focus:ring-yellow-400/40"
                  />
                </FormSection>

                {/* ─── Rareza + Aceptación ─────────────────────────── */}
                <FormSection icon={Crown} title="Categoría y Valor" color="fuchsia">
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-['Press_Start_2P'] text-slate-300 mb-2">
                        Rareza:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {RARITIES.map((r) => {
                          const config = RARITY_CONFIG[r];
                          const isSelected = rarity === r;
                          return (
                            <motion.button
                              key={r}
                              type="button"
                              onClick={() => setRarity(r)}
                              aria-pressed={isSelected}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`py-2.5 px-1 rounded-lg border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                                isSelected
                                  ? `${config.badgeClass} ring-2 ring-yellow-400 shadow-lg`
                                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                              }`}
                            >
                              <span className="font-['Press_Start_2P'] text-[10px] uppercase">{r}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="input-char-acceptance" className="block text-[10px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
                        Aceptación (0-7):
                      </label>
                      <input
                        type="number"
                        id="input-char-acceptance"
                        min="0"
                        max="7"
                        required
                        value={acceptance}
                        onChange={(e) => setAcceptance(e.target.value)}
                        className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm text-yellow-300 font-['Press_Start_2P'] outline-none focus:ring-2 focus:ring-yellow-400/40"
                      />
                    </div>
                  </div>
                </FormSection>

                {/* ─── Atributos Nanatsu ───────────────────────────── */}
                <FormSection icon={Shield} title="Atributos Especiales" color="purple">
                  <div className="space-y-4">
                    {/* Atributo */}
                    <div>
                      <label htmlFor="input-char-attribute" className="block text-[10px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
                        Atributo Principal:
                      </label>
                      <select
                        id="input-char-attribute"
                        value={attribute}
                        onChange={(e) => setAttribute(e.target.value)}
                        className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-purple-400 rounded-xl p-3 text-sm font-['Chakra_Petch'] text-white outline-none focus:ring-2 focus:ring-purple-400/40"
                      >
                        <option value="Desconocido">Desconocido</option>
                        {attributesList.map((a) => (
                          <option key={a.id} value={a.value}>{a.value}</option>
                        ))}
                      </select>
                      {attributesList.length === 0 && (
                        <p className="text-[10px] text-amber-300 font-['Chakra_Petch'] mt-1">
                          ⚠️ No hay atributos en el catálogo.
                        </p>
                      )}
                    </div>

                    {/* Razas */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-['Press_Start_2P'] text-slate-300">Razas:</label>
                        <span className={`text-[10px] font-['Chakra_Petch'] ${races.length >= MAX_RACES ? "text-rose-400" : "text-slate-500"}`}>
                          {races.length} / {MAX_RACES}
                        </span>
                      </div>
                      {racesList.length === 0 ? (
                        <p className="text-[10px] text-amber-300 font-['Chakra_Petch'] p-2 bg-black/40 rounded">
                          ⚠️ No hay razas en el catálogo.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {racesList.map((r) => {
                            const isActive = races.includes(r.value);
                            const isDisabled = !isActive && races.length >= MAX_RACES;
                            return (
                              <motion.button
                                key={r.id}
                                type="button"
                                onClick={() => !isDisabled && toggleRace(r.value)}
                                aria-pressed={isActive}
                                disabled={isDisabled}
                                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-['Chakra_Petch'] font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isActive
                                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-black shadow-[2px_2px_0_#000]"
                                    : "bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-400"
                                }`}
                              >
                                {isActive && "✓ "}{r.value}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Traits */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-['Press_Start_2P'] text-slate-300">Características:</label>
                        <span className={`text-[10px] font-['Chakra_Petch'] ${traits.length >= MAX_TRAITS ? "text-rose-400" : "text-slate-500"}`}>
                          {traits.length} / {MAX_TRAITS}
                        </span>
                      </div>
                      {traitsList.length === 0 ? (
                        <p className="text-[10px] text-amber-300 font-['Chakra_Petch'] p-2 bg-black/40 rounded">
                          ⚠️ No hay características en el catálogo.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-800 rounded-lg bg-black/20">
                          {traitsList.map((t) => {
                            const isActive = traits.includes(t.value);
                            const isDisabled = !isActive && traits.length >= MAX_TRAITS;
                            return (
                              <motion.button
                                key={t.id}
                                type="button"
                                onClick={() => !isDisabled && toggleTrait(t.value)}
                                aria-pressed={isActive}
                                disabled={isDisabled}
                                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-['Chakra_Petch'] font-bold border transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400 disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isActive
                                    ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white border-fuchsia-300 shadow-[1px_1px_0_#000]"
                                    : "bg-slate-800 border-slate-600 text-slate-300 hover:border-fuchsia-400"
                                }`}
                              >
                                {isActive && "✓ "}{t.value}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </FormSection>

                {/* ─── Imagen ──────────────────────────────────────── */}
                <FormSection icon={ImageIcon} title="Imagen del Personaje" color="cyan">
                  <div className="space-y-3">
                    {/* Toggle modo */}
                    <div role="tablist" aria-label="Modo de imagen" className="flex gap-2">
                      <motion.button
                        type="button"
                        role="tab"
                        aria-selected={imageMode === "url"}
                        onClick={() => setImageMode("url")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 font-['Chakra_Petch'] font-bold text-xs flex items-center justify-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                          imageMode === "url"
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-black shadow-[2px_2px_0_#000]"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                        URL
                      </motion.button>
                      <motion.button
                        type="button"
                        role="tab"
                        aria-selected={imageMode === "upload"}
                        onClick={() => setImageMode("upload")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 font-['Chakra_Petch'] font-bold text-xs flex items-center justify-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                          imageMode === "upload"
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black border-black shadow-[2px_2px_0_#000]"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                        SUBIR
                      </motion.button>
                    </div>

                    {/* Modo URL */}
                    <AnimatePresence mode="wait">
                      {imageMode === "url" && (
                        <motion.div
                          key="url-mode"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs font-mono text-cyan-300 outline-none focus:ring-2 focus:ring-cyan-400/40"
                          />
                          <div>
                            <span className="text-[10px] text-slate-400 font-['Chakra_Petch'] block mb-1">Presets rápidos:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_IMAGES.map((preset) => (
                                <motion.button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => handlePresetClick(preset.url)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-['Chakra_Petch'] text-slate-300 border border-slate-600 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                >
                                  {preset.label}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Modo Upload */}
                      {imageMode === "upload" && (
                        <motion.div
                          key="upload-mode"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {!imageFile ? (
                            <div
                              onDrop={handleDrop}
                              onDragOver={handleDragOver}
                              onClick={() => fileInputRef.current?.click()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  fileInputRef.current?.click();
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className="border-2 border-dashed border-slate-600 hover:border-emerald-400 rounded-xl p-6 text-center cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black/30 group"
                            >
                              <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-block mb-2"
                              >
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition" strokeWidth={2} aria-hidden="true" />
                              </motion.div>
                              <p className="text-xs font-['Chakra_Petch'] text-slate-300">
                                Arrastra o{" "}
                                <span className="text-emerald-400 font-bold">haz click para seleccionar</span>
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP o GIF — máx. 2 MB</p>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleFileInputChange}
                                className="hidden"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-black/50 border border-slate-700 rounded-xl gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                                <div className="min-w-0">
                                  <p className="text-xs font-['Chakra_Petch'] text-white truncate">{imageFile.name}</p>
                                  <p className="text-[10px] text-slate-400">{(imageFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <motion.button
                                type="button"
                                onClick={handleRemoveFile}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Quitar archivo"
                                className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Preview */}
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-3 bg-black/50 border border-slate-700 rounded-xl"
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-yellow-400 bg-slate-900 flex-shrink-0">
                          <img
                            src={imagePreview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-['Press_Start_2P'] text-yellow-400 mb-1">VISTA PREVIA</p>
                          <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">Así verán al personaje los jugadores.</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </FormSection>

                {/* ─── Descripción ─────────────────────────────────── */}
                <FormSection icon={Wand2} title="Descripción" color="slate">
                  <label htmlFor="input-char-description" className="block text-[10px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
                    Lore (Opcional):
                  </label>
                  <input
                    type="text"
                    id="input-char-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Asesina veloz con ataques críticos"
                    maxLength={120}
                    className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-xs text-white font-['Chakra_Petch'] outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                </FormSection>
              </form>
            </div>

            {/* ─── Footer (botones) ─────────────────────────────────── */}
            <div className="relative flex gap-3 p-4 sm:p-5 border-t-2 border-yellow-400/40 bg-black/30">
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Save className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                )}
                <span>
                  {submitting
                    ? imageMode === "upload" ? "SUBIENDO..." : "GUARDANDO..."
                    : characterToEdit ? "GUARDAR" : "CREAR"}
                </span>
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// SUB-COMPONENTE: FormSection
// ============================================================================
function FormSection({ icon: Icon, title, color, children }) {
  const palettes = {
    yellow: { border: "border-yellow-500/40", bg: "bg-yellow-950/10", icon: "text-yellow-400", title: "text-yellow-300" },
    fuchsia: { border: "border-fuchsia-500/40", bg: "bg-fuchsia-950/10", icon: "text-fuchsia-400", title: "text-fuchsia-300" },
    purple: { border: "border-purple-500/40", bg: "bg-purple-950/20", icon: "text-purple-400", title: "text-purple-300" },
    cyan: { border: "border-cyan-500/40", bg: "bg-cyan-950/10", icon: "text-cyan-400", title: "text-cyan-300" },
    slate: { border: "border-slate-600/40", bg: "bg-slate-900/20", icon: "text-slate-400", title: "text-slate-300" },
  }[color];

  return (
    <div className={`rounded-xl border-2 ${palettes.border} ${palettes.bg} p-3 sm:p-4`}>
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${palettes.border}`}>
        <Icon className={`w-4 h-4 ${palettes.icon}`} strokeWidth={2.5} aria-hidden="true" />
        <span className={`font-['Press_Start_2P'] text-[10px] ${palettes.title} uppercase tracking-wider`}>{title}</span>
      </div>
      {children}
    </div>
  );
}