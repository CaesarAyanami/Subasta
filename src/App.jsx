import React, { useEffect } from "react";
import Header from "./components/common/Header";
import ConnectedUsersModal from "./components/common/ConnectedUsersModal";
import CharacterPoolModal from "./components/common/CharacterPoolModal";
import FloatingToast from "./components/common/FloatingToast";
import RoundControls from "./components/common/RoundControls";
import PlayerCard from "./components/players/PlayerCard";
import InventorySlots from "./components/players/InventorySlots";
import AuctionZone from "./components/auction/AuctionZone";
import AdminPanel from "./components/admin/AdminPanel";
import LoadingScreen from "./components/common/LoadingScreen";
import ErrorScreen from "./components/common/ErrorScreen";

import { useGameStore, selectCanAdvanceRound } from "./store/gameStore";
import { useUIStore } from "./store/uiStore";
import { usePresenceStore } from "./store/presenceStore";
import { MAX_INVENTORY_SLOTS } from "./services/supabaseClient";

// Detectar vista por URL
function checkIsAdminUrl() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    search.includes("view=admin") ||
    hash === "#admin"
  );
}

export default function App() {
  // Stores
  const {
    loading,
    error,
    game,
    settings,
    players,
    auction,
    characterPool,
    roundVotes,
    mySlot,
    init,
    destroy,
    takeSlot,
    becomeSpectator,
    updatePlayerName,
    toggleReady,
    markAuctionBidding,
    placeBid,
    updateTimerLocal,
    finalizeAuction,
    toggleFinishRequest,
    castVote,
    cancelVote,
    advanceRound,
    updateSettings,
    addCharacter,
    editCharacter,
    removeCharacter,
    seedDefaults,
    wipeCharacters,
  } = useGameStore();

  const {
    currentView,
    setView,
    connectedModalOpen,
    openConnectedModal,
    closeConnectedModal,
    poolModalOpen,
    poolModalTab,
    openPoolModal,
    closePoolModal,
    soundMuted,
    toggleSound,
    toast,
    showToast,
  } = useUIStore();

  const {
    users,
    init: initPresence,
    updatePresence,
    destroy: destroyPresence,
  } = usePresenceStore();

  const canAdvanceRound = useGameStore(selectCanAdvanceRound);
  const isAuctionIdle = auction?.status === "IDLE";
  const showRoundControls = canAdvanceRound || isAuctionIdle;

  // --------------------------------------------------------------------------
  // INIT
  // --------------------------------------------------------------------------
  useEffect(() => {
    init();
    initPresence();
    setView(checkIsAdminUrl() ? "admin" : "board");

    return () => {
      destroy();
      destroyPresence();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------------------------------
  // URL NAVIGATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handler = () => setView(checkIsAdminUrl() ? "admin" : "board");
    window.addEventListener("popstate", handler);
    window.addEventListener("hashchange", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      window.removeEventListener("hashchange", handler);
    };
  }, [setView]);

  // --------------------------------------------------------------------------
  // PRESENCE: reflejar rol actual
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!game) return;

    const name =
      mySlot === "player1"
        ? players.player1?.name || "Jugador 1"
        : mySlot === "player2"
        ? players.player2?.name || "Jugador 2"
        : `Espectador`;

    updatePresence({
      name,
      role: mySlot || "spectator",
      slot: mySlot,
    });
  }, [
    mySlot,
    players.player1?.name,
    players.player2?.name,
    game,
    updatePresence,
  ]);

  // --------------------------------------------------------------------------
  // HANDLERS — envueltos para toasts
  // --------------------------------------------------------------------------
  const withToast = (fn, errorTitle = "Error") => async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error(err);
      showToast(errorTitle, err.message || "Algo salió mal", "warning", 3000);
    }
  };

  const handleTakeSlot = withToast(async (slot) => {
    await takeSlot(slot);
    showToast(
      "ROL ASIGNADO",
      `Eres ${slot === "player1" ? "Jugador 1" : "Jugador 2"}`,
      "sparkles",
      2000
    );
  }, "No se pudo tomar el slot");

  const handleBecomeSpectator = withToast(async () => {
    await becomeSpectator();
    showToast("MODO ESPECTADOR", "Has liberado tu slot", "info", 2000);
  }, "No se pudo liberar el slot");

  const handleBid = withToast(async (slot, amount) => {
    await placeBid(slot, amount);
    showToast("¡NUEVA PUJA!", `${amount} monedas`, "trophy", 2000);
  }, "Puja rechazada");

  const handleToggleReady = withToast(async (slot) => {
    await toggleReady(slot);
  });

  const handleToggleFinish = withToast(async (slot) => {
    await toggleFinishRequest(slot);
  });

  const handleVote = withToast(async (slot, action) => {
    const result = await castVote(slot, action);
    if (result?.both_agree) {
      showToast("¡CONSENSO!", "Ambos confirmaron la acción", "trophy", 2500);
      await advanceRound(action);
    } else {
      showToast("VOTO REGISTRADO", "Esperando a tu rival...", "info", 2000);
    }
  });

  const handleCancelVote = withToast(async (slot) => {
    await cancelVote(slot);
    showToast("VOTO RETIRADO", "Has cancelado tu selección", "info", 1500);
  });

  // --------------------------------------------------------------------------
  // RENDER — LOADING / ERROR
  // --------------------------------------------------------------------------
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={() => init()} />;

  // --------------------------------------------------------------------------
  // RENDER — MAIN
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0d101a] text-white flex flex-col selection:bg-yellow-400 selection:text-black">
      <FloatingToast toast={toast} />

      <Header
        mySlot={mySlot}
        onTakeSlot={handleTakeSlot}
        onBecomeSpectator={handleBecomeSpectator}
        players={players}
        connectedUsersCount={users.length || 1}
        onOpenConnectedModal={openConnectedModal}
        availableCount={(characterPool?.available || []).length}
        historyCount={
          (characterPool?.discarded || []).length +
          (characterPool?.used || []).length +
          (players?.player1?.inventory || []).length +
          (players?.player2?.inventory || []).length
        }
        onOpenPoolModal={openPoolModal}
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        {currentView === "board" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <AuctionZone
                  auctionState={auction}
                  pool={characterPool?.available || []}
                  settings={settings}
                  players={players}
                  mySlot={mySlot}
                  onBid={handleBid}
                  onToggleFinish={handleToggleFinish}
                  onRouletteFinished={markAuctionBidding}
                  onTimerTick={updateTimerLocal}
                  onTimeExpired={finalizeAuction}
                />
              </div>

              <div className="lg:col-span-3 order-2 lg:order-1 space-y-3">
                <PlayerCard
                  playerId="player1"
                  player={players?.player1}
                  isLocalPlayer={mySlot === "player1"}
                  isOccupied={!!players?.player1?.client_id}
                  canToggleReady={auction.status === "IDLE"}
                  onUpdateName={(name) => updatePlayerName("player1", name)}
                  onToggleReady={() => handleToggleReady("player1")}
                  onTakeSlot={() => handleTakeSlot("player1")}
                />
                <InventorySlots
                  inventory={players?.player1?.inventory || []}
                  maxSlots={MAX_INVENTORY_SLOTS}
                />
              </div>

              <div className="lg:col-span-3 order-3 lg:order-3 space-y-3">
                <PlayerCard
                  playerId="player2"
                  player={players?.player2}
                  isLocalPlayer={mySlot === "player2"}
                  isOccupied={!!players?.player2?.client_id}
                  canToggleReady={auction.status === "IDLE"}
                  onUpdateName={(name) => updatePlayerName("player2", name)}
                  onToggleReady={() => handleToggleReady("player2")}
                  onTakeSlot={() => handleTakeSlot("player2")}
                />
                <InventorySlots
                  inventory={players?.player2?.inventory || []}
                  maxSlots={MAX_INVENTORY_SLOTS}
                />
              </div>
            </div>

            {showRoundControls && (
              <div className="pt-2 animate-fade-in">
                <RoundControls
                  mySlot={mySlot}
                  players={players}
                  roundVotes={roundVotes}
                  onVote={handleVote}
                  onCancelVote={handleCancelVote}
                  poolStats={{
                    available: (characterPool?.available || []).length,
                    used: (characterPool?.used || []).length,
                    discarded: (characterPool?.discarded || []).length,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <AdminPanel
            settings={settings}
            characterPool={characterPool}
            onUpdateSettings={updateSettings}
            onAddCharacter={addCharacter}
            onEditCharacter={editCharacter}
            onDeleteCharacter={removeCharacter}
            onResetDatabase={wipeCharacters}
            onSeedDefaultCharacters={seedDefaults}
            showToast={showToast}
          />
        )}
      </main>

      <ConnectedUsersModal
        isOpen={connectedModalOpen}
        onClose={closeConnectedModal}
        connectedUsers={users}
        mySlot={mySlot}
      />

      <CharacterPoolModal
        isOpen={poolModalOpen}
        onClose={closePoolModal}
        initialTab={poolModalTab}
        available={characterPool?.available || []}
        discarded={characterPool?.discarded || []}
        used={characterPool?.used || []}
        players={players}
      />

      <footer className="bg-[#090b12] border-t-2 border-slate-800/80 py-3 px-4 text-center text-xs font-['Chakra_Petch'] text-slate-500">
        Arcade Auction PvP &copy; 2026 &bull; Subasta de Personajes Gamificada
        &bull; React + Tailwind + Supabase
      </footer>
    </div>
  );
}
