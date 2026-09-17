import { createClient } from "@supabase/supabase-js";
import { DEFAULT_CHARACTERS } from "./defaultCharacters";

// Variables de entorno de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("TU_SUPABASE_URL")
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// ESTADO INICIAL COMPLETO DEL JUEGO
// ==========================================
export const INITIAL_GAME_STATE = {
  settings: {
    initialCoins: 20,
    auctionTime: 20,
    animationType: "roulette", // 'roulette' | 'slot' | 'card_flip'
    soundEnabled: true
  },
  players: {
    player1: {
      name: "Jugador 1",
      coins: 20,
      ready: false,
      finishRequested: false,
      inventory: []
    },
    player2: {
      name: "Jugador 2",
      coins: 20,
      ready: false,
      finishRequested: false,
      inventory: []
    }
  },
  auction: {
    status: "IDLE", // 'IDLE' | 'SELECTING' | 'BIDDING' | 'SOLD' | 'DISCARDED'
    currentCharacter: null,
    minAcceptancePrice: 0,
    currentBid: 0,
    highestBidder: null,
    timeLeft: 20,
    timerRunning: false
  },
  characterPool: {
    available: DEFAULT_CHARACTERS,
    used: [],
    discarded: []
  },
  roundVotes: {
    player1: null, // 'next' | 'next_discarded' | 'reset' | null
    player2: null
  },
  auctionLog: []
};

// ID único para la presencia del cliente actual
export const CLIENT_ID = "user_" + Math.random().toString(36).substring(2, 9);

// Canal de Supabase Realtime (Presence + Broadcast + Postgres Changes)
let realtimeChannel = null;
let presenceListeners = [];
let stateListeners = [];

// Fallback LocalStorage & BroadcastChannel si las credenciales de Supabase no están en .env
const LOCAL_STORAGE_KEY = "arcade_auction_supabase_local_state";
const localChannel = typeof window !== "undefined" && window.BroadcastChannel 
  ? new BroadcastChannel("arcade_auction_local_sync") 
  : null;

function getLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_GAME_STATE));
  return INITIAL_GAME_STATE;
}

function setLocalState(state) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    if (localChannel) {
      localChannel.postMessage({ type: "STATE_SYNC", state });
    }
  } catch (e) {}
}

// ==========================================
// SUSCRIPCIÓN EN TIEMPO REAL AL ESTADO
// ==========================================
export function subscribeToGameState(callback) {
  stateListeners.push(callback);

  if (isSupabaseConfigured && supabase) {
    // 1. Obtener estado inicial desde la tabla game_state
    supabase
      .from("game_state")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          const loaded = {
            settings: data.settings || INITIAL_GAME_STATE.settings,
            players: data.players || INITIAL_GAME_STATE.players,
            auction: data.auction || INITIAL_GAME_STATE.auction,
            characterPool: data.character_pool || INITIAL_GAME_STATE.characterPool,
            roundVotes: data.round_votes || INITIAL_GAME_STATE.roundVotes,
            auctionLog: data.auction_log || []
          };
          callback(loaded);
        } else {
          // Si la fila 'main' no existe aún, la creamos
          supabase
            .from("game_state")
            .upsert({
              id: "main",
              settings: INITIAL_GAME_STATE.settings,
              players: INITIAL_GAME_STATE.players,
              auction: INITIAL_GAME_STATE.auction,
              character_pool: INITIAL_GAME_STATE.characterPool,
              round_votes: INITIAL_GAME_STATE.roundVotes,
              updated_at: new Date().toISOString()
            })
            .then(() => callback(INITIAL_GAME_STATE));
        }
      })
      .catch(() => callback(INITIAL_GAME_STATE));

    // 2. Suscribirse a cambios en tiempo real vía Postgres Changes & Broadcast
    if (!realtimeChannel) {
      initRealtimeChannel();
    }
  } else {
    // Modo local seguro
    const current = getLocalState();
    callback(current);

    const handleBroadcast = (e) => {
      if (e.data && e.data.type === "STATE_SYNC" && e.data.state) {
        callback(e.data.state);
      }
    };
    if (localChannel) {
      localChannel.addEventListener("message", handleBroadcast);
    }
  }

  return () => {
    stateListeners = stateListeners.filter(l => l !== callback);
  };
}

// ==========================================
// INICIALIZACIÓN DEL CANAL SUPABASE REALTIME
// ==========================================
function initRealtimeChannel() {
  if (!supabase || !isSupabaseConfigured) return;

  realtimeChannel = supabase.channel("auction_room", {
    config: {
      presence: { key: CLIENT_ID },
      broadcast: { ack: false }
    }
  });

  // Escuchar cambios en la tabla Postgres
  realtimeChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "game_state", filter: "id=eq.main" },
      (payload) => {
        if (payload.new) {
          const normalized = {
            settings: payload.new.settings || INITIAL_GAME_STATE.settings,
            players: payload.new.players || INITIAL_GAME_STATE.players,
            auction: payload.new.auction || INITIAL_GAME_STATE.auction,
            characterPool: payload.new.character_pool || INITIAL_GAME_STATE.characterPool,
            roundVotes: payload.new.round_votes || INITIAL_GAME_STATE.roundVotes,
            auctionLog: payload.new.auction_log || []
          };
          stateListeners.forEach(fn => fn(normalized));
        }
      }
    )
    // Escuchar broadcast instantáneo para evitar latencia de base de datos
    .on("broadcast", { event: "game_sync" }, ({ payload }) => {
      if (payload) {
        stateListeners.forEach(fn => fn(payload));
      }
    })
    // Escuchar presencia de usuarios conectados
    .on("presence", { event: "sync" }, () => {
      const state = realtimeChannel.presenceState();
      const userList = [];
      Object.keys(state).forEach((key) => {
        state[key].forEach((u) => userList.push(u));
      });
      presenceListeners.forEach(fn => fn(userList));
    })
    .subscribe();
}

// ==========================================
// ACTUALIZAR EL ESTADO (SYNC DATABASE + BROADCAST)
// ==========================================
export async function syncGameState(newState) {
  // Notificar a escuchas locales
  stateListeners.forEach(fn => fn(newState));

  if (isSupabaseConfigured && supabase) {
    // 1. Emitir broadcast instantáneo a todos los clientes
    if (realtimeChannel) {
      realtimeChannel.send({
        type: "broadcast",
        event: "game_sync",
        payload: newState
      });
    }

    // 2. Persistir en la base de datos Supabase
    try {
      await supabase.from("game_state").upsert({
        id: "main",
        settings: newState.settings,
        players: newState.players,
        auction: newState.auction,
        character_pool: newState.characterPool,
        round_votes: newState.roundVotes || INITIAL_GAME_STATE.roundVotes,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Error guardando en Supabase:", err);
    }
  } else {
    // Persistencia local
    setLocalState(newState);
  }
}

// ==========================================
// SISTEMA DE PRESENCIA (USUARIOS CONECTADOS)
// ==========================================
export function trackPresence(userData) {
  if (isSupabaseConfigured && realtimeChannel) {
    realtimeChannel.track({
      id: CLIENT_ID,
      name: userData.name || "Espectador Anónimo",
      role: userData.role || "spectator",
      onlineAt: Date.now()
    });
  } else {
    // Presencia local para pruebas
    const fakeList = [
      {
        id: CLIENT_ID,
        name: userData.name || "Tú",
        role: userData.role || "spectator",
        onlineAt: Date.now()
      }
    ];
    presenceListeners.forEach(fn => fn(fakeList));
  }
}

export function onPresenceSync(callback) {
  presenceListeners.push(callback);
  return () => {
    presenceListeners = presenceListeners.filter(l => l !== callback);
  };
}
