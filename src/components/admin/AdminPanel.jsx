import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  RotateCcw,
  X,
  Package,
  Tag,
  Crown,
  Zap,
  Flame,
  Shield,
  Users,
  Database,
  Save,
  Eye,
} from "lucide-react";
import CharacterFormModal from "./CharacterFormModal";
import { RARITY_CONFIG } from "../auction/CharacterCard";
import sounds from "../../services/soundEffects";

// ============================================================================
// CONSTANTES
// ============================================================================
const ALL_RARITIES = ["R", "SR", "SSR", "UR", "LR"];

const CATALOG_TABS = [
  {
    id: "attribute",
    label: "Atributos",
    icon: Zap,
    color: "yellow",
    bg: "from-yellow-500 to-amber-600",
  },
  {
    id: "race",
    label: "Razas",
    icon: Users,
    color: "cyan",
    bg: "from-cyan-400 to-blue-500",
  },
  {
    id: "trait",
    label: "Características",
    icon: Crown,
    color: "fuchsia",
    bg: "from-fuchsia-500 to-purple-600",
  },
];

// ============================================================================
// COMPONENTE
// ============================================================================
export default function AdminPanel({
  settings,
  characterPool,
  catalogs,
  onUpdateSettings,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onResetDatabase,
  onSeedDefaultCharacters,
  onAdminReset,
  onAddCatalogItem,
  onRemoveCatalogItem,
  showToast,
}) {
  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("characters");

  // Settings
  const [initialCoins, setInitialCoins] = useState(settings?.initialCoins ?? 20);
  const [auctionTime, setAuctionTime] = useState(settings?.auctionTime ?? 20);
  const [maxAuctionsPerRound, setMaxAuctionsPerRound] = useState(
    settings?.maxAuctionsPerRound ?? 20
  );
  const [animationType, setAnimationType] = useState(
    settings?.animationType || "roulette"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Loading
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState([]);
  const [minAcceptance, setMinAcceptance] = useState("");
  const [maxAcceptance, setMaxAcceptance] = useState("");
  const [attributeFilter, setAttributeFilter] = useState("");
  const [raceFilter, setRaceFilter] = useState("");
  const [traitFilter, setTraitFilter] = useState("");

  // Catálogos
  const [newCatalogValue, setNewCatalogValue] = useState("");
  const [catalogSubTab, setCatalogSubTab] = useState("attribute");

  // ==========================================================================
  // SINCRONIZAR SETTINGS
  // ==========================================================================
  useEffect(() => {
    setInitialCoins(settings?.initialCoins ?? 20);
    setAuctionTime(settings?.auctionTime ?? 20);
    setMaxAuctionsPerRound(settings?.maxAuctionsPerRound ?? 20);
    setAnimationType(settings?.animationType || "roulette");
  }, [
    settings?.initialCoins,
    settings?.auctionTime,
    settings?.maxAuctionsPerRound,
    settings?.animationType,
  ]);

  // ==========================================================================
  // DATOS DERIVADOS
  // ==========================================================================
  const available = characterPool?.available || [];
  const used = characterPool?.used || [];
  const discarded = characterPool?.discarded || [];
  const totalCharacters = available.length + used.length + discarded.length;

  const attributesList = catalogs?.attributes || [];
  const racesList = catalogs?.races || [];
  const traitsList = catalogs?.traits || [];

  // ==========================================================================
  // FILTRADO
  // ==========================================================================
  const filteredAvailable = useMemo(() => {
    let result = available;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((c) => c.name?.toLowerCase().includes(q));
    }

    if (rarityFilter.length > 0) {
      result = result.filter((c) => rarityFilter.includes(c.rarity));
    }

    const min = parseInt(minAcceptance, 10);
    const max = parseInt(maxAcceptance, 10);
    if (!isNaN(min)) result = result.filter((c) => (c.acceptance ?? 0) >= min);
    if (!isNaN(max)) result = result.filter((c) => (c.acceptance ?? 0) <= max);

    if (attributeFilter) result = result.filter((c) => c.attribute === attributeFilter);
    if (raceFilter) result = result.filter((c) => Array.isArray(c.races) && c.races.includes(raceFilter));
    if (traitFilter) result = result.filter((c) => Array.isArray(c.traits) && c.traits.includes(traitFilter));

    return result;
  }, [
    available,
    searchQuery,
    rarityFilter,
    minAcceptance,
    maxAcceptance,
    attributeFilter,
    raceFilter,
    traitFilter,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    rarityFilter.length > 0 ||
    minAcceptance !== "" ||
    maxAcceptance !== "" ||
    attributeFilter !== "" ||
    raceFilter !== "" ||
    traitFilter !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setRarityFilter([]);
    setMinAcceptance("");
    setMaxAcceptance("");
    setAttributeFilter("");
    setRaceFilter("");
    setTraitFilter("");
    sounds.playClick();
  };

  const toggleRarity = (rarity) => {
    sounds.playClick();
    setRarityFilter((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity]
    );
  };

  // ==========================================================================
  // HANDLERS
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

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        initialCoins: Math.max(1, parseInt(initialCoins, 10) || 20),
        auctionTime: Math.max(5, parseInt(auctionTime, 10) || 20),
        maxAuctionsPerRound: Math.max(1, Math.min(200, parseInt(maxAuctionsPerRound, 10) || 20)),
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

  const handleAdminReset = async () => {
    sounds.playVictory();
    setShowResetConfirm(false);
    setIsResetting(true);
    try {
      await onAdminReset();
    } catch (err) {
      console.error("[AdminPanel.handleAdminReset]", err);
      showToast?.("ERROR", err.message || "No se pudo resetear", "warning", 3500);
    } finally {
      setIsResetting(false);
    }
  };

  const handleAddCatalogItem = async () => {
    const value = newCatalogValue.trim();
    if (!value) return;
    sounds.playClick();
    try {
      await onAddCatalogItem(catalogSubTab, value);
      setNewCatalogValue("");
      showToast?.("AÑADIDO", `"${value}" agregado`, "sparkles", 2000);
    } catch (err) {
      console.error("[AdminPanel.handleAddCatalogItem]", err);
      showToast?.("ERROR", err.message || "No se pudo añadir", "warning", 3500);
    }
  };

  const handleRemoveCatalogItem = async (item) => {
    sounds.playDiscard();
    try {
      await onRemoveCatalogItem(item.id);
      showToast?.("ELIMINADO", `"${item.value}" eliminado`, "warning", 2000);
    } catch (err) {
      console.error("[AdminPanel.handleRemoveCatalogItem]", err);
      showToast?.("ERROR", err.message || "No se pudo eliminar", "warning", 3500);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="relative max-w-6xl mx-auto space-y-6 pb-12">
      {/* Glow decorativo fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ─── Botón regresar ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center justify-between flex-wrap gap-2"
      >
        <a
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-['Press_Start_2P'] text-xs rounded-xl border-2 border-slate-600 shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Volver al tablero principal"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" aria-hidden="true" />
          <span>← Volver al Tablero</span>
        </a>
        <span className="text-[11px] font-mono text-slate-500 bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800">
          🛡️ /admin
        </span>
      </motion.div>

      {/* ─── Cabecera con tabs ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#151928] to-[#0f1524] border-4 border-cyan-400 rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#0891b2] overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl border-2 border-black shadow-[3px_3px_0_#000]"
              aria-hidden="true"
            >
              <Settings className="w-6 h-6 text-black" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h1 className="font-['Press_Start_2P'] text-sm sm:text-lg text-cyan-400 tracking-wider drop-shadow-[2px_2px_0_#000]">
                PANEL ADMIN
              </h1>
              <p className="text-xs sm:text-sm font-['Chakra_Petch'] text-slate-300">
                Gestión completa del pool, catálogos y reglas.
              </p>
            </div>
          </div>

          <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} totalCharacters={totalCharacters} />
        </div>
      </motion.div>

      {/* ─── Acciones rápidas (solo en personajes) ───────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "characters" && (
          <motion.div
            key="quick-actions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
          >
            <QuickAction
              id="btn-add"
              icon={Plus}
              label="AGREGAR"
              color="emerald"
              onClick={handleOpenAddModal}
            />
            <QuickAction
              id="btn-seed"
              icon={isSeeding ? Loader2 : Download}
              label={isSeeding ? "CARGANDO..." : "SEED"}
              color="cyan"
              onClick={handleSeed}
              disabled={isSeeding}
              loading={isSeeding}
            />

            {showResetConfirm ? (
              <ConfirmAction
                label="¿RESET?"
                confirmLabel={isResetting ? "RESET..." : "SÍ, RESET"}
                onConfirm={handleAdminReset}
                onCancel={() => setShowResetConfirm(false)}
                color="amber"
                loading={isResetting}
              />
            ) : (
              <QuickAction
                id="btn-reset"
                icon={RotateCcw}
                label="RESET PARTIDA"
                color="amber"
                onClick={() => {
                  sounds.playClick();
                  setShowResetConfirm(true);
                }}
              />
            )}

            {showCleanConfirm ? (
              <ConfirmAction
                label="¿BORRAR DB?"
                confirmLabel={isWiping ? "BORRANDO..." : "SÍ, BORRAR"}
                onConfirm={handleCleanDb}
                onCancel={() => setShowCleanConfirm(false)}
                color="rose"
                loading={isWiping}
              />
            ) : (
              <QuickAction
                id="btn-wipe"
                icon={Trash2}
                label="BORRAR DB"
                color="rose"
                onClick={() => {
                  sounds.playClick();
                  setShowCleanConfirm(true);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Contenido de tabs ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "characters" && (
          <CharactersTab
            key="characters-tab"
            available={available}
            used={used}
            discarded={discarded}
            totalCharacters={totalCharacters}
            filteredAvailable={filteredAvailable}
            hasActiveFilters={hasActiveFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            rarityFilter={rarityFilter}
            toggleRarity={toggleRarity}
            minAcceptance={minAcceptance}
            setMinAcceptance={setMinAcceptance}
            maxAcceptance={maxAcceptance}
            setMaxAcceptance={setMaxAcceptance}
            attributeFilter={attributeFilter}
            setAttributeFilter={setAttributeFilter}
            raceFilter={raceFilter}
            setRaceFilter={setRaceFilter}
            traitFilter={traitFilter}
            setTraitFilter={setTraitFilter}
            attributesList={attributesList}
            racesList={racesList}
            traitsList={traitsList}
            clearFilters={clearFilters}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onDelete={handleDelete}
            deletingId={deletingId}
            onSeed={handleSeed}
            isSeeding={isSeeding}
          />
        )}

        {activeTab === "catalogs" && (
          <CatalogsTab
            key="catalogs-tab"
            catalogSubTab={catalogSubTab}
            setCatalogSubTab={setCatalogSubTab}
            newCatalogValue={newCatalogValue}
            setNewCatalogValue={setNewCatalogValue}
            onAddCatalogItem={handleAddCatalogItem}
            onRemoveCatalogItem={handleRemoveCatalogItem}
            attributesList={attributesList}
            racesList={racesList}
            traitsList={traitsList}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            key="settings-tab"
            initialCoins={initialCoins}
            setInitialCoins={setInitialCoins}
            auctionTime={auctionTime}
            setAuctionTime={setAuctionTime}
            maxAuctionsPerRound={maxAuctionsPerRound}
            setMaxAuctionsPerRound={setMaxAuctionsPerRound}
            animationType={animationType}
            setAnimationType={setAnimationType}
            savedSuccess={savedSuccess}
            isSaving={isSaving}
            onSubmit={handleSaveSettings}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <CharacterFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCharacter(null);
        }}
        characterToEdit={editingCharacter}
        onSave={handleSaveCharacter}
        catalogs={catalogs}
      />
    </div>
  );
}

// ============================================================================
// SUB: AdminTabs
// ============================================================================
function AdminTabs({ activeTab, setActiveTab, totalCharacters }) {
  const tabs = [
    { id: "characters", label: `Personajes (${totalCharacters})`, color: "cyan", icon: Package },
    { id: "catalogs", label: "Catálogos", color: "purple", icon: Tag },
    { id: "settings", label: "Ajustes", color: "yellow", icon: Settings },
  ];

  return (
    <div role="tablist" className="relative flex flex-wrap items-center gap-2 bg-black/40 p-1 rounded-xl border border-slate-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const colors = {
          cyan: isActive ? "bg-cyan-400 text-black shadow-[2px_2px_0_#000]" : "text-slate-400 hover:text-cyan-300",
          purple: isActive ? "bg-purple-400 text-black shadow-[2px_2px_0_#000]" : "text-slate-400 hover:text-purple-300",
          yellow: isActive ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]" : "text-slate-400 hover:text-yellow-300",
        }[tab.color];

        return (
          <motion.button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              sounds.playClick();
              setActiveTab(tab.id);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Press_Start_2P'] transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-${tab.color}-400 ${colors}`}
          >
            <Icon className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
            <span>{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================================================
// SUB: QuickAction
// ============================================================================
function QuickAction({ id, icon: Icon, label, color, onClick, disabled, loading }) {
  const palettes = {
    emerald: "from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500",
    cyan: "from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400",
    amber: "from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
    rose: "from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600",
  }[color];

  const textColor = color === "rose" ? "text-white" : "text-black";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`relative p-3.5 bg-gradient-to-br ${palettes} rounded-xl border-4 border-black shadow-[4px_4px_0_#000] ${textColor} font-['Press_Start_2P'] text-[10px] sm:text-xs flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} aria-hidden="true" />
      <span>{label}</span>
    </motion.button>
  );
}

// ============================================================================
// SUB: ConfirmAction
// ============================================================================
function ConfirmAction({ label, confirmLabel, onConfirm, onCancel, color, loading }) {
  const palettes = {
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-600 to-red-700",
  }[color];

  const textColor = color === "rose" ? "text-white" : "text-black";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="col-span-1 flex gap-1.5"
      role="alertdialog"
    >
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className={`flex-1 p-2.5 bg-gradient-to-br ${palettes} rounded-xl border-4 border-black ${textColor} font-['Press_Start_2P'] text-[9px] shadow-[3px_3px_0_#000] focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60 active:translate-y-0.5 transition`}
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border-2 border-slate-600 text-slate-300 text-xs transition focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label="Cancelar"
      >
        <X className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// SUB: CharactersTab
// ============================================================================
function CharactersTab({
  available,
  used,
  discarded,
  totalCharacters,
  filteredAvailable,
  hasActiveFilters,
  searchQuery,
  setSearchQuery,
  rarityFilter,
  toggleRarity,
  minAcceptance,
  setMinAcceptance,
  maxAcceptance,
  setMaxAcceptance,
  attributeFilter,
  setAttributeFilter,
  raceFilter,
  setRaceFilter,
  traitFilter,
  setTraitFilter,
  attributesList,
  racesList,
  traitsList,
  clearFilters,
  onOpenAddModal,
  onOpenEditModal,
  onDelete,
  deletingId,
  onSeed,
  isSeeding,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000] space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
          <div>
            <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400">
              POOL ({filteredAvailable.length}
              {hasActiveFilters ? ` / ${available.length}` : ""})
            </h2>
            <p className="text-[11px] text-slate-400 font-['Chakra_Petch']">
              Total: {totalCharacters} • Usados: {used.length} • Desechados: {discarded.length}
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onOpenAddModal}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-['Press_Start_2P'] rounded-lg border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-yellow-200"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
          <span>Nuevo</span>
        </motion.button>
      </div>

      {/* Filtros */}
      <div className="space-y-3 bg-black/30 border-2 border-slate-800 rounded-xl p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              aria-label="Buscar personaje por nombre"
              className="w-full pl-9 pr-3 py-2 bg-[#0d101a] border-2 border-slate-700 focus:border-cyan-400 rounded-lg text-sm font-['Chakra_Petch'] text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/40 transition"
            />
          </div>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg text-xs font-['Chakra_Petch'] text-slate-200 flex items-center gap-1.5 transition focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
                <span>Limpiar</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Rarezas */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">Rareza:</span>
            {ALL_RARITIES.map((r) => {
              const isActive = rarityFilter.includes(r);
              const cfg = RARITY_CONFIG[r];
              return (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => toggleRarity(r)}
                  aria-pressed={isActive}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-['Press_Start_2P'] border-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    isActive ? `${cfg.badgeClass} shadow-lg` : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {r}
                </motion.button>
              );
            })}
          </div>

          {/* Acept */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">Acept:</span>
            <input
              type="number"
              min="0"
              max="20"
              value={minAcceptance}
              onChange={(e) => setMinAcceptance(e.target.value)}
              placeholder="min"
              aria-label="Aceptación mínima"
              className="w-14 px-2 py-1 bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-lg text-xs font-['Chakra_Petch'] text-yellow-300 outline-none"
            />
            <span className="text-slate-500 text-xs">–</span>
            <input
              type="number"
              min="0"
              max="20"
              value={maxAcceptance}
              onChange={(e) => setMaxAcceptance(e.target.value)}
              placeholder="max"
              aria-label="Aceptación máxima"
              className="w-14 px-2 py-1 bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-lg text-xs font-['Chakra_Petch'] text-yellow-300 outline-none"
            />
          </div>

          {/* Filtros select */}
          <FilterSelect label="Atrib" value={attributeFilter} onChange={setAttributeFilter} options={attributesList} placeholder="Todos" />
          <FilterSelect label="Raza" value={raceFilter} onChange={setRaceFilter} options={racesList} placeholder="Todas" />
          <FilterSelect label="Caract" value={traitFilter} onChange={setTraitFilter} options={traitsList} placeholder="Todas" />
        </div>
      </div>

      {/* Lista */}
      {available.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Sin personajes en el pool"
          description="No hay personajes disponibles en el pool activo."
          actionLabel={isSeeding ? "Cargando..." : "Cargar Personajes Iniciales"}
          onAction={onSeed}
          disabled={isSeeding}
          color="yellow"
        />
      ) : filteredAvailable.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No hay personajes que coincidan con los filtros."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
          color="slate"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filteredAvailable.map((char, idx) => (
              <CharacterMiniCard
                key={char.id}
                char={char}
                idx={idx}
                onEdit={onOpenEditModal}
                onDelete={onDelete}
                deletingId={deletingId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// SUB: CharacterMiniCard
// ============================================================================
function CharacterMiniCard({ char, idx, onEdit, onDelete, deletingId }) {
  const config = RARITY_CONFIG[char.rarity || "R"];
  const imgSrc = char.image_url || char.imageUrl || "";
  const races = Array.isArray(char.races) ? char.races : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
      whileHover={{ y: -2 }}
      className={`relative rounded-xl border-2 ${config.cardBorder} ${config.cardBg} p-3 flex flex-col justify-between gap-2 shadow-[2px_2px_0_#000] overflow-hidden group`}
    >
      {/* Fondo animado sutil para UR/LR */}
      {config.animatedBg && (
        <div className="absolute inset-0 opacity-20 animate-gradient-fast" style={{ backgroundImage: config.animatedBg }} aria-hidden="true" />
      )}

      <div className="relative flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden border border-black/60 flex-shrink-0 bg-black">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={char.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[9px] font-['Press_Start_2P'] ${config.badgeClass}`}>{config.label}</span>
            <span className="text-[10px] font-['Chakra_Petch'] text-slate-300 font-bold">Acept: 0-{char.acceptance}</span>
          </div>
          <h4 className="font-['Press_Start_2P'] text-xs text-white truncate drop-shadow-[1px_1px_0_#000]">{char.name}</h4>
          {(char.attribute && char.attribute !== "Desconocido") || races.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {char.attribute && char.attribute !== "Desconocido" && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/50 text-[9px] font-['Chakra_Petch'] text-yellow-300">{char.attribute}</span>
              )}
              {races.slice(0, 2).map((r) => (
                <span key={r} className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/50 text-[9px] font-['Chakra_Petch'] text-cyan-300">{r}</span>
              ))}
              {races.length > 2 && <span className="text-[9px] text-slate-500">+{races.length - 2}</span>}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative flex items-center justify-end gap-2 border-t border-slate-700/60 pt-2">
        <motion.button
          type="button"
          onClick={() => onEdit(char)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Editar ${char.name}`}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Edit className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
          <span>Editar</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onDelete(char)}
          disabled={deletingId === char.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Eliminar ${char.name}`}
          className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1 border border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
        >
          {deletingId === char.id ? (
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
          )}
          <span>Eliminar</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB: FilterSelect
// ============================================================================
function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filtrar por ${label}`}
        className="px-2 py-1 bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-lg text-xs font-['Chakra_Petch'] text-yellow-300 outline-none max-w-[120px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.value}>{o.value}</option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// SUB: CatalogsTab
// ============================================================================
function CatalogsTab({
  catalogSubTab,
  setCatalogSubTab,
  newCatalogValue,
  setNewCatalogValue,
  onAddCatalogItem,
  onRemoveCatalogItem,
  attributesList,
  racesList,
  traitsList,
}) {
  const counts = { attribute: attributesList.length, race: racesList.length, trait: traitsList.length };
  const items = catalogSubTab === "attribute" ? attributesList : catalogSubTab === "race" ? racesList : traitsList;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000] space-y-4"
    >
      <div className="border-b-2 border-slate-800 pb-3">
        <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-purple-400 flex items-center gap-2">
          <Tag className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          CATÁLOGOS
        </h2>
        <p className="text-xs text-slate-400 font-['Chakra_Petch']">Los cambios se sincronizan en tiempo real.</p>
      </div>

      <div role="tablist" className="flex flex-wrap items-center gap-2 bg-black/40 p-1 rounded-xl border border-slate-700">
        {CATALOG_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = catalogSubTab === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => { sounds.playClick(); setCatalogSubTab(t.id); setNewCatalogValue(""); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-['Press_Start_2P'] transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                isActive ? `bg-gradient-to-r ${t.bg} text-black shadow-[2px_2px_0_#000]` : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] ${isActive ? "bg-black/30" : "bg-black/60"}`}>{counts[t.id]}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-2 items-stretch">
        <input
          type="text"
          value={newCatalogValue}
          onChange={(e) => setNewCatalogValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddCatalogItem(); } }}
          placeholder={catalogSubTab === "attribute" ? "Nuevo atributo..." : catalogSubTab === "race" ? "Nueva raza..." : "Nueva característica..."}
          aria-label="Nuevo valor"
          maxLength={40}
          className="flex-1 px-3 py-2 bg-[#0d101a] border-2 border-slate-700 focus:border-purple-400 rounded-lg text-sm font-['Chakra_Petch'] text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-400/40"
        />
        <motion.button
          type="button"
          onClick={onAddCatalogItem}
          disabled={!newCatalogValue.trim()}
          whileHover={newCatalogValue.trim() ? { scale: 1.03 } : {}}
          whileTap={newCatalogValue.trim() ? { scale: 0.97 } : {}}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-black font-['Press_Start_2P'] text-xs rounded-lg border-2 border-black shadow-[2px_2px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
          <span>Añadir</span>
        </motion.button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl bg-black/30">
          <Tag className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" aria-hidden="true" />
          <p className="font-['Chakra_Petch'] text-xs text-slate-500">No hay valores. Añade el primero arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                whileHover={{ y: -2 }}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-black/40 border-2 border-slate-700 rounded-lg group hover:border-purple-400/60 transition"
              >
                <span className="font-['Chakra_Petch'] text-sm text-white truncate">{item.value}</span>
                <motion.button
                  type="button"
                  onClick={() => onRemoveCatalogItem(item)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Eliminar ${item.value}`}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition focus:outline-none focus:ring-2 focus:ring-rose-400 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded-xl">
        <p className="text-[11px] font-['Chakra_Petch'] text-amber-200">
          ⚠️ <strong>Nota:</strong> Eliminar un valor no lo quita de los personajes que ya lo tengan asignado.
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB: SettingsTab
// ============================================================================
function SettingsTab({
  initialCoins,
  setInitialCoins,
  auctionTime,
  setAuctionTime,
  maxAuctionsPerRound,
  setMaxAuctionsPerRound,
  animationType,
  setAnimationType,
  savedSuccess,
  isSaving,
  onSubmit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000]"
    >
      <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 mb-4 border-b-2 border-slate-800 pb-3 flex items-center gap-2">
        <Settings className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        CONFIGURACIÓN
      </h2>

      <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
        <SettingInput
          id="initial-coins"
          icon={Coins}
          iconColor="text-yellow-400"
          label="Monedas Iniciales"
          description="Al reiniciar o cambiar de ronda, los jugadores vuelven a este saldo."
          value={initialCoins}
          onChange={setInitialCoins}
          min="5"
          max="999"
          textColor="text-yellow-400"
        />

        <SettingInput
          id="auction-time"
          icon={Clock}
          iconColor="text-cyan-400"
          label="Tiempo de Subasta (seg)"
          description="Tiempo del cronómetro de pujas."
          value={auctionTime}
          onChange={setAuctionTime}
          min="5"
          max="120"
          textColor="text-cyan-400"
        />

        <SettingInput
          id="max-auctions"
          icon={Package}
          iconColor="text-emerald-400"
          label="Personajes por Ronda"
          description="Máximo de subastas antes de bloquear la ronda."
          value={maxAuctionsPerRound}
          onChange={setMaxAuctionsPerRound}
          min="1"
          max="200"
          textColor="text-emerald-400"
        />

        {/* Animación */}
        <div>
          <div className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-2">
            <Film className="w-4 h-4 text-purple-400" aria-hidden="true" />
            <span>Animación de Sorteo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "roulette", title: "RULETA", desc: "Cinta horizontal con freno gradual.", color: "yellow" },
              { id: "slot", title: "SLOT", desc: "Carrete vertical con palanca.", color: "cyan" },
              { id: "card_flip", title: "CARTA 3D", desc: "Giro 3D con aura estelar.", color: "fuchsia" },
            ].map((opt) => {
              const isSelected = animationType === opt.id;
              const palette = {
                yellow: { title: "text-yellow-300", selected: "bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400/50" },
                cyan: { title: "text-cyan-300", selected: "bg-cyan-400/20 border-cyan-400 ring-2 ring-cyan-400/50" },
                fuchsia: { title: "text-fuchsia-300", selected: "bg-fuchsia-400/20 border-fuchsia-400 ring-2 ring-fuchsia-400/50" },
              }[opt.color];

              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setAnimationType(opt.id); }}
                  aria-pressed={isSelected}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition text-left focus:outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                    isSelected ? palette.selected : "bg-black/40 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className={`font-['Press_Start_2P'] text-[10px] mb-1 ${palette.title}`}>[ {opt.title} ]</div>
                  <div className="text-xs font-['Chakra_Petch'] text-slate-300">{opt.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="status"
              className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-['Chakra_Petch'] font-bold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              <span>¡Ajustes guardados correctamente!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3 px-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />}
          <span>{isSaving ? "Guardando..." : "Guardar Ajustes"}</span>
        </motion.button>
      </form>
    </motion.div>
  );
}

// ============================================================================
// SUB: SettingInput
// ============================================================================
function SettingInput({ id, icon: Icon, iconColor, label, description, value, onChange, min, max, textColor }) {
  return (
    <div>
      <label htmlFor={`input-${id}`} className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-1.5">
        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2.5} aria-hidden="true" />
        <span>{label}:</span>
      </label>
      <input
        type="number"
        id={`input-${id}`}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm font-['Press_Start_2P'] ${textColor} outline-none focus:ring-2 focus:ring-yellow-400/40 transition`}
      />
      <p className="text-xs text-slate-400 font-['Chakra_Petch'] mt-1">{description}</p>
    </div>
  );
}

// ============================================================================
// SUB: EmptyState
// ============================================================================
function EmptyState({ icon: Icon, title, description, actionLabel, onAction, disabled, color }) {
  const palettes = {
    yellow: "text-yellow-400",
    slate: "text-slate-600",
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-black/30"
    >
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-3">
        <Icon className={`w-12 h-12 ${palettes}`} strokeWidth={1.5} aria-hidden="true" />
      </motion.div>
      <p className="font-['Press_Start_2P'] text-xs text-slate-400 mb-2">{title}</p>
      <p className="text-xs text-slate-500 font-['Chakra_Petch'] mb-4">{description}</p>
      <motion.button
        type="button"
        onClick={onAction}
        disabled={disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] disabled:opacity-60"
      >
        {actionLabel}
      </motion.button>
    </motion.div>
  );
}