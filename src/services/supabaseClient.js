import { createClient } from "@supabase/supabase-js";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseUrl = rawUrl
  .replace(/\/(rest(\/v1\/?)?|graphql\/?|auth\/?|storage\/.*)?$/, "")
  .replace(/\/$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("TU_SUPABASE_URL")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    })
  : null;

// ============================================================================
// IDENTIDAD DEL CLIENTE (persistente en localStorage)
// ============================================================================
const CLIENT_ID_KEY = "arcade_auction_client_id";

function getOrCreateClientId() {
  if (typeof window === "undefined") return "server_" + Math.random().toString(36).slice(2, 9);
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "user_" + Math.random().toString(36).substring(2, 11);
  }
}

export const CLIENT_ID = getOrCreateClientId();

// ============================================================================
// HELPER: lanzar error legible desde respuesta Supabase
// ============================================================================
export function unwrap({ data, error }) {
  if (error) {
    const msg = error.message || error.hint || error.details || "Error desconocido en Supabase";
    console.error("[Supabase Error]", error);
    throw new Error(msg);
  }
  return data;
}

// ============================================================================
// AJUSTES POR DEFECTO DEL JUEGO
// ============================================================================
export const DEFAULT_SETTINGS = {
  initialCoins: 20,
  auctionTime: 20,
  animationType: "roulette",
  soundEnabled: true,
  pityThreshold: 20,
  antiSnipeSeconds: 3,
  antiSnipeExtension: 5,
  winStreakBonus: 3,
};

export const MAX_INVENTORY_SLOTS = 4;