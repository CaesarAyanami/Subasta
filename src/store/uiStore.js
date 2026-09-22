import { create } from "zustand";
import sounds from "../services/soundEffects";

let toastTimeout = null;

export const useUIStore = create((set, get) => ({
  // Navegación
  currentView: "board", // 'board' | 'admin'

  // Modales
  connectedModalOpen: false,
  poolModalOpen: false,
  poolModalTab: "available",

  // Sonido
  soundMuted: sounds.isMuted(),

  // Toast
  toast: null,

  setView(view) {
    set({ currentView: view });
  },

  openConnectedModal() {
    set({ connectedModalOpen: true });
  },
  closeConnectedModal() {
    set({ connectedModalOpen: false });
  },

  openPoolModal(tab = "available") {
    set({ poolModalOpen: true, poolModalTab: tab });
  },
  closePoolModal() {
    set({ poolModalOpen: false });
  },

  toggleSound() {
    const muted = sounds.toggleMute();
    set({ soundMuted: muted });
    get().showToast("AUDIO", muted ? "Efectos silenciados" : "Efectos activados", "info", 1500);
  },

  showToast(title, message, type = "info", duration = 3000) {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toast: { title, message, type, id: Date.now() } });
    toastTimeout = setTimeout(() => {
      set({ toast: null });
      toastTimeout = null;
    }, duration);
  },

  hideToast() {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toast: null });
  },
}));