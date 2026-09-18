import { supabase, isSupabaseConfigured } from "./supabaseClient";

const BUCKET = "character-images";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// ============================================================================
// VALIDACIÓN
// ============================================================================
export function validateImageFile(file) {
  if (!file) return "No hay archivo seleccionado";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo no permitido (${file.type}). Usa PNG, JPG, WEBP o GIF.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `El archivo pesa ${(file.size / 1024 / 1024).toFixed(2)} MB. Máximo 2 MB.`;
  }
  return null;
}

// ============================================================================
// SUBIR
// ============================================================================
export async function uploadCharacterImage(file, characterId = null) {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado");

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const base = characterId || `char-${crypto.randomUUID()}`;
  const path = `${base}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("[Storage upload]", uploadError);
    throw new Error(uploadError.message || "Error al subir imagen");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

// ============================================================================
// ELIMINAR
// ============================================================================
export async function deleteCharacterImage(pathOrUrl) {
  if (!isSupabaseConfigured) return;
  if (!pathOrUrl) return;

  // Extraer path si nos pasan la URL completa
  let path = pathOrUrl;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (path.includes(marker)) {
    path = path.split(marker)[1];
  }
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn("[Storage delete]", error.message);
}