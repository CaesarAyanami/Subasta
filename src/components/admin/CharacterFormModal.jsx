import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { RARITY_CONFIG } from "../auction/CharacterCard";
import { uploadCharacterImage, validateImageFile } from "../../services/storageService";

// ============================================================================
// PRESETS DE IMÁGENES RÁPIDAS
// ============================================================================
const PRESET_IMAGES = [
  {
    label: "Espadachín",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Cibernético",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Guerrera Neon",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Mago Arcano",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Dragón de Fuego",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Soldado Sci-Fi",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
  },
];

const RARITIES = ["R", "SR", "SSR", "UR", "LR"];
const MAX_RACES = 3;
const MAX_TRAITS = 7;
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";

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
  // ESTADO DEL FORM
  // --------------------------------------------------------------------------
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState("SR");
  const [acceptance, setAcceptance] = useState(3);
  const [description, setDescription] = useState("");

  // ⚠️ NUEVOS CAMPOS #8
  const [attribute, setAttribute] = useState("Desconocido");
  const [races, setRaces] = useState([]); // array de strings
  const [traits, setTraits] = useState([]); // array de strings

  // Imagen
  const [imageMode, setImageMode] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Catálogos
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
      setTraits(
        Array.isArray(characterToEdit.traits) ? characterToEdit.traits : []
      );

      const existing =
        characterToEdit.image_url || characterToEdit.imageUrl || "";
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

    const handleEsc = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, submitting]);

  // ==========================================================================
  // CLEANUP DEL PREVIEW
  // ==========================================================================
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  // ==========================================================================
  // HANDLERS DE IMAGEN
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
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
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
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePresetClick = (url) => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
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

  // ==========================================================================
  // HANDLERS DE RAZAS / TRAITS
  // ==========================================================================
  const toggleRace = (race) => {
    setRaces((prev) => {
      if (prev.includes(race)) {
        return prev.filter((r) => r !== race);
      }
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
      if (prev.includes(trait)) {
        return prev.filter((t) => t !== trait);
      }
      if (prev.length >= MAX_TRAITS) {
        setError(`Máximo ${MAX_TRAITS} características por personaje.`);
        setTimeout(() => setError(""), 2500);
        return prev;
      }
      return [...prev, trait];
    });
  };

  // ==========================================================================
  // SUBMIT
  // ==========================================================================
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
        const { publicUrl } = await uploadCharacterImage(
          imageFile,
          characterToEdit?.id || null
        );
        finalImageUrl = publicUrl;
      }

      const payload = {
        id:
          characterToEdit?.id ||
          `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        rarity,
        acceptance: Math.max(0, parseInt(acceptance, 10) || 0),
        image_url: finalImageUrl,
        description: description.trim(),
        // ⚠️ NUEVOS CAMPOS
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-form-title"
        className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-[8px_8px_0_#eab308] text-white"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            <h2
              id="character-form-title"
              className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400"
            >
              {characterToEdit ? "EDITAR PERSONAJE" : "AGREGAR NUEVO PERSONAJE"}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar formulario"
            className="p-1 text-slate-400 hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500 rounded-lg text-rose-300 text-xs font-['Chakra_Petch'] flex items-start gap-2"
          >
            <AlertCircle
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label
              htmlFor="input-char-name"
              className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1"
            >
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
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-sm text-white font-['Chakra_Petch'] font-semibold outline-none transition focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>

          {/* Rareza + Aceptación en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
                Rareza:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {RARITIES.map((r) => {
                  const config = RARITY_CONFIG[r];
                  const isSelected = rarity === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRarity(r)}
                      aria-pressed={isSelected}
                      className={`py-2 px-1 rounded-lg border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                        isSelected
                          ? `${config.badgeClass} ring-2 ring-yellow-400 scale-105`
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <span className="font-['Press_Start_2P'] text-[10px] uppercase">
                        {r}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="input-char-acceptance"
                className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1"
              >
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
                className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-sm text-yellow-300 font-['Press_Start_2P'] outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
            </div>
          </div>

          {/* ================================================================
              NUEVOS CAMPOS #8: Atributo / Razas / Características
              ================================================================ */}
          <div className="p-3 bg-purple-950/30 border-2 border-purple-700/60 rounded-xl space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span className="font-['Press_Start_2P'] text-[10px] text-purple-300 uppercase">
                Atributos del Personaje
              </span>
            </div>

            {/* Atributo (select) */}
            <div>
              <label
                htmlFor="input-char-attribute"
                className="block text-[10px] font-['Press_Start_2P'] text-slate-300 mb-1"
              >
                Atributo Principal:
              </label>
              <select
                id="input-char-attribute"
                value={attribute}
                onChange={(e) => setAttribute(e.target.value)}
                className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-purple-400 rounded-xl p-2.5 text-sm font-['Chakra_Petch'] text-white outline-none focus:ring-2 focus:ring-purple-400/40"
              >
                <option value="Desconocido">Desconocido</option>
                {attributesList.map((a) => (
                  <option key={a.id} value={a.value}>
                    {a.value}
                  </option>
                ))}
              </select>
              {attributesList.length === 0 && (
                <p className="text-[10px] text-amber-300 font-['Chakra_Petch'] mt-1">
                  ⚠️ No hay atributos en el catálogo. Añádelos desde el admin.
                </p>
              )}
            </div>

            {/* Razas (multi-select con chips) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-['Press_Start_2P'] text-slate-300">
                  Razas:
                </label>
                <span className="text-[10px] font-['Chakra_Petch'] text-slate-500">
                  {races.length} / {MAX_RACES}
                </span>
              </div>
              {racesList.length === 0 ? (
                <p className="text-[10px] text-amber-300 font-['Chakra_Petch'] p-2 bg-black/40 rounded">
                  ⚠️ No hay razas en el catálogo. Añádelas desde el admin.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {racesList.map((r) => {
                    const isActive = races.includes(r.value);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRace(r.value)}
                        aria-pressed={isActive}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-['Chakra_Petch'] font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                          isActive
                            ? "bg-cyan-400 text-black border-black shadow-[2px_2px_0_#000]"
                            : "bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-400"
                        }`}
                      >
                        {r.value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Traits (multi-select con chips) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-['Press_Start_2P'] text-slate-300">
                  Características:
                </label>
                <span className="text-[10px] font-['Chakra_Petch'] text-slate-500">
                  {traits.length} / {MAX_TRAITS}
                </span>
              </div>
              {traitsList.length === 0 ? (
                <p className="text-[10px] text-amber-300 font-['Chakra_Petch'] p-2 bg-black/40 rounded">
                  ⚠️ No hay características en el catálogo. Añádelas desde el
                  admin.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {traitsList.map((t) => {
                    const isActive = traits.includes(t.value);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTrait(t.value)}
                        aria-pressed={isActive}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-['Chakra_Petch'] font-bold border transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                          isActive
                            ? "bg-fuchsia-500 text-white border-fuchsia-300"
                            : "bg-slate-800 border-slate-600 text-slate-300 hover:border-fuchsia-400"
                        }`}
                      >
                        {t.value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Imagen — selector URL / Subir */}
          <div>
            <span className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
              Imagen del Personaje:
            </span>

            <div
              role="tablist"
              aria-label="Modo de imagen"
              className="flex gap-2 mb-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={imageMode === "url"}
                onClick={() => setImageMode("url")}
                className={`flex-1 py-1.5 px-3 rounded-lg border-2 font-['Chakra_Petch'] font-bold text-xs flex items-center justify-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  imageMode === "url"
                    ? "bg-cyan-400 text-black border-black shadow-[2px_2px_0_#000]"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                URL
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={imageMode === "upload"}
                onClick={() => setImageMode("upload")}
                className={`flex-1 py-1.5 px-3 rounded-lg border-2 font-['Chakra_Petch'] font-bold text-xs flex items-center justify-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  imageMode === "upload"
                    ? "bg-emerald-400 text-black border-black shadow-[2px_2px_0_#000]"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                SUBIR ARCHIVO
              </button>
            </div>

            {imageMode === "url" && (
              <>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-xs font-mono text-cyan-300 outline-none focus:ring-2 focus:ring-cyan-400/40"
                />

                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-['Chakra_Petch'] block mb-1">
                    O elige una imagen rápida:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset.url)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-['Chakra_Petch'] text-slate-300 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {imageMode === "upload" && (
              <>
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
                    className="border-2 border-dashed border-slate-600 hover:border-emerald-400 rounded-xl p-6 text-center cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black/30"
                  >
                    <Upload
                      className="w-8 h-8 mx-auto text-slate-400 mb-2"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-['Chakra_Petch'] text-slate-300">
                      Arrastra o{" "}
                      <span className="text-emerald-400 font-bold">
                        haz click para seleccionar
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      PNG, JPG, WEBP o GIF — máx. 2 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-black/50 border border-slate-700 rounded-xl gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-['Chakra_Petch'] text-white truncate">
                          {imageFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(imageFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label="Quitar archivo seleccionado"
                      className="p-1.5 rounded hover:bg-white/10 text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}

            {imagePreview && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-black/50 border border-slate-700 rounded-xl">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-16 h-16 rounded-lg object-cover border border-yellow-400 bg-slate-900"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                <div className="text-xs font-['Chakra_Petch'] text-slate-400">
                  Vista previa del avatar.
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="input-char-description"
              className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1"
            >
              Descripción o Lore (Opcional):
            </label>
            <input
              type="text"
              id="input-char-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Asesina veloz con ataques críticos"
              maxLength={120}
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2 text-xs text-white font-['Chakra_Petch'] outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              )}
              <span>
                {submitting
                  ? imageMode === "upload"
                    ? "SUBIENDO..."
                    : "GUARDANDO..."
                  : characterToEdit
                  ? "Guardar Cambios"
                  : "Crear Personaje"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Press_Start_2P'] text-xs rounded-xl border-2 border-slate-600 transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}