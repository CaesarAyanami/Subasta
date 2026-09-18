import { create } from "zustand";
import {
  getOrCreateMainGame,
  fetchGameSnapshot,
  takeSlot,
  releaseSlot,
  refreshSlotLock,
  toggleReady,
  updatePlayerName,
  startAuction,
  markAuctionBidding,
  placeBid,
  updateTimerLocal,
  finalizeAuction,
  resetAuctionToIdle,
  toggleFinishRequest,
  castVote,
  cancelVote,
  advanceRound,
  updateGameSettings,
} from "../services/gameService";
import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
  seedDefaultCharacters,
  deleteAllCharacters,
} from "../services/characterService";
import {
  supabase,
  isSupabaseConfigured,
  CLIENT_ID,
  DEFAULT_SETTINGS,
  MAX_INVENTORY_SLOTS,
} from "../services/supabaseClient";

// ============================================================================
// CONSTANTES DE HEARTBEAT
// ============================================================================
const HEARTBEAT_INTERVAL_MS = 15000;

// ============================================================================
// ESTADO INICIAL
// ============================================================================
const EMPTY_STATE = {
  loading: true,
  error: null,
  game: null,
  settings: { ...DEFAULT_SETTINGS },
  players: { player1: null, player2: null },
  auction: {
    status: "IDLE",
    current_character_id: null,
    current_bid: 0,
    highest_bidder_slot: null,
    time_left: 20,
    timer_running: false,
    min_price: 0,
  },
  characterPool: { available: [], used: [], discarded: [] },
  roundVotes: { player1: null, player2: null },
  mySlot: null,
};

// ============================================================================
// VARIABLES DE MÓDULO
// ============================================================================
let heartbeatTimer = null;
let beforeUnloadHandler = null;

// ============================================================================
// STORE
// ============================================================================
export const useGameStore = create((set, get) => ({
  ...EMPTY_STATE,

  // --------------------------------------------------------------------------
  // INIT
  // --------------------------------------------------------------------------
  async init() {
    if (!isSupabaseConfigured) {
      set({ loading: false, error: "Supabase no configurado" });
      return;
    }

    try {
      set({ loading: true, error: null });
      const game = await getOrCreateMainGame();
      const snapshot = await fetchGameSnapshot(game.id);

      set({
        ...snapshot,
        loading: false,
      });

      get().subscribeRealtime(game.id);
      get().tryRecoverSlot();

      if (!beforeUnloadHandler) {
        beforeUnloadHandler = () => {
          const { game: g, mySlot: slot } = get();
          if (!g || !slot) return;
          releaseSlot(g.id, slot).catch(() => {});
        };
        window.addEventListener("beforeunload", beforeUnloadHandler);
      }
    } catch (err) {
      console.error("[gameStore.init]", err);
      set({ loading: false, error: err.message || "Error al inicializar" });
    }
  },

  // --------------------------------------------------------------------------
  // RECUPERAR SLOT
  // --------------------------------------------------------------------------
  async tryRecoverSlot() {
    const { game, players } = get();
    if (!game) return;

    for (const slot of ["player1", "player2"]) {
      const p = players[slot];
      if (p?.client_id === CLIENT_ID) {
        set({ mySlot: slot });
        get().startHeartbeat(slot);
        return;
      }
    }
  },

  // --------------------------------------------------------------------------
  // HEARTBEAT
  // --------------------------------------------------------------------------
  startHeartbeat(slot) {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    heartbeatTimer = setInterval(async () => {
      const { game: g, mySlot: currentSlot } = get();
      if (!g || !currentSlot) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        return;
      }

      try {
        await refreshSlotLock(g.id, currentSlot);
      } catch (err) {
        console.warn("[heartbeat]", err);
      }
    }, HEARTBEAT_INTERVAL_MS);
  },

  stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  },

  // --------------------------------------------------------------------------
  // REALTIME
  // --------------------------------------------------------------------------
  realtimeChannel: null,

  subscribeRealtime(gameId) {
    const existing = get().realtimeChannel;
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${gameId}` },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_auction", filter: `game_id=eq.${gameId}` },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_pool", filter: `game_id=eq.${gameId}` },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_votes", filter: `game_id=eq.${gameId}` },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_inventory", filter: `game_id=eq.${gameId}` },
        () => get().refreshSnapshot()
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  // --------------------------------------------------------------------------
  // REFRESH SNAPSHOT
  // --------------------------------------------------------------------------
  refreshing: false,
  pendingRefresh: false,

  async refreshSnapshot() {
    if (get().refreshing) {
      set({ pendingRefresh: true });
      return;
    }

    set({ refreshing: true, pendingRefresh: false });

    try {
      const gameId = get().game?.id;
      if (gameId) {
        const snapshot = await fetchGameSnapshot(gameId);
        set({ ...snapshot });
      }
    } catch (err) {
      console.warn("[refreshSnapshot]", err);
    } finally {
      set({ refreshing: false });

      if (get().pendingRefresh) {
        set({ pendingRefresh: false });
        setTimeout(() => get().refreshSnapshot(), 0);
      }
    }
  },

  // --------------------------------------------------------------------------
  // SLOTS — Tomar / Cambiar / Liberar
  // --------------------------------------------------------------------------
  async takeSlot(slot) {
    const gameId = get().game?.id;
    if (!gameId) return;

    const currentSlot = get().mySlot;

    // Si ya tienes este slot → no hacer nada
    if (currentSlot === slot) return;

    // Si ya tienes otro slot → primero liberar el actual
    if (currentSlot && currentSlot !== slot) {
      try {
        get().stopHeartbeat();
        await releaseSlot(gameId, currentSlot);
        set({ mySlot: null });
      } catch (err) {
        console.warn("[takeSlot] release previous:", err);
      }
    }

    // Ahora tomar el nuevo slot
    try {
      await takeSlot(gameId, slot);
      set({ mySlot: slot });
      get().startHeartbeat(slot);
      await get().refreshSnapshot();
    } catch (err) {
      console.error("[takeSlot]", err);
      // Si falló, refrescar para que la UI refleje el estado real
      await get().refreshSnapshot();
      throw err;
    }
  },

  // Volver a espectador (liberar slot sin tomar otro)
  async becomeSpectator() {
    const { game, mySlot } = get();
    if (!game || !mySlot) return;

    try {
      get().stopHeartbeat();
      await releaseSlot(game.id, mySlot);
      set({ mySlot: null });
      await get().refreshSnapshot();
    } catch (err) {
      console.warn("[becomeSpectator]", err);
      throw err;
    }
  },

  // Alias retrocompatible
  async releaseMySlot() {
    return get().becomeSpectator();
  },

  // --------------------------------------------------------------------------
  // JUGADOR
  // --------------------------------------------------------------------------
  async updatePlayerName(slot, name) {
    const gameId = get().game?.id;
    if (!gameId) return;
    await updatePlayerName(gameId, slot, name);
    await get().refreshSnapshot();
  },

  async toggleReady(slot) {
    const { game, players } = get();
    if (!game) return;

    const current = players[slot]?.ready;
    await toggleReady(game.id, slot, !current);
    await get().refreshSnapshot();

    const fresh = get().players;
    if (fresh.player1?.ready && fresh.player2?.ready) {
      await get().startAuction();
    }
  },

  // --------------------------------------------------------------------------
  // SUBASTA
  // --------------------------------------------------------------------------
  async startAuction() {
    const gameId = get().game?.id;
    if (!gameId) return;
    try {
      await startAuction(gameId);
      await get().refreshSnapshot();
    } catch (err) {
      console.error("[startAuction]", err);
      throw err;
    }
  },

  async markAuctionBidding() {
    const gameId = get().game?.id;
    if (!gameId) return;
    await markAuctionBidding(gameId);
    await get().refreshSnapshot();
  },

  async placeBid(slot, amount) {
    const gameId = get().game?.id;
    if (!gameId) return;
    try {
      await placeBid(gameId, slot, amount);
      await get().refreshSnapshot();
    } catch (err) {
      console.error("[placeBid]", err);
      throw err;
    }
  },

  async updateTimerLocal(timeLeft) {
    const gameId = get().game?.id;
    if (!gameId) return;
    set((s) => ({ auction: { ...s.auction, time_left: timeLeft } }));
    try {
      await updateTimerLocal(gameId, timeLeft);
    } catch (err) {
      console.warn("[updateTimerLocal]", err);
    }
  },

  async finalizeAuction() {
    const gameId = get().game?.id;
    if (!gameId) return;
    try {
      await finalizeAuction(gameId);
      await get().refreshSnapshot();
      setTimeout(() => {
        get().resetAuctionToIdle();
      }, 3500);
    } catch (err) {
      console.error("[finalizeAuction]", err);
    }
  },

  async resetAuctionToIdle() {
    const gameId = get().game?.id;
    if (!gameId) return;
    await resetAuctionToIdle(gameId);
    await get().refreshSnapshot();
  },

  async toggleFinishRequest(slot) {
    const { game, players } = get();
    if (!game) return;
    const current = players[slot]?.finish_requested;
    await toggleFinishRequest(game.id, slot, !current);
    await get().refreshSnapshot();

    const fresh = get().players;
    if (fresh.player1?.finish_requested && fresh.player2?.finish_requested) {
      await get().finalizeAuction();
    }
  },

  // --------------------------------------------------------------------------
  // VOTOS FIN DE RONDA
  // --------------------------------------------------------------------------
  async castVote(slot, action) {
    const gameId = get().game?.id;
    if (!gameId) return;
    const result = await castVote(gameId, slot, action);
    await get().refreshSnapshot();
    return result;
  },

  async cancelVote(slot) {
    const gameId = get().game?.id;
    if (!gameId) return;
    await cancelVote(gameId, slot);
    await get().refreshSnapshot();
  },

  async advanceRound(mode) {
    const gameId = get().game?.id;
    if (!gameId) return;
    await advanceRound(gameId, mode);
    await get().refreshSnapshot();
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  async updateSettings(newSettings) {
    const gameId = get().game?.id;
    if (!gameId) return;
    await updateGameSettings(gameId, newSettings);
    await get().refreshSnapshot();
  },

  // --------------------------------------------------------------------------
  // PERSONAJES (admin)
  // --------------------------------------------------------------------------
  async addCharacter(input) {
    const gameId = get().game?.id;
    await createCharacter(input, gameId);
    await get().refreshSnapshot();
  },

  async editCharacter(id, input) {
    await updateCharacter(id, input);
    await get().refreshSnapshot();
  },

  async removeCharacter(id) {
    await deleteCharacter(id);
    await get().refreshSnapshot();
  },

  async seedDefaults() {
    const gameId = get().game?.id;
    await seedDefaultCharacters(gameId);
    await get().refreshSnapshot();
  },

  async wipeCharacters() {
    await deleteAllCharacters();
    await get().refreshSnapshot();
  },

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------
  async destroy() {
    get().stopHeartbeat();

    if (beforeUnloadHandler) {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      beforeUnloadHandler = null;
    }

    const { game, mySlot } = get();
    if (game && mySlot) {
      try {
        await releaseSlot(game.id, mySlot);
      } catch (err) {
        console.warn("[destroy] releaseSlot:", err);
      }
    }

    const channel = get().realtimeChannel;
    if (channel) {
      await supabase.removeChannel(channel);
      set({ realtimeChannel: null });
    }
  },
}));

// ============================================================================
// SELECTORES ÚTILES
// ============================================================================
export const selectIsMyTurn = (slot) => (state) => state.mySlot === slot;

export const selectCanStartAuction = (state) =>
  state.players.player1?.ready &&
  state.players.player2?.ready &&
  state.auction.status === "IDLE";

export const selectCanAdvanceRound = (state) =>
  (state.players.player1?.inventory?.length || 0) >= MAX_INVENTORY_SLOTS &&
  (state.players.player2?.inventory?.length || 0) >= MAX_INVENTORY_SLOTS;
