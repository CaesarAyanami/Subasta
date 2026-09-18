import { create } from "zustand";
import { supabase, isSupabaseConfigured, CLIENT_ID } from "../services/supabaseClient";

export const usePresenceStore = create((set, get) => ({
  users: [],
  channel: null,
  ready: false,             // ← NUEVO: indica si el canal está suscrito
  pendingPayload: null,     // ← NUEVO: guarda el último payload si el canal no está listo

  async init() {
    if (!isSupabaseConfigured) return;

    // Si ya hay un canal, limpiarlo antes de crear uno nuevo
    const existing = get().channel;
    if (existing) {
      await supabase.removeChannel(existing);
    }

    const channel = supabase.channel("presence:lobby", {
      config: {
        presence: { key: CLIENT_ID },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const list = [];
        for (const key of Object.keys(state)) {
          for (const u of state[key]) list.push(u);
        }
        set({ users: list });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // 1. Marcar canal como listo
          set({ ready: true });

          // 2. Hacer track inicial
          const initialPayload = {
            id: CLIENT_ID,
            name: "Invitado",
            slot: null,
            onlineAt: Date.now(),
          };
          await channel.track(initialPayload);

          // 3. Si había un payload pendiente (porque updatePresence se llamó
          //    antes de que el canal estuviera listo), aplicarlo ahora
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

  async updatePresence(payload) {
    const channel = get().channel;
    const isReady = get().ready;

    if (!channel || !isReady) {
      // El canal aún no está suscrito → guardar payload pendiente
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
      // Si falló, dejar el payload pendiente para reintentar cuando el
      // canal vuelva a estar listo
      set({ pendingPayload: payload });
    }
  },

  async destroy() {
    const channel = get().channel;
    if (channel) {
      await supabase.removeChannel(channel);
      set({ channel: null, users: [], ready: false, pendingPayload: null });
    }
  },
}));