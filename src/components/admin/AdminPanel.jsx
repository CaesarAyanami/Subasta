import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Settings,
  Sparkles,
  Clock,
  Coins,
  Film,
  Download,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import CharacterFormModal from "./CharacterFormModal";
import { RARITY_CONFIG } from "../auction/CharacterCard";
import sounds from "../../services/soundEffects";

export default function AdminPanel({
  settings,
  characterPool,
  onUpdateSettings,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onResetDatabase,
  onSeedDefaultCharacters,
  showToast,
}) {
  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("characters");

  // Settings (form)
  const [initialCoins, setInitialCoins] = useState(settings?.initialCoins ?? 20);
  const [auctionTime, setAuctionTime] = useState(settings?.auctionTime ?? 20);
  const [animationType, setAnimationType] = useState(
    settings?.animationType || "roulette"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Loading
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ==========================================================================
  // SINCRONIZAR SETTINGS SI CAMBIAN DESDE FUERA
  // ==========================================================================
  useEffect(() => {
    setInitialCoins(settings?.initialCoins ?? 20);
    setAuctionTime(settings?.auctionTime ?? 20);
    setAnimationType(settings?.animationType || "roulette");
  }, [
    settings?.initialCoins,
    settings?.auctionTime,
    settings?.animationType,
  ]);

  // ==========================================================================
  // DATOS DERIVADOS
  // ==========================================================================
  const available = characterPool?.available || [];
  const used = characterPool?.used || [];
  const discarded = characterPool?.discarded || [];
  const totalCharacters = available.length + used.length + discarded.length;

  // ==========================================================================
  // HANDLERS — MODAL
  // ==========================================================================
  const handleOpenAddModal = () => {
    sounds.playClick();
    setEditingCharacter(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (char) => {
    sounds.playClick();
    setEditingCharacter(char);
    setModalOpen(true);
  };

  const handleSaveCharacter = async (char) => {
    try {
      if (editingCharacter) {
        await onEditCharacter(editingCharacter.id, char);
        showToast?.("PERSONAJE EDITADO", `${char.name} actualizado`, "info", 2500);
      } else {
        await onAddCharacter(char);
        showToast?.("PERSONAJE CREADO", `${char.name} añadido al pool`, "sparkles", 2500);
      }
      setModalOpen(false);
      setEditingCharacter(null);
    } catch (err) {
      console.error("[AdminPanel.handleSaveCharacter]", err);
      showToast?.("ERROR", err.message || "No se pudo guardar", "warning", 3500);
    }
  };

  const handleDelete = async (char) => {
    sounds.playDiscard();
    setDeletingId(char.id);
    try {
      await onDeleteCharacter(char.id);
      showToast?.("PERSONAJE ELIMINADO", `${char.name} eliminado`, "warning", 2000);
    } catch (err) {
      console.error("[AdminPanel.handleDelete]", err);
      showToast?.("ERROR", err.message || "No se pudo eliminar", "warning", 3500);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================================
  // HANDLERS — SETTINGS
  // ==========================================================================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        initialCoins: Math.max(1, parseInt(initialCoins, 10) || 20),
        auctionTime: Math.max(5, parseInt(auctionTime, 10) || 20),
        animationType,
      });
      setSavedSuccess(true);
      showToast?.("AJUSTES GUARDADOS", "Configuración sincronizada", "sparkles", 2000);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error("[AdminPanel.handleSaveSettings]", err);
      showToast?.("ERROR", err.message || "No se pudieron guardar los ajustes", "warning", 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================================================
  // HANDLERS — SEED / WIPE
  // ==========================================================================
  const handleSeed = async () => {
    sounds.playVictory();
    setIsSeeding(true);
    try {
      await onSeedDefaultCharacters();
      showToast?.("SEED CARGADO", "Personajes por defecto cargados", "sparkles", 2500);
    } catch (err) {
      console.error("[AdminPanel.handleSeed]", err);
      showToast?.("ERROR", err.message || "No se pudo cargar el seed", "warning", 3500);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCleanDb = async () => {
    sounds.playDiscard();
    setShowCleanConfirm(false);
    setIsWiping(true);
    try {
      await onResetDatabase();
      showToast?.("BASE DE DATOS LIMPIA", "Todos los personajes fueron eliminados", "warning", 3000);
    } catch (err) {
      console.error("[AdminPanel.handleCleanDb]", err);
      showToast?.("ERROR", err.message || "No se pudo limpiar", "warning", 3500);
    } finally {
      setIsWiping(false);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Botón regresar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-['Press_Start_2P'] text-xs rounded-xl border-2 border-slate-600 shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Volver al tablero principal"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>← Volver al Tablero</span>
        </a>
        <span className="text-[11px] font-mono text-slate-500 bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800">
          Ruta: /admin
        </span>
      </div>

      {/* Cabecera */}
      <div className="bg-[#151928] border-4 border-cyan-400 rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#0891b2] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            <h1 className="font-['Press_Start_2P'] text-sm sm:text-lg text-cyan-400">
              PANEL ADMINISTRADOR
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-['Chakra_Petch'] text-slate-300">
            Gestión completa del pool de personajes, reglas de subasta y
            animaciones de gacha.
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Secciones del panel"
          className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-slate-700"
        >
          <button
            type="button"
            role="tab"
            id="admin-tab-characters"
            name="admin-tab-characters"
            aria-selected={activeTab === "characters"}
            onClick={() => setActiveTab("characters")}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Press_Start_2P'] transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              activeTab === "characters"
                ? "bg-cyan-400 text-black shadow-[2px_2px_0_#000]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Personajes ({totalCharacters})
          </button>
          <button
            type="button"
            role="tab"
            id="admin-tab-settings"
            name="admin-tab-settings"
            aria-selected={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Press_Start_2P'] transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              activeTab === "settings"
                ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Ajustes
          </button>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          id="btn-admin-add"
          name="btn-admin-add"
          onClick={handleOpenAddModal}
          className="p-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] text-black font-['Press_Start_2P'] text-xs flex items-center justify-center gap-2 transition active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>AGREGAR PERSONAJE</span>
        </button>

        <button
          type="button"
          id="btn-admin-seed"
          name="btn-admin-seed"
          onClick={handleSeed}
          disabled={isSeeding}
          title="Carga 12 personajes preparados con diferentes rarezas para probar"
          aria-label="Cargar 12 personajes de ejemplo"
          className="p-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] text-black font-['Press_Start_2P'] text-xs flex items-center justify-center gap-2 transition active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSeeding ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-4 h-4" aria-hidden="true" />
          )}
          <span>{isSeeding ? "CARGANDO..." : "CARGAR SEED"}</span>
        </button>

        {showCleanConfirm ? (
          <div
            className="flex gap-2"
            role="alertdialog"
            aria-label="Confirmar limpieza total"
          >
            <button
              type="button"
              id="btn-admin-confirm-wipe"
              name="btn-admin-confirm-wipe"
              onClick={handleCleanDb}
              disabled={isWiping}
              className="flex-1 p-3 bg-rose-600 hover:bg-rose-500 rounded-xl border-4 border-black text-white font-['Press_Start_2P'] text-[10px] shadow-[3px_3px_0_#000] focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60"
            >
              {isWiping ? "BORRANDO..." : "¿BORRAR TODO?"}
            </button>
            <button
              type="button"
              id="btn-admin-cancel-wipe"
              name="btn-admin-cancel-wipe"
              onClick={() => setShowCleanConfirm(false)}
              className="px-3 bg-slate-800 rounded-xl border-2 border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="btn-admin-wipe"
            name="btn-admin-wipe"
            onClick={() => setShowCleanConfirm(true)}
            className="p-3.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] text-white font-['Press_Start_2P'] text-xs flex items-center justify-center gap-2 transition active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <Trash2 className="w-4 h-4 text-yellow-300" aria-hidden="true" />
            <span>LIMPIAR DB</span>
          </button>
        )}
      </div>

      {/* TAB: PERSONAJES */}
      {activeTab === "characters" && (
        <div className="bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
            <div>
              <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400">
                POOL DE PERSONAJES ({available.length} DISPONIBLES)
              </h2>
              <p className="text-xs text-slate-400 font-['Chakra_Petch']">
                Total cargados: {totalCharacters} | Usados: {used.length} |
                Desechados: {discarded.length}
              </p>
            </div>

            <button
              type="button"
              id="btn-admin-new"
              name="btn-admin-new"
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-['Press_Start_2P'] rounded-lg border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nuevo</span>
            </button>
          </div>

          {available.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-black/30">
              <AlertTriangle
                className="w-10 h-10 text-yellow-400 mx-auto mb-2 opacity-60"
                aria-hidden="true"
              />
              <p className="font-['Press_Start_2P'] text-xs text-slate-400 mb-3">
                No hay personajes disponibles en el pool activo.
              </p>
              <button
                type="button"
                id="btn-admin-seed-empty"
                name="btn-admin-seed-empty"
                onClick={handleSeed}
                disabled={isSeeding}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] focus:outline-none focus:ring-2 focus:ring-cyan-200 disabled:opacity-60"
              >
                {isSeeding ? "Cargando..." : "Cargar Personajes Iniciales"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {available.map((char) => {
                const config = RARITY_CONFIG[char.rarity || "R"];
                const imgSrc = char.image_url || char.imageUrl || "";
                return (
                  <div
                    key={char.id}
                    className={`rounded-xl border-2 ${config.cardBorder} ${config.cardBg} p-3 flex flex-col justify-between gap-2 shadow-[2px_2px_0_#000]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-black/60 flex-shrink-0 bg-black">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={char.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-['Press_Start_2P'] ${config.badgeClass}`}
                          >
                            {config.label}
                          </span>
                          <span className="text-[10px] font-['Chakra_Petch'] text-slate-300 font-bold">
                            Acept: 0-{char.acceptance}
                          </span>
                        </div>
                        <h4 className="font-['Press_Start_2P'] text-xs text-white truncate drop-shadow-[1px_1px_0_#000]">
                          {char.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-700/60 pt-2">
                      <button
                        type="button"
                        id={`btn-edit-${char.id}`}
                        name={`btn-edit-${char.id}`}
                        onClick={() => handleOpenEditModal(char)}
                        aria-label={`Editar ${char.name}`}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        <Edit className="w-3 h-3" aria-hidden="true" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        id={`btn-delete-${char.id}`}
                        name={`btn-delete-${char.id}`}
                        onClick={() => handleDelete(char)}
                        disabled={deletingId === char.id}
                        aria-label={`Eliminar ${char.name}`}
                        className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1 border border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
                      >
                        {deletingId === char.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: AJUSTES */}
      {activeTab === "settings" && (
        <div className="bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000]">
          <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 mb-4 border-b-2 border-slate-800 pb-3">
            CONFIGURACIÓN GENERAL DEL JUEGO
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
            {/* Monedas iniciales */}
            <div>
              <label
                htmlFor="input-initial-coins"
                className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-1.5"
              >
                <Coins className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                <span>Monedas Iniciales por Jugador:</span>
              </label>
              <input
                type="number"
                id="input-initial-coins"
                name="input-initial-coins"
                min="5"
                max="999"
                value={initialCoins}
                onChange={(e) => setInitialCoins(e.target.value)}
                className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm font-['Press_Start_2P'] text-yellow-400 outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
              <p className="text-xs text-slate-400 font-['Chakra_Petch'] mt-1">
                Por defecto: 20 monedas. Al reiniciar o cambiar de ronda, los
                jugadores vuelven a este saldo.
              </p>
            </div>

            {/* Tiempo */}
            <div>
              <label
                htmlFor="input-auction-time"
                className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-1.5"
              >
                <Clock className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>Tiempo de la Subasta (Segundos):</span>
              </label>
              <input
                type="number"
                id="input-auction-time"
                name="input-auction-time"
                min="5"
                max="120"
                value={auctionTime}
                onChange={(e) => setAuctionTime(e.target.value)}
                className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm font-['Press_Start_2P'] text-cyan-400 outline-none focus:ring-2 focus:ring-cyan-400/40"
              />
              <p className="text-xs text-slate-400 font-['Chakra_Petch'] mt-1">
                Por defecto: 20 segundos. Tiempo del cronómetro de pujas.
              </p>
            </div>

            {/* Animación */}
            <div>
              <span className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-2">
                <Film className="w-4 h-4 text-purple-400" aria-hidden="true" />
                <span>Estilo de Animación del Sorteo (Gacha):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "roulette",
                    color: "yellow",
                    title: "[ RULETA ]",
                    desc: "Cinta horizontal rápida con freno gradual y marcador superior.",
                  },
                  {
                    id: "slot",
                    color: "cyan",
                    title: "[ SLOT MACHINE ]",
                    desc: "Carrete vertical estilo tragamonedas arcade con parada seca.",
                  },
                  {
                    id: "card_flip",
                    color: "fuchsia",
                    title: "[ CARTA 3D ]",
                    desc: "Giro 3D en suspenso con cambio de aura y revelación estelar.",
                  },
                ].map((opt) => {
                  const isSelected = animationType === opt.id;
                  const palette = {
                    yellow: {
                      title: "text-yellow-300",
                      selected:
                        "bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400/50",
                    },
                    cyan: {
                      title: "text-cyan-300",
                      selected:
                        "bg-cyan-400/20 border-cyan-400 ring-2 ring-cyan-400/50",
                    },
                    fuchsia: {
                      title: "text-fuchsia-300",
                      selected:
                        "bg-fuchsia-400/20 border-fuchsia-400 ring-2 ring-fuchsia-400/50",
                    },
                  }[opt.color];

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      id={`btn-anim-${opt.id}`}
                      name={`btn-anim-${opt.id}`}
                      onClick={() => {
                        sounds.playClick();
                        setAnimationType(opt.id);
                      }}
                      aria-pressed={isSelected}
                      aria-label={`Seleccionar animación ${opt.title}`}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition text-left focus:outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                        isSelected
                          ? palette.selected
                          : "bg-black/40 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <div
                        className={`font-['Press_Start_2P'] text-[10px] mb-1 ${palette.title}`}
                      >
                        {opt.title}
                      </div>
                      <div className="text-xs font-['Chakra_Petch'] text-slate-300">
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {savedSuccess && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-['Chakra_Petch'] font-bold flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>¡Ajustes guardados y sincronizados exitosamente!</span>
              </div>
            )}

            <button
              type="submit"
              id="btn-admin-save-settings"
              name="btn-admin-save-settings"
              disabled={isSaving}
              className="py-3 px-6 bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[4px_4px_0_#000] transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>{isSaving ? "Guardando..." : "Guardar Ajustes"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal crear/editar */}
      <CharacterFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCharacter(null);
        }}
        characterToEdit={editingCharacter}
        onSave={handleSaveCharacter}
      />
    </div>
  );
}