import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
      className="min-h-screen bg-[#0d101a] text-white flex flex-col items-center justify-center gap-4"
    >
      <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" aria-hidden="true" />
      <p className="font-['Press_Start_2P'] text-xs text-yellow-400 tracking-wider">
        CARGANDO...
      </p>
      <span className="sr-only">Cargando la aplicación, por favor espera</span>
    </div>
  );
}