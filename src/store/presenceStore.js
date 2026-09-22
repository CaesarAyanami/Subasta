import { create } from "zustand";
import { supabase, isSupabaseConfigured, CLIENT_ID } from "../services/supabaseClient";
import { releaseSlotByClient } from "../services/gameService";

// ============================================================================
// CONSTANTES
// ============================================================================
const LEAVE_GRACE_PERIOD_MS = 5000; // 5s de gracia antes de liberar el slot

// ============================================================================
// TIMERS DE LIBERACIÓN PENDIENTES
// Map<clientId, timeoutId>
// Cuando un cliente se va, programamos la liberación. Si vuelve antes de 5s,
// cancelamos el timeout.
// ============================================================================
const pendingReleases = new Map();

// ============================================================================
// STORE
// ============================================================================
export const usePresenceStore = create((set, get) => ({
  users: [],
  channel: null,
  ready: false,
  pendingPayload: null,
  gameId: null, // ← guardamos el gameId para poder liberar slots

  async init() {
    if (!isSupabaseConfigured) return;

    // Si ya hay un canal, limpiarlo antes de crear uno nuevo
    const existing = get().channel;
    if (existing) {
      await supabase.removeChannel(existing);
    }

    // Capturar el gameId actual del gameStore para usarlo en releaseSlotByClient
    // (Se puede pasar como parámetro a init en el futuro si quieres)
    // Por ahora, lo recibimos vía setGameId()

    const channel = supabase.channel("presence:lobby", {
      config: {
        presence: { key: CLIENT_ID },
      },
    });

    // ========================================================================
    // Guardar snapshot previo para detectar quién se fue
    // ========================================================================
    let previousUserIds = new Set();

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const list = [];
        for (const key of Object.keys(state)) {
          for (const u of state[key]) list.push(u);
        }

        // Detectar quién se fue (estaba antes y ya no está)
        const currentUserIds = new Set(list.map((u) => u.id));
        for (const prevId of previousUserIds) {
          if (!currentUserIds.has(prevId) && prevId !== CLIENT_ID) {
            // Alguien se fue → programar liberación
            get().scheduleSlotRelease(prevId);
          }
        }

        // Detectar quién volvió (no está en previous y sí en current)
        for (const currId of currentUserIds) {
          if (!previousUserIds.has(currId) && currId !== CLIENT_ID) {
            // Alguien volvió → cancelar liberación pendiente
            get().cancelSlotRelease(currId);
          }
        }

        previousUserIds = currentUserIds;
        set({ users: list });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          set({ ready: true });

          const initialPayload = {
            id: CLIENT_ID,
            name: "Invitado",
            slot: null,
            onlineAt: Date.now(),
          };
          await channel.track(initialPayload);

          // Aplicar payload pendiente si lo hay
          const pending = get().pendingPayload;
          if (pending) {
            try {
              await channel.track({
                id: CLIENT_ID,
                onlineAt: Date.now(),
                ...pending,
              });
            } catch (err) {
              console.warn("[presence] No se pudo aplicar payload pendiente:", err);
            }
            set({ pendingPayload: null });
          }
        } else {
          set({ ready: false });
        }
      });

    set({ channel, ready: false });
  },

  // ==========================================================================
  // FIJAR EL GAME ID (llamado desde App.jsx o gameStore)
  // ==========================================================================
  setGameId(gameId) {
    set({ gameId });
  },

  // ==========================================================================
  // PROGRAMAR LIBERACIÓN DE SLOT (con margen de 5s)
  // ==========================================================================
  scheduleSlotRelease(clientId) {
    if (!clientId) return;

    // Si ya hay una liberación programada para este cliente, no duplicar
    if (pendingReleases.has(clientId)) return;

    const timer = setTimeout(async () => {
      pendingReleases.delete(clientId);

      const { gameId } = get();
      if (!gameId) {
        console.warn("[presence] No hay gameId, no se puede liberar slot");
        return;
      }

      try {
        await releaseSlotByClient(gameId, clientId);
        console.log(`[presence] Slot liberado para cliente desconectado: ${clientId}`);
      } catch (err) {
        console.warn("[presence] Error liberando slot:", err);
      }
    }, LEAVE_GRACE_PERIOD_MS);

    pendingReleases.set(clientId, timer);
  },

  // ==========================================================================
  // CANCELAR LIBERACIÓN (si el cliente volvió antes de 5s)
  // ==========================================================================
  cancelSlotRelease(clientId) {
    if (!clientId) return;
    const timer = pendingReleases.get(clientId);
    if (timer) {
      clearTimeout(timer);
      pendingReleases.delete(clientId);
      console.log(`[presence] Cliente volvió, cancelada liberación: ${clientId}`);
    }
  },

  // ==========================================================================
  // ACTUALIZAR PRESENCE (track)
  // ==========================================================================
  async updatePresence(payload) {
    const channel = get().channel;
    const isReady = get().ready;

    if (!channel || !isReady) {
      set({ pendingPayload: payload });
      return;
    }

    try {
      await channel.track({
        id: CLIENT_ID,
        onlineAt: Date.now(),
        ...payload,
      });
    } catch (err) {
      console.warn("[presence.update]", err);
      set({ pendingPayload: payload });
    }
  },

  // ==========================================================================
  // DESTROY
  // ==========================================================================
  async destroy() {
    // Cancelar todas las liberaciones pendientes
    for (const timer of pendingReleases.values()) {
      clearTimeout(timer);
    }
    pendingReleases.clear();

    const channel = get().channel;
    if (channel) {
      await supabase.removeChannel(channel);
      set({
        channel: null,
        users: [],
        ready: false,
        pendingPayload: null,
        gameId: null,
      });
    }
  },
}));
