import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Settings, 
  Database, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Coins, 
  Film,
  Download,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import CharacterFormModal from "./CharacterFormModal";
import CharacterCard, { RARITY_CONFIG } from "../auction/CharacterCard";
import sounds from "../../services/soundEffects";
import { DEFAULT_CHARACTERS } from "../../services/defaultCharacters";

export default function AdminPanel({
  settings,
  characterPool,
  onUpdateSettings,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onResetDatabase,
  onSeedDefaultCharacters
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("characters"); // 'characters' | 'settings'

  // Ajustes locales para edición
  const [initialCoins, setInitialCoins] = useState(settings?.initialCoins ?? 20);
  const [auctionTime, setAuctionTime] = useState(settings?.auctionTime ?? 20);
  const [animationType, setAnimationType] = useState(settings?.animationType || "roulette");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const available = characterPool?.available || [];
  const used = characterPool?.used || [];
  const discarded = characterPool?.discarded || [];
  const totalCharacters = available.length + used.length + discarded.length;

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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    sounds.playClick();
    onUpdateSettings({
      initialCoins: Math.max(1, parseInt(initialCoins, 10) || 20),
      auctionTime: Math.max(5, parseInt(auctionTime, 10) || 20),
      animationType
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCleanDb = () => {
    sounds.playDiscard();
    setShowCleanConfirm(false);
    onResetDatabase();
  };

  const handleSeed = () => {
    sounds.playVictory();
    onSeedDefaultCharacters();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Botón superior para regresar al juego */}
      <div className="flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-['Press_Start_2P'] text-xs rounded-xl border-2 border-slate-600 shadow-[2px_2px_0_#000] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Volver al Tablero</span>
        </a>
        <span className="text-[11px] font-mono text-slate-500 bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800">
          Ruta: /admin
        </span>
      </div>

      {/* Cabecera del Admin */}
      <div className="bg-[#151928] border-4 border-cyan-400 rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#0891b2] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h1 className="font-['Press_Start_2P'] text-sm sm:text-lg text-cyan-400">
              PANEL ADMINISTRADOR
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-['Chakra_Petch'] text-slate-300">
            Gestión completa del pool de personajes, reglas de subasta y animaciones de gacha (Acceso libre).
          </p>
        </div>

        {/* Pestañas Rápidas */}
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab("characters")}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Press_Start_2P'] transition ${
              activeTab === "characters" ? "bg-cyan-400 text-black shadow-[2px_2px_0_#000]" : "text-slate-400 hover:text-white"
            }`}
          >
            Personajes ({totalCharacters})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Press_Start_2P'] transition ${
              activeTab === "settings" ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]" : "text-slate-400 hover:text-white"
            }`}
          >
            Ajustes
          </button>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleOpenAddModal}
          className="p-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] text-black font-['Press_Start_2P'] text-xs flex items-center justify-center gap-2 transition active:translate-y-1"
        >
          <Plus className="w-4 h-4" />
          <span>AGREGAR PERSONAJE</span>
        </button>

        <button
          onClick={handleSeed}
          className="p-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] text-black font-['Press_Start_2P'] text-xs flex items-center justify-center gap-2 transition active:translate-y-1"
          title="Carga 12 personajes preparados con diferentes rarezas para probar"
        >
          <Download className="w-4 h-4" />
          <span>CARGAR SEED (12 CHARS)</span>
        </button>

        {showCleanConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={handleCleanDb}
              className="flex-1 p-3 bg-rose-600 hover:bg-rose-500 rounded-xl border-4 border-black text-white font-['Press_Start_2P'] text-[10px] shadow-[3px_3px_0_#000]"
            >
              ¿BORRAR TODO?
            </button>
            <button
              onClick={() => setShowCleanConfirm(false)}
              className="px-3 bg-slate-800 rounded-xl border-2 border-slate-700 text-slate-300 text-xs"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCleanConfirm(true)}
            className="p-3.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] text-white font-['Press_Start_2P'] text-xs flex items-center justify-center gap-2 transition active:translate-y-1"
          >
            <Trash2 className="w-4 h-4 text-yellow-300" />
            <span>LIMPIAR BASE DE DATOS</span>
          </button>
        )}
      </div>

      {/* CONTENIDO DE PESTAÑA: PERSONAJES */}
      {activeTab === "characters" && (
        <div className="bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
            <div>
              <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400">
                POOL DE PERSONAJES ({available.length} DISPONIBLES)
              </h2>
              <p className="text-xs text-slate-400 font-['Chakra_Petch']">
                Total cargados: {totalCharacters} | Usados: {used.length} | Desechados: {discarded.length}
              </p>
            </div>
            
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-['Press_Start_2P'] rounded-lg border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0_#000]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          {available.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-black/30">
              <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-2 opacity-60" />
              <p className="font-['Press_Start_2P'] text-xs text-slate-400 mb-3">
                No hay personajes disponibles en el pool activo.
              </p>
              <button
                onClick={handleSeed}
                className="px-4 py-2 bg-cyan-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000]"
              >
                Cargar Personajes Iniciales
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {available.map((char) => {
                const config = RARITY_CONFIG[char.rarity || "R"];
                return (
                  <div
                    key={char.id}
                    className={`rounded-xl border-2 ${config.cardBorder} ${config.cardBg} p-3 flex flex-col justify-between gap-2 shadow-[2px_2px_0_#000]`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-14 h-14 rounded-lg object-cover border border-black/60 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-['Press_Start_2P'] ${config.badgeClass}`}>
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

                    {/* Botones de acción individual */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-700/60 pt-2">
                      <button
                        onClick={() => handleOpenEditModal(char)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1 border border-slate-600"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => onDeleteCharacter(char.id)}
                        className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1 border border-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
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

      {/* CONTENIDO DE PESTAÑA: AJUSTES */}
      {activeTab === "settings" && (
        <div className="bg-[#121526] border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#000]">
          <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 mb-4 border-b-2 border-slate-800 pb-3">
            CONFIGURACIÓN GENERAL DEL JUEGO
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
            
            {/* Monedas Iniciales */}
            <div>
              <label className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-1.5">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>Monedas Iniciales por Jugador:</span>
              </label>
              <input
                type="number"
                min="5"
                max="999"
                value={initialCoins}
                onChange={(e) => setInitialCoins(e.target.value)}
                className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm font-['Press_Start_2P'] text-yellow-400 outline-none"
              />
              <p className="text-xs text-slate-400 font-['Chakra_Petch'] mt-1">
                Por defecto: 20 monedas. Al reiniciar o cambiar de ronda, los jugadores volverán a tener este saldo.
              </p>
            </div>

            {/* Tiempo de la Subasta */}
            <div>
              <label className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Tiempo de la Subasta (Segundos):</span>
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={auctionTime}
                onChange={(e) => setAuctionTime(e.target.value)}
                className="w-full bg-[#0d101a] border-2 border-slate-700 focus:border-yellow-400 rounded-xl p-3 text-sm font-['Press_Start_2P'] text-cyan-400 outline-none"
              />
              <p className="text-xs text-slate-400 font-['Chakra_Petch'] mt-1">
                Por defecto: 20 segundos. Tiempo del cronómetro para que los jugadores compitan con sus pujas.
              </p>
            </div>

            {/* Selector de Tipo de Animación de Ruleta / Gacha */}
            <div>
              <label className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-slate-200 mb-2">
                <Film className="w-4 h-4 text-purple-400" />
                <span>Estilo de Animación del Sorteo (Gacha):</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Opción 1: Ruleta Arcade */}
                <div
                  onClick={() => setAnimationType("roulette")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    animationType === "roulette"
                      ? "bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400/50"
                      : "bg-black/40 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="font-['Press_Start_2P'] text-[10px] text-yellow-300 mb-1">
                    [ RULETA ]
                  </div>
                  <div className="text-xs font-['Chakra_Petch'] text-slate-300">
                    Cinta horizontal rápida con freno gradual y marcador superior.
                  </div>
                </div>

                {/* Opción 2: Slot Machine */}
                <div
                  onClick={() => setAnimationType("slot")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    animationType === "slot"
                      ? "bg-cyan-400/20 border-cyan-400 ring-2 ring-cyan-400/50"
                      : "bg-black/40 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="font-['Press_Start_2P'] text-[10px] text-cyan-300 mb-1">
                    [ SLOT MACHINE ]
                  </div>
                  <div className="text-xs font-['Chakra_Petch'] text-slate-300">
                    Carrete vertical estilo tragamonedas arcade con parada seca.
                  </div>
                </div>

                {/* Opción 3: Carta Giratoria 3D */}
                <div
                  onClick={() => setAnimationType("card_flip")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    animationType === "card_flip"
                      ? "bg-fuchsia-400/20 border-fuchsia-400 ring-2 ring-fuchsia-400/50"
                      : "bg-black/40 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="font-['Press_Start_2P'] text-[10px] text-fuchsia-300 mb-1">
                    [ CARTA 3D ]
                  </div>
                  <div className="text-xs font-['Chakra_Petch'] text-slate-300">
                    Giro 3D en suspenso con cambio de aura y revelación estelar.
                  </div>
                </div>

              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-['Chakra_Petch'] font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>¡Ajustes guardados y sincronizados exitosamente!</span>
              </div>
            )}

            <button
              type="submit"
              className="py-3 px-6 bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[4px_4px_0_#000] transition"
            >
              Guardar Ajustes
            </button>

          </form>
        </div>
      )}

      {/* Modal para Crear / Editar */}
      <CharacterFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        characterToEdit={editingCharacter}
        onSave={(char) => {
          if (editingCharacter) {
            onEditCharacter(char);
          } else {
            onAddCharacter(char);
          }
        }}
      />

    </div>
  );
}
