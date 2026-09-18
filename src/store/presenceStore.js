import { create } from "zustand";
import { supabase, isSupabaseConfigured, CLIENT_ID } from "../services/supabaseClient";

export const usePresenceStore = create((set, get) => ({
  users: [],
  channel: null,

  async init() {
    if (!isSupabaseConfigured) return;

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
			await channel.track({
			  id: CLIENT_ID,
			  name: "Invitado",
			  slot: null, // spectator por defecto
			  onlineAt: Date.now(),
			});
		  }
		});

    set({ channel });
  },

  async updatePresence(payload) {
	  const channel = get().channel;
	  if (!channel) return;
	  try {
		await channel.track({
		  id: CLIENT_ID,
		  onlineAt: Date.now(),
		  ...payload,
		});
	  } catch (err) {
		console.warn("[presence.update]", err);
	  }
	},

  async destroy() {
    const channel = get().channel;
    if (channel) {
      await supabase.removeChannel(channel);
      set({ channel: null, users: [] });
    }
  },
}));