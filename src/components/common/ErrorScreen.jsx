import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorScreen({ error, onRetry }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen bg-[#0d101a] text-white flex flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <AlertTriangle className="w-12 h-12 text-rose-400" aria-hidden="true" />
      <h1 className="font-['Press_Start_2P'] text-sm text-rose-400">
        ALGO SALIÓ MAL
      </h1>
      <p className="font-['Chakra_Petch'] text-sm text-slate-300 max-w-md">
        {error}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 text-black font-['Press_Start_2P'] text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_#000] transition flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>REINTENTAR</span>
      </button>
    </div>
  );
}