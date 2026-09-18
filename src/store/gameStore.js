import { create } from "zustand";
import {
  getOrCreateMainGame,
  fetchGameSnapshot,
  takeSlot,
  releaseSlot,
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
  mySlot: null, // 'player1' | 'player2' | null (spectator)
};

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

      // Suscribirse a Realtime
      get().subscribeRealtime(game.id);

      // Intentar recuperar slot automáticamente (si este client ya lo tenía)
      get().tryRecoverSlot();
    } catch (err) {
      console.error("[gameStore.init]", err);
      set({ loading: false, error: err.message || "Error al inicializar" });
    }
  },

  // --------------------------------------------------------------------------
  // RECUPERAR SLOT (si el cliente ya lo tenía reservado en BD)
  // --------------------------------------------------------------------------
  async tryRecoverSlot() {
    const { game, players } = get();
    if (!game) return;

    for (const slot of ["player1", "player2"]) {
      const p = players[slot];
      if (p?.client_id === CLIENT_ID) {
        set({ mySlot: slot });
        return;
      }
    }
  },

  // --------------------------------------------------------------------------
  // REALTIME
  // --------------------------------------------------------------------------
  realtimeChannel: null,

  subscribeRealtime(gameId) {
    // Evitar doble suscripción
    const existing = get().realtimeChannel;
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_auction",
          filter: `game_id=eq.${gameId}`,
        },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_pool",
          filter: `game_id=eq.${gameId}`,
        },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_votes",
          filter: `game_id=eq.${gameId}`,
        },
        () => get().refreshSnapshot()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_inventory",
          filter: `game_id=eq.${gameId}`,
        },
        () => get().refreshSnapshot()
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  // --------------------------------------------------------------------------
  // REFRESH SNAPSHOT (llamado por realtime)
  // --------------------------------------------------------------------------
  refreshing: false,

  async refreshSnapshot() {
    // Evitar solapamiento de refreshes
    if (get().refreshing) return;
    set({ refreshing: true });

    try {
      const gameId = get().game?.id;
      if (!gameId) return;
      const snapshot = await fetchGameSnapshot(gameId);
      set({ ...snapshot });
    } catch (err) {
      console.warn("[refreshSnapshot]", err);
    } finally {
      set({ refreshing: false });
    }
  },

  // --------------------------------------------------------------------------
  // SLOTS
  // --------------------------------------------------------------------------
  async takeSlot(slot) {
    const gameId = get().game?.id;
    if (!gameId) return;
    if (get().mySlot) throw new Error("Ya tienes un slot asignado");

    try {
      await takeSlot(gameId, slot);
      set({ mySlot: slot });
      await get().refreshSnapshot();
    } catch (err) {
      console.error("[takeSlot]", err);
      throw err;
    }
  },

  async releaseMySlot() {
    const { game, mySlot } = get();
    if (!game || !mySlot) return;
    try {
      await releaseSlot(game.id, mySlot);
      set({ mySlot: null });
      await get().refreshSnapshot();
    } catch (err) {
      console.warn("[releaseMySlot]", err);
    }
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

    // Si ambos están ready → arrancar subasta
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
    // Optimista local — no esperamos al servidor para el tick
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
      // Volver a IDLE pasados 3s
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

    // Si ambos piden terminar → finalizar
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
    return result; // { both_agree }
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