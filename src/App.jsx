import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/common/Header";
import ConnectedUsersModal from "./components/common/ConnectedUsersModal";
import CharacterPoolModal from "./components/common/CharacterPoolModal";
import FloatingToast from "./components/common/FloatingToast";
import RoundControls from "./components/common/RoundControls";
import PlayerCard from "./components/players/PlayerCard";
import InventorySlots from "./components/players/InventorySlots";
import AuctionZone from "./components/auction/AuctionZone";
import AdminPanel from "./components/admin/AdminPanel";

import { 
  subscribeToGameState, 
  syncGameState, 
  trackPresence, 
  onPresenceSync, 
  CLIENT_ID, 
  INITIAL_GAME_STATE,
  isSupabaseConfigured
} from "./services/supabaseClient";
import sounds from "./services/soundEffects";
import { DEFAULT_CHARACTERS } from "./services/defaultCharacters";

// Helper para detectar si la URL solicita el Admin
function checkIsAdminUrl() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path === "/admin" || path.startsWith("/admin/") || search.includes("view=admin") || hash === "#admin";
}

export default function App() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [currentView, setCurrentView] = useState(checkIsAdminUrl() ? "admin" : "board");
  const [userRole, setUserRole] = useState("spectator"); // ESPECTADOR POR DEFECTO
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [connectedModalOpen, setConnectedModalOpen] = useState(false);
  const [poolModalOpen, setPoolModalOpen] = useState(false);
  const [poolModalTab, setPoolModalTab] = useState("available");
  const [soundMuted, setSoundMuted] = useState(sounds.isMuted());
  const [toast, setToast] = useState(null);

  // Referencia mutable para tener siempre el estado más reciente dentro de callbacks
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Mostrar toast arcade flotante
  const showToast = useCallback((title, message, type = "info", duration = 3000) => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  // Escuchar navegación URL (por ejemplo si el admin escribe /admin o da atrás)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(checkIsAdminUrl() ? "admin" : "board");
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Suscripción al estado general de Supabase
  useEffect(() => {
    const unsubscribeState = subscribeToGameState((newState) => {
      if (newState) {
        setGameState(newState);
      }
    });

    const unsubscribePresence = onPresenceSync((users) => {
      setConnectedUsers(users);
    });

    return () => {
      unsubscribeState();
      unsubscribePresence();
    };
  }, []);

  // Registrar presencia cada vez que cambia el rol
  useEffect(() => {
    const myName = userRole === "player1" 
      ? (gameState.players?.player1?.name || "Jugador 1")
      : userRole === "player2"
      ? (gameState.players?.player2?.name || "Jugador 2")
      : "Espectador " + CLIENT_ID.substring(5);

    trackPresence({
      name: myName,
      role: userRole
    });
  }, [userRole, gameState.players?.player1?.name, gameState.players?.player2?.name]);

  const { settings, players, auction, characterPool } = gameState;

  // Alternar sonido
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setSoundMuted(muted);
    showToast("AUDIO", muted ? "Efectos silenciados" : "Efectos activados", "info", 1500);
  };

  // ==========================================
  // LÓGICA DE JUGADORES Y "LISTO"
  // ==========================================

  const handleUpdatePlayerName = (playerId, newName) => {
    const current = stateRef.current;
    const nextState = {
      ...current,
      players: {
        ...current.players,
        [playerId]: {
          ...current.players[playerId],
          name: newName
        }
      }
    };
    syncGameState(nextState);
    showToast("JUGADOR", `Nombre actualizado a ${newName}`, "info", 2000);
  };

  const handleToggleReady = (playerId) => {
    const current = stateRef.current;
    if (current.auction.status !== "IDLE") return;

    const currentReady = current.players[playerId]?.ready;
    const newReady = !currentReady;

    const updatedPlayers = {
      ...current.players,
      [playerId]: {
        ...current.players[playerId],
        ready: newReady
      }
    };

    const otherId = playerId === "player1" ? "player2" : "player1";
    const bothReady = newReady && updatedPlayers[otherId]?.ready;

    if (bothReady) {
      // Iniciar Ruleta
      const available = current.characterPool.available || [];
      if (available.length === 0) {
        showToast("ALERTA", "No hay personajes en el pool disponible", "warning", 3000);
        return;
      }

      const randomIndex = Math.floor(Math.random() * available.length);
      const selectedChar = available[randomIndex];
      const maxAcc = Math.max(0, selectedChar.acceptance ?? 1);
      const rolledMin = Math.floor(Math.random() * (maxAcc + 1));

      const nextState = {
        ...current,
        players: updatedPlayers,
        auction: {
          status: "SELECTING",
          currentCharacter: selectedChar,
          minAcceptancePrice: rolledMin,
          currentBid: 0,
          highestBidder: null,
          timeLeft: current.settings?.auctionTime || 20,
          timerRunning: false
        }
      };
      syncGameState(nextState);
      showToast("¡RULETA ACTIVADA!", "Sorteando personaje del pool...", "sparkles", 3500);
    } else {
      const nextState = {
        ...current,
        players: updatedPlayers
      };
      syncGameState(nextState);
    }
  };

  // Cuando termina la animación de la ruleta
  const handleRouletteFinished = () => {
    const current = stateRef.current;
    const nextState = {
      ...current,
      players: {
        ...current.players,
        player1: { ...current.players.player1, finishRequested: false },
        player2: { ...current.players.player2, finishRequested: false }
      },
      auction: {
        ...current.auction,
        status: "BIDDING",
        timerRunning: true,
        timeLeft: current.settings?.auctionTime || 20
      }
    };
    syncGameState(nextState);
    showToast("¡PUJAS ABIERTAS!", "Comiencen a ofertar monedas", "trophy", 2500);
  };

  // ==========================================
  // LÓGICA DE PUJAS Y FINALIZACIÓN
  // ==========================================

  const handleBid = (playerId, amount) => {
    const current = stateRef.current;
    if (current.auction.status !== "BIDDING" || !current.auction.timerRunning) return;
    const player = current.players[playerId];
    if (!player || player.coins < amount) return;

    const nextState = {
      ...current,
      auction: {
        ...current.auction,
        currentBid: amount,
        highestBidder: playerId
      }
    };
    syncGameState(nextState);
    showToast("¡NUEVA PUJA!", `${player.name} ofreció ${amount} monedas`, "trophy", 2000);
  };

  const handleToggleFinish = (playerId) => {
    const current = stateRef.current;
    if (current.auction.status !== "BIDDING") return;
    const currentRequested = current.players[playerId]?.finishRequested;
    const newRequested = !currentRequested;

    const otherId = playerId === "player1" ? "player2" : "player1";
    const otherRequested = current.players[otherId]?.finishRequested;

    const updatedPlayers = {
      ...current.players,
      [playerId]: {
        ...current.players[playerId],
        finishRequested: newRequested
      }
    };

    if (newRequested && otherRequested) {
      // Consenso alcanzado
      showToast("CONSENSO", "Ambos jugadores acordaron finalizar", "trophy", 2500);
      finalizeAuction(updatedPlayers, true);
    } else {
      const nextState = {
        ...current,
        players: updatedPlayers
      };
      syncGameState(nextState);
    }
  };

  const handleTimerTick = (newTime) => {
    const current = stateRef.current;
    const nextState = {
      ...current,
      auction: {
        ...current.auction,
        timeLeft: newTime
      }
    };
    syncGameState(nextState);
  };

  const handleTimeExpired = () => {
    const current = stateRef.current;
    finalizeAuction(current.players, false);
  };

  // Finalizar la subasta (por tiempo o por consenso)
  const finalizeAuction = (currentPlayers, byConsensus = false) => {
    const current = stateRef.current;
    const winnerId = current.auction.highestBidder;
    const winningBid = current.auction.currentBid;
    const character = current.auction.currentCharacter;
    const minRequired = current.auction.minAcceptancePrice || 0;

    if (winnerId && winningBid >= minRequired && character) {
      // VENDIDO
      const winner = currentPlayers[winnerId];
      const newCoins = Math.max(0, (winner.coins || 0) - winningBid);
      const wonCharacter = {
        ...character,
        winningBid,
        wonBy: winner.name,
        wonAt: Date.now()
      };
      const newInventory = [...(winner.inventory || []), wonCharacter];
      const newAvailable = (current.characterPool.available || []).filter(c => c.id !== character.id);

      const otherId = winnerId === "player1" ? "player2" : "player1";

      const nextState = {
        ...current,
        players: {
          ...currentPlayers,
          [winnerId]: {
            ...winner,
            coins: newCoins,
            ready: false,
            finishRequested: false,
            inventory: newInventory
          },
          [otherId]: {
            ...currentPlayers[otherId],
            ready: false,
            finishRequested: false
          }
        },
        characterPool: {
          ...current.characterPool,
          available: newAvailable
        },
        auction: {
          ...current.auction,
          status: "SOLD",
          timerRunning: false
        }
      };
      syncGameState(nextState);
      showToast("¡VENDIDO!", `${character.name} ganado por ${winner.name}`, "trophy", 4000);

      setTimeout(() => {
        const latest = stateRef.current;
        syncGameState({
          ...latest,
          auction: {
            status: "IDLE",
            currentCharacter: null,
            minAcceptancePrice: 0,
            currentBid: 0,
            highestBidder: null,
            timerRunning: false,
            timeLeft: latest.settings?.auctionTime || 20
          }
        });
      }, 3500);

    } else {
      // DESECHADO
      const newAvailable = (current.characterPool.available || []).filter(c => c.id !== character?.id);
      const newDiscarded = character ? [...(current.characterPool.discarded || []), character] : current.characterPool.discarded;

      const nextState = {
        ...current,
        players: {
          ...currentPlayers,
          player1: { ...currentPlayers.player1, ready: false, finishRequested: false },
          player2: { ...currentPlayers.player2, ready: false, finishRequested: false }
        },
        characterPool: {
          ...current.characterPool,
          available: newAvailable,
          discarded: newDiscarded
        },
        auction: {
          ...current.auction,
          status: "DISCARDED",
          timerRunning: false
        }
      };
      syncGameState(nextState);
      showToast("DESECHADO", `${character?.name || "Personaje"} enviado a descartes`, "warning", 3500);

      setTimeout(() => {
        const latest = stateRef.current;
        syncGameState({
          ...latest,
          auction: {
            status: "IDLE",
            currentCharacter: null,
            minAcceptancePrice: 0,
            currentBid: 0,
            highestBidder: null,
            timerRunning: false,
            timeLeft: latest.settings?.auctionTime || 20
          }
        });
      }, 3000);
    }
  };

  // ==========================================
  // CONTROLES DE FIN DE RONDA Y VOTACIÓN POR CONSENSO
  // ==========================================

  const handleNextRound = () => {
    const current = stateRef.current;
    const p1Chars = current.players.player1?.inventory || [];
    const p2Chars = current.players.player2?.inventory || [];
    const newUsed = [...(current.characterPool.used || []), ...p1Chars, ...p2Chars];
    const initialCoins = current.settings?.initialCoins || 20;

    const nextState = {
      ...current,
      characterPool: {
        ...current.characterPool,
        used: newUsed
      },
      roundVotes: { player1: null, player2: null },
      players: {
        player1: {
          ...current.players.player1,
          coins: initialCoins,
          ready: false,
          finishRequested: false,
          inventory: []
        },
        player2: {
          ...current.players.player2,
          coins: initialCoins,
          ready: false,
          finishRequested: false,
          inventory: []
        }
      },
      auction: {
        status: "IDLE",
        currentCharacter: null,
        minAcceptancePrice: 0,
        currentBid: 0,
        highestBidder: null,
        timerRunning: false,
        timeLeft: current.settings?.auctionTime || 20
      }
    };
    syncGameState(nextState);
    showToast("NUEVA RONDA", "Monedas restablecidas e inventarios movidos a usados", "sparkles", 3000);
  };

  const handleNextRoundWithDiscarded = () => {
    const current = stateRef.current;
    const p1Chars = current.players.player1?.inventory || [];
    const p2Chars = current.players.player2?.inventory || [];
    const newUsed = [...(current.characterPool.used || []), ...p1Chars, ...p2Chars];
    const recovered = current.characterPool.discarded || [];
    const newAvailable = [...(current.characterPool.available || []), ...recovered];
    const initialCoins = current.settings?.initialCoins || 20;

    const nextState = {
      ...current,
      characterPool: {
        available: newAvailable,
        used: newUsed,
        discarded: []
      },
      roundVotes: { player1: null, player2: null },
      players: {
        player1: {
          ...current.players.player1,
          coins: initialCoins,
          ready: false,
          finishRequested: false,
          inventory: []
        },
        player2: {
          ...current.players.player2,
          coins: initialCoins,
          ready: false,
          finishRequested: false,
          inventory: []
        }
      },
      auction: {
        status: "IDLE",
        currentCharacter: null,
        minAcceptancePrice: 0,
        currentBid: 0,
        highestBidder: null,
        timerRunning: false,
        timeLeft: current.settings?.auctionTime || 20
      }
    };
    syncGameState(nextState);
    showToast("DESECHOS RECUPERADOS", `Se reintegraron ${recovered.length} personajes al pool`, "sparkles", 3000);
  };

  const handleResetAll = () => {
    const current = stateRef.current;
    const p1Chars = current.players.player1?.inventory || [];
    const p2Chars = current.players.player2?.inventory || [];
    const allChars = [
      ...(current.characterPool.available || []),
      ...(current.characterPool.used || []),
      ...(current.characterPool.discarded || []),
      ...p1Chars,
      ...p2Chars
    ];

    const uniqueMap = new Map();
    allChars.forEach(c => {
      if (c && c.id) uniqueMap.set(c.id, c);
    });
    const resetAvailable = Array.from(uniqueMap.values());
    const initialCoins = current.settings?.initialCoins || 20;

    const nextState = {
      ...current,
      characterPool: {
        available: resetAvailable,
        used: [],
        discarded: []
      },
      roundVotes: { player1: null, player2: null },
      players: {
        player1: {
          ...current.players.player1,
          coins: initialCoins,
          ready: false,
          finishRequested: false,
          inventory: []
        },
        player2: {
          ...current.players.player2,
          coins: initialCoins,
          ready: false,
          finishRequested: false,
          inventory: []
        }
      },
      auction: {
        status: "IDLE",
        currentCharacter: null,
        minAcceptancePrice: 0,
        currentBid: 0,
        highestBidder: null,
        timerRunning: false,
        timeLeft: current.settings?.auctionTime || 20
      }
    };
    syncGameState(nextState);
    showToast("REINICIO TOTAL", "Juego restablecido a estado inicial completo", "trophy", 3000);
  };

  // Manejadores de Votación y Consenso
  const handleVote = (role, actionKey) => {
    if (role !== "player1" && role !== "player2") return;
    const current = stateRef.current;
    const currentVotes = current.roundVotes || { player1: null, player2: null };
    const otherId = role === "player1" ? "player2" : "player1";
    const otherVote = currentVotes[otherId];

    // Si el otro jugador ya votó exactamente esta opción -> ¡CONSENSO!
    if (otherVote === actionKey) {
      showToast("¡CONSENSO LOGRADO!", "Ambos confirmaron la acción", "trophy", 3000);
      handleDirectRoundAction(actionKey);
    } else {
      // Registrar voto
      const updatedVotes = {
        ...currentVotes,
        [role]: actionKey
      };
      syncGameState({
        ...current,
        roundVotes: updatedVotes
      });
      showToast("CONFIRMACIÓN", "Opción marcada. Esperando que tu rival confirme...", "info", 2500);
    }
  };

  const handleCancelVote = (role) => {
    if (role !== "player1" && role !== "player2") return;
    const current = stateRef.current;
    const currentVotes = current.roundVotes || { player1: null, player2: null };
    syncGameState({
      ...current,
      roundVotes: {
        ...currentVotes,
        [role]: null
      }
    });
    showToast("CANCELADO", "Has retirado tu selección", "info", 1500);
  };

  const handleDirectRoundAction = (actionKey) => {
    if (actionKey === "next") {
      handleNextRound();
    } else if (actionKey === "next_discarded") {
      handleNextRoundWithDiscarded();
    } else if (actionKey === "reset") {
      handleResetAll();
    }
  };

  // ==========================================
  // OPERACIONES DEL ADMINISTRADOR (CRUD & AJUSTES)
  // ==========================================

  const handleUpdateSettings = (newSettings) => {
    const current = stateRef.current;
    syncGameState({
      ...current,
      settings: newSettings
    });
  };

  const handleAddCharacter = (char) => {
    const current = stateRef.current;
    const nextAvailable = [char, ...(current.characterPool.available || [])];
    syncGameState({
      ...current,
      characterPool: {
        ...current.characterPool,
        available: nextAvailable
      }
    });
    showToast("PERSONAJE CREADO", `${char.name} añadido al pool disponible`, "sparkles", 2500);
  };

  const handleEditCharacter = (updatedChar) => {
    const current = stateRef.current;
    const nextAvailable = (current.characterPool.available || []).map(c => c.id === updatedChar.id ? updatedChar : c);
    syncGameState({
      ...current,
      characterPool: {
        ...current.characterPool,
        available: nextAvailable
      }
    });
    showToast("PERSONAJE EDITADO", `${updatedChar.name} actualizado`, "info", 2000);
  };

  const handleDeleteCharacter = (charId) => {
    const current = stateRef.current;
    const nextAvailable = (current.characterPool.available || []).filter(c => c.id !== charId);
    syncGameState({
      ...current,
      characterPool: {
        ...current.characterPool,
        available: nextAvailable
      }
    });
    showToast("PERSONAJE ELIMINADO", "Personaje retirado del pool", "warning", 2000);
  };

  const handleResetDatabase = () => {
    const freshState = {
      ...INITIAL_GAME_STATE,
      characterPool: {
        available: [],
        used: [],
        discarded: []
      }
    };
    syncGameState(freshState);
    showToast("BASE DE DATOS LIMPIA", "Se eliminaron todos los personajes", "warning", 3000);
  };

  const handleSeedDefaultCharacters = () => {
    const current = stateRef.current;
    syncGameState({
      ...current,
      characterPool: {
        ...current.characterPool,
        available: DEFAULT_CHARACTERS
      }
    });
    showToast("SEED COMPLETADO", "Se cargaron 12 personajes oficiales al pool", "sparkles", 3000);
  };

  return (
    <div className="min-h-screen bg-[#0d101a] text-white flex flex-col selection:bg-yellow-400 selection:text-black">
      
      {/* Notificaciones Arcade Flotantes */}
      <FloatingToast toast={toast} />

      {/* Barra de Navegación Superior */}
      <Header
        userRole={userRole}
        onRoleChange={setUserRole}
        connectedUsersCount={connectedUsers.length || 1}
        onOpenConnectedModal={() => setConnectedModalOpen(true)}
        availableCount={(characterPool?.available || []).length}
        historyCount={(characterPool?.discarded || []).length + (characterPool?.used || []).length + (players?.player1?.inventory || []).length + (players?.player2?.inventory || []).length}
        onOpenPoolModal={(tab) => {
          setPoolModalTab(tab);
          setPoolModalOpen(true);
        }}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        
        {currentView === "board" ? (
          <div className="space-y-6">
            
            {/* TABLERO DE SUBASTA: P1 | ZONA CENTRAL | P2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* COLUMNA CENTRAL: ZONA DE SUBASTA (En móvil aparece de primera para visibilidad inmediata) */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <AuctionZone
                  auctionState={auction}
                  pool={characterPool?.available || []}
                  settings={settings}
                  players={players}
                  userRole={userRole}
                  onBid={handleBid}
                  onToggleFinish={handleToggleFinish}
                  onRouletteFinished={handleRouletteFinished}
                  onTimerTick={handleTimerTick}
                  onTimeExpired={handleTimeExpired}
                />
              </div>

              {/* COLUMNA IZQUIERDA: JUGADOR 1 */}
              <div className="lg:col-span-3 order-2 lg:order-1 space-y-3">
                <PlayerCard
                  playerId="player1"
                  player={players?.player1}
                  isLocalPlayer={userRole === "both" || userRole === "player1"}
                  canToggleReady={auction.status === "IDLE"}
                  onUpdateName={handleUpdatePlayerName}
                  onToggleReady={handleToggleReady}
                />
                <InventorySlots
                  inventory={players?.player1?.inventory || []}
                />
              </div>

              {/* COLUMNA DERECHA: JUGADOR 2 */}
              <div className="lg:col-span-3 order-3 lg:order-3 space-y-3">
                <PlayerCard
                  playerId="player2"
                  player={players?.player2}
                  isLocalPlayer={userRole === "both" || userRole === "player2"}
                  canToggleReady={auction.status === "IDLE"}
                  onUpdateName={handleUpdatePlayerName}
                  onToggleReady={handleToggleReady}
                />
                <InventorySlots
                  inventory={players?.player2?.inventory || []}
                />
              </div>

            </div>

            {/* CONTROLES DE FIN DE RONDA: SOLO APARECEN CUANDO AMBOS TIENEN 4/4 RANURAS LLENAS */}
            {((players?.player1?.inventory?.length || 0) >= 4 && (players?.player2?.inventory?.length || 0) >= 4) && (
              <div className="pt-2 animate-fade-in">
                <RoundControls
                  userRole={userRole}
                  players={players}
                  roundVotes={gameState.roundVotes}
                  onVote={handleVote}
                  onCancelVote={handleCancelVote}
                  onDirectAction={handleDirectRoundAction}
                  poolStats={{
                    available: (characterPool?.available || []).length,
                    used: (characterPool?.used || []).length,
                    discarded: (characterPool?.discarded || []).length
                  }}
                />
              </div>
            )}

          </div>
        ) : (
          /* PANEL ADMINISTRADOR (ACCESO EXCLUSIVO POR /admin) */
          <AdminPanel
            settings={settings}
            characterPool={characterPool}
            onUpdateSettings={handleUpdateSettings}
            onAddCharacter={handleAddCharacter}
            onEditCharacter={handleEditCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onResetDatabase={handleResetDatabase}
            onSeedDefaultCharacters={handleSeedDefaultCharacters}
          />
        )}

      </main>

      {/* Modal de Usuarios Conectados en Tiempo Real */}
      <ConnectedUsersModal
        isOpen={connectedModalOpen}
        onClose={() => setConnectedModalOpen(false)}
        connectedUsers={connectedUsers}
        currentUserId={CLIENT_ID}
      />

      {/* Modal de Pool de Personajes (Disponibles / Seleccionados / Desechados) */}
      <CharacterPoolModal
        isOpen={poolModalOpen}
        onClose={() => setPoolModalOpen(false)}
        initialTab={poolModalTab}
        available={characterPool?.available || []}
        discarded={characterPool?.discarded || []}
        used={characterPool?.used || []}
        players={players}
      />

      {/* Pie de página Arcade */}
      <footer className="bg-[#090b12] border-t-2 border-slate-800/80 py-3 px-4 text-center text-xs font-['Chakra_Petch'] text-slate-500">
        Arcade Auction PvP &copy; 2026 &bull; Subasta de Personajes Gamificada &bull; Diseñado con React, Tailwind CSS y Supabase Realtime
      </footer>

    </div>
  );
}
