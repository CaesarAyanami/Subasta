import { supabase, unwrap, isSupabaseConfigured } from "./supabaseClient";

// ============================================================================
// LISTAR TODOS LOS CATÁLOGOS
// Devuelve un objeto con 3 arrays:
// {
//   attributes: [{ id, value, display_order }, ...],
//   races: [...],
//   traits: [...]
// }
// ============================================================================
export async function listCatalogs() {
  if (!isSupabaseConfigured) {
    return { attributes: [], races: [], traits: [] };
  }

  const data = unwrap(
    await supabase
      .from("catalogs")
      .select("*")
      .order("category", { ascending: true })
      .order("display_order", { ascending: true })
      .order("value", { ascending: true })
  );

  const result = { attributes: [], races: [], traits: [] };

  for (const item of data || []) {
    if (item.category === "attribute") result.attributes.push(item);
    else if (item.category === "race") result.races.push(item);
    else if (item.category === "trait") result.traits.push(item);
  }

  return result;
}

// ============================================================================
// CREAR ITEM
// ============================================================================
export async function addCatalogItem(category, value) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  // Validar categoría
  if (!["attribute", "race", "trait"].includes(category)) {
    throw new Error(`Categoría inválida: ${category}`);
  }

  const trimmed = (value || "").trim();
  if (!trimmed) throw new Error("El valor no puede estar vacío");

  // Calcular display_order: el siguiente número
  const { data: existing } = await supabase
    .from("catalogs")
    .select("display_order")
    .eq("category", category)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = existing?.[0]?.display_order
    ? existing[0].display_order + 1
    : 1;

  const data = unwrap(
    await supabase
      .from("catalogs")
      .insert({
        category,
        value: trimmed,
        display_order: nextOrder,
      })
      .select()
      .single()
  );

  return data;
}

// ============================================================================
// ELIMINAR ITEM
// ============================================================================
export async function deleteCatalogItem(id) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");
  unwrap(await supabase.from("catalogs").delete().eq("id", id));
}