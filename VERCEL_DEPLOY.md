# 🚀 GUÍA DE DESPLIEGUE EN VERCEL (PASO A PASO)

Esta guía te explica cómo subir tu proyecto **Arcade Auction** a **Vercel** para que tú y tus amigos puedan jugar desde cualquier lugar del mundo en tiempo real.

---

## 📦 PASO 1: Subir tu Código a GitHub

1. Abre una terminal en la carpeta del proyecto (`c:\Users\César\Documents\Subasta`).
2. Si no has inicializado git:
   ```bash
   git init
   git add .
   git commit -m "feat: Arcade Auction con Supabase Realtime"
   ```
3. Crea un repositorio nuevo en [GitHub.com](https://github.com/new) (puede ser Público o Privado).
4. Vincula y sube tu proyecto:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 PASO 2: Importar el Proyecto en Vercel

1. Ingresa a [Vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. En tu panel principal, haz clic en **"Add New..."** > **"Project"**.
3. Verás la lista de tus repositorios de GitHub. Busca tu repositorio de la subasta y haz clic en **"Import"**.

---

## ⚙️ PASO 3: Configuración del Proyecto y Variables de Entorno

En la pantalla de configuración de Vercel:

1. **Framework Preset:** Debe detectar automáticamente **Vite**.
2. **Build and Output Settings:** Déjalos por defecto:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Despliega la sección **"Environment Variables"** (Variables de entorno) y agrega las dos claves de tu Supabase:

| Name (Nombre) | Value (Valor) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `tu_clave_anon_publica_de_supabase` |

4. Haz clic en el botón azul **"Deploy"**.

---

## 🎉 PASO 4: ¡Listo! Tu App está en Producción

1. Espera unos 30-45 segundos mientras Vercel compila el proyecto.
2. Te entregará una URL pública y segura (ejemplo: `https://subasta-pvp.vercel.app`).
3. Ya puedes compartir ese enlace con tus amigos:
   - Los jugadores entrarán por defecto en **Modo Espectador**.
   - Uno seleccionará **"Tomar: Jugador 1 (Azul)"** y el otro **"Tomar: Jugador 2 (Rojo)"**.
   - Al pulsar el botón `[ 👥 Conectados ]`, podrán ver a todos los que están en la sala.
4. **Acceso al Admin para el Organizador:**
   - Para abrir el panel de administración sin que los jugadores lo vean, solo tú ingresas a:
     `https://tu-app.vercel.app/admin`
   - Gracias al archivo `vercel.json` incluido en el proyecto, la ruta `/admin` funcionará directamente sin errores 404 al recargar la página.
