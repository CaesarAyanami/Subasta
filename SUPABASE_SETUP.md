# ⚡ GUÍA OFICIAL DE CONFIGURACIÓN DE SUPABASE REALTIME

Esta guía te explica detalladamente cómo crear tu proyecto en **Supabase**, ejecutar el script SQL con la tabla y políticas, activar el motor **Realtime** y conectar la aplicación para sincronización en tiempo real.

---

## 🎯 PASO 1: Crear tu Proyecto en Supabase

1. Abre tu navegador e ingresa a [Supabase.com](https://supabase.com/).
2. Inicia sesión con tu cuenta (o regístrate gratis con GitHub/Email).
3. En el Dashboard principal, haz clic en el botón verde **"New Project"**.
4. Completa los datos:
   - **Name:** `subasta-pvp-arcade` (o el nombre que prefieras).
   - **Database Password:** Elige una contraseña segura y guárdala.
   - **Region:** Selecciona la más cercana a tu país (por ejemplo: `East US (North Virginia)` o `South America (São Paulo)`).
   - **Pricing Plan:** Selecciona **Free Plan** (es 100% gratuito).
5. Haz clic en **"Create new project"** y espera 1-2 minutos mientras Supabase aprovisiona la base de datos PostgreSQL.

---

## 💻 PASO 2: Ejecutar las Consultas SQL

1. En el menú lateral izquierdo de tu proyecto en Supabase, haz clic en el ícono de **SQL Editor** (`>_`).
2. Haz clic en **"New query"** (o *"Create a new snippet"*).
3. Copia y pega el siguiente script SQL completo:

```sql
-- =======================================================
-- SCRIPT DE INSTALACIÓN PARA ARCADE AUCTION PVP
-- =======================================================

-- 1. Crear tabla para el estado del juego y la subasta
CREATE TABLE IF NOT EXISTS public.game_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB NOT NULL,
  players JSONB NOT NULL,
  auction JSONB NOT NULL,
  character_pool JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad de nivel de fila (Row Level Security - RLS)
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas públicas para permitir juego online sin autenticación forzada
CREATE POLICY "Permitir lectura publica de game_state"
ON public.game_state FOR SELECT
USING (true);

CREATE POLICY "Permitir actualizacion publica de game_state"
ON public.game_state FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir insercion publica de game_state"
ON public.game_state FOR INSERT
WITH CHECK (true);

-- 4. ACTIVAR REALTIME: Agregar la tabla a la publicación en tiempo real de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;

-- 5. Insertar estado inicial y los 12 personajes oficiales (Seed)
INSERT INTO public.game_state (id, settings, players, auction, character_pool, updated_at)
VALUES (
  'main',
  '{
    "initialCoins": 20,
    "auctionTime": 20,
    "animationType": "roulette",
    "soundEnabled": true
  }'::jsonb,
  '{
    "player1": { "name": "Jugador 1", "coins": 20, "ready": false, "finishRequested": false, "inventory": [] },
    "player2": { "name": "Jugador 2", "coins": 20, "ready": false, "finishRequested": false, "inventory": [] }
  }'::jsonb,
  '{
    "status": "IDLE",
    "currentCharacter": null,
    "minAcceptancePrice": 0,
    "currentBid": 0,
    "highestBidder": null,
    "timeLeft": 20,
    "timerRunning": false
  }'::jsonb,
  '{
    "available": [
      { "id": "char-lr-01", "name": "Aethelgard el Soberano", "rarity": "LR", "acceptance": 5, "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80", "description": "Espadachín celestial con aura de platino." },
      { "id": "char-lr-02", "name": "Cronos Nova X", "rarity": "LR", "acceptance": 4, "imageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80", "description": "Androide legendario manipulador de líneas temporales." },
      { "id": "char-ur-01", "name": "Valquiria Valken", "rarity": "UR", "acceptance": 4, "imageUrl": "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80", "description": "Guerrera cósmica imbuida de relámpagos púrpuras." },
      { "id": "char-ur-02", "name": "Nox Sombra Oscura", "rarity": "UR", "acceptance": 3, "imageUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80", "description": "Asesino dimensional envuelto en niebla morada." },
      { "id": "char-ssr-01", "name": "Glacius el Crióforo", "rarity": "SSR", "acceptance": 3, "imageUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80", "description": "Mago arcano que congela el campo con prisma boreal." },
      { "id": "char-ssr-02", "name": "Ignis Dragón Rojo", "rarity": "SSR", "acceptance": 3, "imageUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80", "description": "Híbrido dracónico maestro de las llamas abrasadoras." },
      { "id": "char-sr-01", "name": "Kael Cazador Áureo", "rarity": "SR", "acceptance": 2, "imageUrl": "https://images.unsplash.com/photo-1569701814227-f40cf200dff5?w=500&auto=format&fit=crop&q=80", "description": "Tirador de élite con arco solar." },
      { "id": "char-sr-02", "name": "Aria Valkyrie Scout", "rarity": "SR", "acceptance": 2, "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80", "description": "Exploradora táctica con propulsores de plasma." },
      { "id": "char-r-01", "name": "Soldado Búnker 07", "rarity": "R", "acceptance": 1, "imageUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80", "description": "Infantería pesada con escudo reforzado." },
      { "id": "char-r-02", "name": "Recluta Mecánico", "rarity": "R", "acceptance": 1, "imageUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80", "description": "Técnico de soporte con torreta ligera." },
      { "id": "char-r-03", "name": "Centinela Urbano", "rarity": "R", "acceptance": 1, "imageUrl": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80", "description": "Vigilante con visor infrarrojo." },
      { "id": "char-sr-03", "name": "Barón Cybersmith", "rarity": "SR", "acceptance": 2, "imageUrl": "https://images.unsplash.com/photo-1552824792-757e1797cff1?w=500&auto=format&fit=crop&q=80", "description": "Ingeniero de combate con drones defensivos." }
    ],
    "used": [],
    "discarded": []
  }'::jsonb,
  now()
)
ON CONFLICT (id) DO NOTHING;
```

4. Haz clic en el botón verde **"Run"** (o presiona `Ctrl + Enter`).
5. Debe aparecer el mensaje: `Success. No rows returned`.

---

## ⚡ PASO 3: Verificar que Realtime esté Activado

1. En el menú lateral izquierdo, ve a **Database** > **Publications**.
2. Haz clic en la publicación `supabase_realtime`.
3. Verifica que la tabla `game_state` tenga el interruptor en verde (activada).

---

## 🔑 PASO 4: Obtener tus Claves de API

1. En el menú lateral izquierdo, haz clic en el ícono de engranaje **Project Settings** (⚙️) abajo a la izquierda.
2. En la sección **Configuration**, selecciona **API**.
3. Encontrarás dos valores indispensables:
   - **Project URL:** Empieza por `https://...supabase.co`.
   - **Project API Keys:** La clave llamada **`anon` `public`**.

---

## 📁 PASO 5: Conectar en tu Proyecto Local (`.env`)

En la raíz del proyecto (`c:\Users\César\Documents\Subasta\`), abre o crea el archivo `.env`:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_publica_aqui
```

¡Y listo! Al guardar este archivo, la aplicación web se conectará automáticamente a tu base de datos Supabase y sincronizará en tiempo real a todos los jugadores y espectadores conectados.
