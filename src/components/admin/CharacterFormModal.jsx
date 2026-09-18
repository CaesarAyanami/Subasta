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
}) {
  // --------------------------------------------------------------------------
  // ESTADO DEL FORM
  // --------------------------------------------------------------------------
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState("SR");
  const [acceptance, setAcceptance] = useState(3);
  const [description, setDescription] = useState("");

  // Imagen
  const [imageMode, setImageMode] = useState("url"); // 'url' | 'upload'
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); // URL local blob o URL externa

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const closeButtonRef = useRef(null);

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

      // Normalizar imagen existente
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
  // CLEANUP DEL PREVIEW (blob URLs)
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

    // Generar preview local
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
    if (imageFile) {
      // Si estabas en modo upload, al cambiar la URL pasamos a modo URL
      setImageFile(null);
    }
  };

  // ==========================================================================
  // SUBMIT
  // ==========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar nombre
    if (!name.trim()) {
      setError("Por favor ingresa un nombre para el personaje.");
      return;
    }

    // Validar imagen
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

      // Subir archivo si estamos en modo upload
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
        className="bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-[8px_8px_0_#eab308] text-white"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles
              className="w-5 h-5 text-yellow-400"
              aria-hidden="true"
            />
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
            id="btn-close-character-form"
            name="btn-close-character-form"
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
              name="input-char-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Valkyrie Omega"
              maxLength={30}
              aria-invalid={!!error && !name.trim()}
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-sm text-white font-['Chakra_Petch'] font-semibold outline-none transition focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>

          {/* Rareza */}
          <div>
            <span
              id="rarity-label"
              className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1.5"
            >
              Rareza del Personaje:
            </span>
            <div
              role="radiogroup"
              aria-labelledby="rarity-label"
              className="grid grid-cols-5 gap-2"
            >
              {RARITIES.map((r) => {
                const config = RARITY_CONFIG[r];
                const isSelected = rarity === r;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Rareza ${r}`}
                    onClick={() => setRarity(r)}
                    className={`py-2 px-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                      isSelected
                        ? `${config.badgeClass} ring-2 ring-yellow-400 scale-105 shadow-md`
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span className="font-['Press_Start_2P'] text-xs uppercase">
                      {r}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 font-['Chakra_Petch'] mt-1">
              R (Gris), SR (Dorado), SSR (Azul Arcoíris), UR (Morado Cósmico),
              LR (Plateado Vibrante)
            </p>
          </div>

          {/* Aceptación */}
          <div>
            <label
              htmlFor="input-char-acceptance"
              className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1"
            >
              Aceptación (Rango de Compra):
            </label>
            <input
              type="number"
              id="input-char-acceptance"
              name="input-char-acceptance"
              min="0"
              max="20"
              required
              value={acceptance}
              onChange={(e) => setAcceptance(e.target.value)}
              className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-sm text-yellow-300 font-['Press_Start_2P'] outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
            <p className="text-[10px] text-slate-400 font-['Chakra_Petch'] mt-1">
              Al salir en el sorteo, se genera un precio mínimo aleatorio entre 0
              y este valor.
            </p>
          </div>

          {/* Imagen — selector URL / Subir */}
          <div>
            <span className="block text-[11px] font-['Press_Start_2P'] text-slate-300 mb-1.5">
              Imagen del Personaje:
            </span>

            {/* Toggle de modo */}
            <div
              role="tablist"
              aria-label="Modo de imagen"
              className="flex gap-2 mb-2"
            >
              <button
                type="button"
                role="tab"
                id="tab-image-url"
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
                id="tab-image-upload"
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

            {/* Modo URL */}
            {imageMode === "url" && (
              <>
                <input
                  type="url"
                  id="input-char-image-url"
                  name="input-char-image-url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-2.5 text-xs font-mono text-cyan-300 outline-none focus:ring-2 focus:ring-cyan-400/40"
                />

                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-['Chakra_Petch'] block mb-1">
                    O elige una imagen rápida de demostración:
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

            {/* Modo Upload */}
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
                    aria-label="Arrastra una imagen o haz click para seleccionar"
                    className="border-2 border-dashed border-slate-600 hover:border-emerald-400 rounded-xl p-6 text-center cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black/30"
                  >
                    <Upload
                      className="w-8 h-8 mx-auto text-slate-400 mb-2"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-['Chakra_Petch'] text-slate-300">
                      Arrastra una imagen o{" "}
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
                      id="input-char-image-file"
                      name="input-char-image-file"
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
                      id="btn-remove-file"
                      name="btn-remove-file"
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

            {/* Preview */}
            {imagePreview && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-black/50 border border-slate-700 rounded-xl">
                <img
                  src={imagePreview}
                  alt="Vista previa del avatar"
                  className="w-16 h-16 rounded-lg object-cover border border-yellow-400 bg-slate-900"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                <div className="text-xs font-['Chakra_Petch'] text-slate-400">
                  Vista previa del avatar que verán los jugadores.
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
              name="input-char-description"
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
              id="btn-save-character"
              name="btn-save-character"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && (
                <Loader2
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                />
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
              id="btn-cancel-character"
              name="btn-cancel-character"
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