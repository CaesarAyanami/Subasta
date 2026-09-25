import { create } from "zustand";
import sounds from "../services/soundEffects";

let toastTimeout = null;

export const useUIStore = create((set, get) => ({
  // ==========================================================================
  // NAVEGACIÓN
  // ==========================================================================
  currentView: "board", // 'board' | 'admin'

  // ==========================================================================
  // MODALES
  // ==========================================================================
  connectedModalOpen: false,
  poolModalOpen: false,
  poolModalTab: "available",
  probabilityModalOpen: false,
  infoModalOpen: false,
  infoModalCharacter: null,

  // ==========================================================================
  // SONIDO
  // ==========================================================================
  soundMuted: sounds.isMuted(),

  // ==========================================================================
  // TOAST
  // ==========================================================================
  toast: null,

  // ==========================================================================
  // ACCIONES — NAVEGACIÓN
  // ==========================================================================
  setView(view) {
    set({ currentView: view });
  },

  // ==========================================================================
  // ACCIONES — MODAL DE USUARIOS CONECTADOS
  // ==========================================================================
  openConnectedModal() {
    set({ connectedModalOpen: true });
  },
  closeConnectedModal() {
    set({ connectedModalOpen: false });
  },

  // ==========================================================================
  // ACCIONES — MODAL DE POOL DE PERSONAJES
  // ==========================================================================
  openPoolModal(tab = "available") {
    set({ poolModalOpen: true, poolModalTab: tab });
  },
  closePoolModal() {
    set({ poolModalOpen: false });
  },

  // ==========================================================================
  // ACCIONES — MODAL DE PROBABILIDADES
  // ==========================================================================
  openProbabilityModal() {
    set({ probabilityModalOpen: true });
  },
  closeProbabilityModal() {
    set({ probabilityModalOpen: false });
  },

  // ==========================================================================
  // ACCIONES — MODAL DE INFO DE PERSONAJE
  // ==========================================================================
  openInfoModal(character) {
    set({ infoModalOpen: true, infoModalCharacter: character });
  },
  closeInfoModal() {
    set({ infoModalOpen: false, infoModalCharacter: null });
  },

  // ==========================================================================
  // ACCIONES — SONIDO
  // ==========================================================================
  toggleSound() {
    const muted = sounds.toggleMute();
    set({ soundMuted: muted });
    get().showToast(
      "AUDIO",
      muted ? "Efectos silenciados" : "Efectos activados",
      "info",
      1500
    );
  },

  // ==========================================================================
  // ACCIONES — TOAST
  // ==========================================================================
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