// ============================================================================
// 🎨 DESIGN TOKENS
// Paleta centralizada del sistema. Importa desde aquí en lugar de hardcodear.
// Los valores coinciden con las variables CSS de index.css.
// ============================================================================

// ----------------------------------------------------------------------------
// COLORES BASE
// ----------------------------------------------------------------------------
export const COLORS = {
  bg: {
    primary: "#0a0d16",
    secondary: "#0d101a",
    tertiary: "#121526",
    elevated: "#151928",
    overlay: "rgba(0, 0, 0, 0.85)",
  },
  accent: {
    gold: "#eab308",
    goldBright: "#facc15",
    cyan: "#22d3ee",
    cyanBright: "#67e8f9",
    rose: "#f43f5e",
    emerald: "#10b981",
    fuchsia: "#d946ef",
    violet: "#8b5cf6",
  },
  text: {
    primary: "#ffffff",
    secondary: "#cbd5e1",
    tertiary: "#94a3b8",
    muted: "#64748b",
  },
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#f43f5e",
    info: "#3b82f6",
  },
};

// ----------------------------------------------------------------------------
// RAREZAS — Configuración centralizada
// ----------------------------------------------------------------------------
export const RARITY = {
  R: {
    label: "R",
    fullName: "Rare",
    color: "#94a3b8",
    bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderColor: "#64748b",
    glowColor: "rgba(148, 163, 184, 0.4)",
    particleColor: "#cbd5e1",
  },
  SR: {
    label: "SR",
    fullName: "Super Rare",
    color: "#fbbf24",
    bgGradient: "linear-gradient(135deg, #451a03 0%, #1c0f03 50%, #0c0e17 100%)",
    borderColor: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.6)",
    particleColor: "#fde68a",
  },
  SSR: {
    label: "SSR",
    fullName: "Super Super Rare",
    color: "#22d3ee",
    bgGradient: "linear-gradient(135deg, #0b2447 0%, #191938 50%, #120a2a 100%)",
    borderColor: "#22d3ee",
    glowColor: "rgba(34, 211, 238, 0.7)",
    particleColor: "#a5f3fc",
  },
  UR: {
    label: "UR",
    fullName: "Ultra Rare",
    color: "#d946ef",
    bgGradient: "linear-gradient(135deg, #2c0b4d 0%, #3b0764 50%, #100320 100%)",
    borderColor: "#d946ef",
    glowColor: "rgba(217, 70, 239, 0.8)",
    particleColor: "#f0abfc",
  },
  LR: {
    label: "LR",
    fullName: "Legendary Rare",
    color: "#ffffff",
    bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
    borderColor: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.7)",
    particleColor: "#ffffff",
  },
};

// ----------------------------------------------------------------------------
// ATRIBUTOS (Nanatsu no Taizai)
// ----------------------------------------------------------------------------
export const ATTRIBUTE = {
  Fuerza: { color: "#ef4444", icon: "💪" }, // Rojo
  Vida: { color: "#10b981", icon: "💚" }, // Verde
  Velocidad: { color: "#3b82f6", icon: "⚡" }, // Azul
  Luz: { color: "#fbbf24", icon: "☀️" }, // Dorado
  Oscuridad: { color: "#8b5cf6", icon: "🌑" }, // Morado oscuro
  LuzOscura: { color: "#a78bfa", icon: "☯️" }, // Púrpura
  Desconocido: { color: "#64748b", icon: "❓" },
};

// ----------------------------------------------------------------------------
// RAZAS (colores asociados)
// ----------------------------------------------------------------------------
export const RACE = {
  Humanos: { color: "#f59e0b" }, // Naranja
  Demonios: { color: "#dc2626" }, // Rojo
  Hadas: { color: "#22c55e" }, // Verde
  Gigantes: { color: "#78350f" }, // Marrón
  Diosas: { color: "#fbbf24" }, // Dorado
  Desconocido: { color: "#64748b" },
};

// ----------------------------------------------------------------------------
// SOMBRAS ARCADE (offset estilo pixel)
// ----------------------------------------------------------------------------
export const SHADOWS = {
  sm: "2px 2px 0 #000",
  md: "3px 3px 0 #000",
  lg: "4px 4px 0 #000",
  xl: "6px 6px 0 #000",
  xxl: "8px 8px 0 #000",
  glowGold: "0 0 20px rgba(234, 179, 8, 0.5)",
  glowCyan: "0 0 20px rgba(34, 211, 238, 0.5)",
  glowRose: "0 0 20px rgba(244, 63, 94, 0.5)",
  glowFuchsia: "0 0 30px rgba(217, 70, 239, 0.6)",
  glowWhite: "0 0 40px rgba(255, 255, 255, 0.7)",
};

// ----------------------------------------------------------------------------
// TIMINGS
// ----------------------------------------------------------------------------
export const TIMING = {
  fast: 150,
  base: 250,
  slow: 400,
  slower: 700,
};

export const EASING = {
  snappy: [0.34, 1.56, 0.64, 1],
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// ----------------------------------------------------------------------------
// BREAKPOINTS (referencia, Tailwind ya los tiene)
// ----------------------------------------------------------------------------
export const BREAKPOINTS = {
  xs: 380,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

/**
 * Devuelve la config de rareza. Si no existe, cae a R.
 */
export function getRarityConfig(rarity) {
  return RARITY[rarity] || RARITY.R;
}

/**
 * Devuelve el color de un atributo. Si no existe, cae a "Desconocido".
 */
export function getAttributeColor(attribute) {
  return ATTRIBUTE[attribute]?.color || ATTRIBUTE.Desconocido.color;
}

/**
 * Devuelve el icono de un atributo.
 */
export function getAttributeIcon(attribute) {
  return ATTRIBUTE[attribute]?.icon || ATTRIBUTE.Desconocido.icon;
}

/**
 * Devuelve el color de una raza. Si no existe, cae a "Desconocido".
 */
export function getRaceColor(race) {
  return RACE[race]?.color || RACE.Desconocido.color;
}

/**
 * Genera un gradiente animado con los colores especificados.
 * Ideal para el efecto "agua" morada de UR/LR.
 */
export function animatedGradient(colors, angle = "135deg") {
  const stops = colors.join(", ");
  return `linear-gradient(${angle}, ${stops})`;
}

/**
 * Preset de gradientes animados por rareza.
 * Aplica `.animate-gradient` de Tailwind + estos estilos inline.
 */
export const ANIMATED_GRADIENTS = {
  UR: "linear-gradient(135deg, #2c0b4d 0%, #7c3aed 25%, #d946ef 50%, #7c3aed 75%, #2c0b4d 100%)",
  LR: "linear-gradient(135deg, #1e293b 0%, #64748b 25%, #ffffff 50%, #64748b 75%, #1e293b 100%)",
  SSR: "linear-gradient(135deg, #0b2447 0%, #3b82f6 25%, #22d3ee 50%, #3b82f6 75%, #0b2447 100%)",
  SR: "linear-gradient(135deg, #451a03 0%, #d97706 25%, #fbbf24 50%, #d97706 75%, #451a03 100%)",
  R: "linear-gradient(135deg, #1e293b 0%, #475569 50%, #1e293b 100%)",
};

// ----------------------------------------------------------------------------
// EXPORT DEFAULT
// ----------------------------------------------------------------------------
export default {
  COLORS,
  RARITY,
  ATTRIBUTE,
  RACE,
  SHADOWS,
  TIMING,
  EASING,
  BREAKPOINTS,
  ANIMATED_GRADIENTS,
  getRarityConfig,
  getAttributeColor,
  getAttributeIcon,
  getRaceColor,
  animatedGradient,
};