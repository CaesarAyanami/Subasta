import { supabase, unwrap, isSupabaseConfigured, CLIENT_ID, DEFAULT_SETTINGS } from "./supabaseClient";

// ============================================================================
// CREAR / OBTENER PARTIDA
// ============================================================================
export async function getOrCreateMainGame() {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  const existing = unwrap(
    await supabase.from("games").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle()
  );

  if (existing) return existing;

  // Crear partida nueva
  const game = unwrap(
    await supabase.from("games").insert({ status: "lobby" }).select().single()
  );

  // Crear 2 jugadores
  await supabase.from("game_players").insert([
    { game_id: game.id, slot: "player1", name: "Jugador 1", coins: DEFAULT_SETTINGS.initialCoins },
    { game_id: game.id, slot: "player2", name: "Jugador 2", coins: DEFAULT_SETTINGS.initialCoins },
  ]);

  // Añadir todos los personajes al pool
  const { data: chars } = await supabase.from("characters").select("id");
  if (chars?.length) {
    await supabase.from("game_pool").insert(
      chars.map((c) => ({ game_id: game.id, character_id: c.id, state: "available" }))
    );
  }

  // Crear subasta inicial
  await supabase.from("game_auction").insert({
    game_id: game.id,
    status: "IDLE",
    time_left: DEFAULT_SETTINGS.auctionTime,
  });

  return game;
}

// ============================================================================
// SNAPSHOT COMPLETO DE LA PARTIDA
// ============================================================================
export async function fetchGameSnapshot(gameId) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  const [gameRes, playersRes, auctionRes, poolRes, inventoryRes, votesRes] = await Promise.all([
    supabase.from("games").select("*").eq("id", gameId).maybeSingle(),
    supabase.from("game_players").select("*").eq("game_id", gameId).order("slot"),
    // ⚠️ FIX: JOIN con characters para traer el objeto completo de la subasta
    supabase
      .from("game_auction")
      .select("*, current_character:characters!game_auction_current_character_id_fkey(*)")
      .eq("game_id", gameId)
      .maybeSingle(),
    supabase.from("game_pool").select("*, character:characters(*)").eq("game_id", gameId),
    supabase.from("game_inventory").select("*, character:characters(*)").eq("game_id", gameId).order("won_at"),
    supabase.from("game_votes").select("*").eq("game_id", gameId),
  ]);

  const game = unwrap(gameRes);
  const players = unwrap(playersRes) || [];
  const auction = unwrap(auctionRes);
  const pool = unwrap(poolRes) || [];
  const inventory = unwrap(inventoryRes) || [];
  const votes = unwrap(votesRes) || [];

  // Separar pool por estado
  const available = pool.filter((p) => p.state === "available").map((p) => p.character);
  const used = pool.filter((p) => p.state === "used").map((p) => p.character);
  const discarded = pool.filter((p) => p.state === "discarded").map((p) => p.character);

  // Inventario por jugador
  const inventoryBySlot = { player1: [], player2: [] };
  for (const inv of inventory) {
    if (inventoryBySlot[inv.player_slot]) {
      inventoryBySlot[inv.player_slot].push({ ...inv.character, winningBid: inv.winning_bid, wonAt: inv.won_at });
    }
  }

  // Jugadores en formato {player1, player2}
  const playersMap = { player1: null, player2: null };
  for (const p of players) {
    playersMap[p.slot] = {
      ...p,
      inventory: inventoryBySlot[p.slot] || [],
    };
  }

  // Votos en formato {player1, player2}
  const votesMap = { player1: null, player2: null };
  for (const v of votes) {
    votesMap[v.player_slot] = v.action;
  }

  return {
    game,
    settings: { ...DEFAULT_SETTINGS, ...(game?.settings || {}) },
    players: playersMap,
    auction: auction || { status: "IDLE", time_left: 20, current_bid: 0 },
    characterPool: { available, used, discarded },
    roundVotes: votesMap,
  };
}

// ============================================================================
// SLOTS: tomar / liberar
// ============================================================================
export async function takeSlot(gameId, slot) {
  const data = unwrap(
    await supabase.rpc("take_slot", {
      p_game_id: gameId,
      p_slot: slot,
      p_client_id: CLIENT_ID,
    })
  );
  return data;
}

export async function releaseSlot(gameId, slot) {
  unwrap(
    await supabase.rpc("release_slot", {
      p_game_id: gameId,
      p_slot: slot,
      p_client_id: CLIENT_ID,
    })
  );
}

// ============================================================================
// READY + START AUCTION
// ============================================================================
export async function toggleReady(gameId, slot, isReady) {
  unwrap(
    await supabase
      .from("game_players")
      .update({ ready: isReady, updated_at: new Date().toISOString() })
      .eq("game_id", gameId)
      .eq("slot", slot)
  );
}

export async function updatePlayerName(gameId, slot, name) {
  unwrap(
    await supabase
      .from("game_players")
      .update({ name: name.trim() || "Jugador", updated_at: new Date().toISOString() })
      .eq("game_id", gameId)
      .eq("slot", slot)
  );
}

export async function startAuction(gameId) {
  const data = unwrap(await supabase.rpc("start_auction", { p_game_id: gameId }));
  return data;
}

export async function markAuctionBidding(gameId) {
  unwrap(
    await supabase
      .from("game_auction")
      .update({ status: "BIDDING", timer_running: true, updated_at: new Date().toISOString() })
      .eq("game_id", gameId)
  );
}

// ============================================================================
// PUJAS
// ============================================================================
export async function placeBid(gameId, slot, amount) {
  const data = unwrap(
    await supabase.rpc("place_bid", {
      p_game_id: gameId,
      p_slot: slot,
      p_amount: amount,
    })
  );
  return data;
}

export async function updateTimerLocal(gameId, timeLeft) {
  unwrap(
    await supabase
      .from("game_auction")
      .update({ time_left: timeLeft, updated_at: new Date().toISOString() })
      .eq("game_id", gameId)
  );
}

export async function finalizeAuction(gameId) {
  unwrap(await supabase.rpc("finalize_auction", { p_game_id: gameId }));
}

export async function resetAuctionToIdle(gameId) {
  unwrap(
    await supabase
      .from("game_auction")
      .update({
        status: "IDLE",
        current_character_id: null,
        min_price: 0,
        current_bid: 0,
        highest_bidder_slot: null,
        timer_running: false,
        updated_at: new Date().toISOString(),
      })
      .eq("game_id", gameId)
  );
}

// ============================================================================
// FINISH REQUEST (acuerdo mutuo para terminar la subasta)
// ============================================================================
export async function toggleFinishRequest(gameId, slot, requested) {
  unwrap(
    await supabase
      .from("game_players")
      .update({ finish_requested: requested, updated_at: new Date().toISOString() })
      .eq("game_id", gameId)
      .eq("slot", slot)
  );
}

// ============================================================================
// VOTOS FIN DE RONDA
// ============================================================================
export async function castVote(gameId, slot, action) {
  const data = unwrap(
    await supabase.rpc("cast_vote", {
      p_game_id: gameId,
      p_slot: slot,
      p_action: action,
    })
  );
  return data; // { both_agree: bool }
}

export async function cancelVote(gameId, slot) {
  unwrap(
    await supabase
      .from("game_votes")
      .delete()
      .eq("game_id", gameId)
      .eq("player_slot", slot)
  );
}

export async function advanceRound(gameId, mode) {
  unwrap(await supabase.rpc("advance_round", { p_game_id: gameId, p_mode: mode }));
}

// ============================================================================
// SETTINGS
// ============================================================================
export async function updateGameSettings(gameId, newSettings) {
  const merged = { ...DEFAULT_SETTINGS, ...newSettings };
  unwrap(
    await supabase
      .from("games")
      .update({ settings: merged, updated_at: new Date().toISOString() })
      .eq("id", gameId)
  );
}

// ============================================================================
// LOG
// ============================================================================
export async function fetchGameLog(gameId, limit = 50) {
  const data = unwrap(
    await supabase
      .from("game_log")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
  return data || [];
}