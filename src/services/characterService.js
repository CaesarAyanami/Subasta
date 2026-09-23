import { supabase, unwrap, isSupabaseConfigured } from "./supabaseClient";

// ============================================================================
// HELPERS
// ============================================================================
function sanitizeRaces(races) {
  if (!Array.isArray(races)) return [];
  return races
    .map((r) => (typeof r === "string" ? r.trim() : ""))
    .filter(Boolean)
    .slice(0, 3); // Máximo 3 razas
}

function sanitizeTraits(traits) {
  if (!Array.isArray(traits)) return [];
  return traits
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean)
    .slice(0, 7); // Máximo 7 traits
}

function sanitizeAttribute(attribute) {
  if (typeof attribute !== "string") return "Desconocido";
  return attribute.trim() || "Desconocido";
}

// ============================================================================
// LISTAR
// ============================================================================
export async function listCharacters() {
  if (!isSupabaseConfigured) return [];
  const data = unwrap(
    await supabase
      .from("characters")
      .select("*")
      .order("created_at", { ascending: false })
  );
  return data || [];
}

export async function getCharacter(id) {
  if (!isSupabaseConfigured) return null;
  const data = unwrap(
    await supabase.from("characters").select("*").eq("id", id).maybeSingle()
  );
  return data;
}

// ============================================================================
// CREAR
// ============================================================================
export async function createCharacter(input, gameId = null) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  const id = input.id || `char-${crypto.randomUUID()}`;
  const payload = {
    id,
    name: input.name.trim(),
    rarity: input.rarity,
    acceptance: Math.max(0, parseInt(input.acceptance, 10) || 0),
    image_url: (input.image_url || "").trim(),
    description: (input.description || "").trim(),
    weight: parseInt(input.weight, 10) || defaultWeightForRarity(input.rarity),
    is_default: false,
    // ⚠️ NUEVO: campos del #8
    attribute: sanitizeAttribute(input.attribute),
    races: sanitizeRaces(input.races),
    traits: sanitizeTraits(input.traits),
  };

  // 1. Insertar personaje en el catálogo global
  const data = unwrap(
    await supabase.from("characters").insert(payload).select().single()
  );

  // 2. Si nos dan un gameId, añadirlo también al pool de esa partida
  if (gameId) {
    try {
      unwrap(
        await supabase.from("game_pool").insert({
          game_id: gameId,
          character_id: data.id,
          state: "available",
        })
      );
    } catch (err) {
      console.warn("[characterService] No se pudo añadir al pool:", err);
    }
  }

  return data;
}

// ============================================================================
// ACTUALIZAR
// ============================================================================
export async function updateCharacter(id, input) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  const payload = {
    name: input.name.trim(),
    rarity: input.rarity,
    acceptance: Math.max(0, parseInt(input.acceptance, 10) || 0),
    image_url: (input.image_url || "").trim(),
    description: (input.description || "").trim(),
    // ⚠️ NUEVO: campos del #8
    attribute: sanitizeAttribute(input.attribute),
    races: sanitizeRaces(input.races),
    traits: sanitizeTraits(input.traits),
  };
  if (input.weight != null) {
    payload.weight =
      parseInt(input.weight, 10) || defaultWeightForRarity(input.rarity);
  }

  const data = unwrap(
    await supabase
      .from("characters")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
  );
  return data;
}

// ============================================================================
// ELIMINAR
// ============================================================================
export async function deleteCharacter(id) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");
  unwrap(await supabase.from("characters").delete().eq("id", id));
}

// ============================================================================
// SEED — personajes por defecto
// ============================================================================
export async function seedDefaultCharacters(gameId = null) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  const { DEFAULT_CHARACTERS } = await import("./defaultCharacters");

  const payload = DEFAULT_CHARACTERS.map((c) => ({
    id: c.id,
    name: c.name,
    rarity: c.rarity,
    acceptance: c.acceptance,
    image_url: c.imageUrl,
    description: c.description,
    weight: defaultWeightForRarity(c.rarity),
    is_default: true,
    // Los defaults no tienen atributo/raza/trait (los editas después)
    attribute: "Desconocido",
    races: [],
    traits: [],
  }));

  const data = unwrap(
    await supabase
      .from("characters")
      .upsert(payload, { onConflict: "id", ignoreDuplicates: false })
      .select()
  );

  if (gameId && data && data.length) {
    const poolRows = data.map((c) => ({
      game_id: gameId,
      character_id: c.id,
      state: "available",
    }));

    try {
      unwrap(
        await supabase
          .from("game_pool")
          .upsert(poolRows, {
            onConflict: "game_id,character_id",
            ignoreDuplicates: true,
          })
      );
    } catch (err) {
      console.warn(
        "[characterService] No se pudieron añadir al pool:",
        err
      );
    }
  }

  return data || [];
}

// ============================================================================
// RESET — eliminar todos los personajes
// ============================================================================
export async function deleteAllCharacters() {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");
  unwrap(await supabase.from("characters").delete().neq("id", "___never___"));
}

// ============================================================================
// HELPERS
// ============================================================================
export function defaultWeightForRarity(rarity) {
  return { LR: 1, UR: 3, SSR: 8, SR: 20, R: 50 }[rarity] ?? 10;
}

export const RARITY_ORDER = ["R", "SR", "SSR", "UR", "LR"];