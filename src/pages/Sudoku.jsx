import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { generatePuzzle } from "../utils/sudokuGenerator";
import { findConflicts } from "../utils/sudokuValidator";
import { saveGame, loadGame, clearGame } from "../utils/sudokuStorage";
import SudokuBoard from "../components/sudoku/SudokuBoard";
import NumberPad from "../components/sudoku/NumberPad";
import Timer from "../components/sudoku/Timer";
import Sidebar from "../components/Sidebar";
import GameControls from "../components/sudoku/GameControls";
import VictoryModal from "../components/sudoku/VictoryModal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { submitScore } from "../services/leaderboardService";
import { validateLeaderboardEligibility } from "../utils/leaderboardValidator";
import {
  hasCompletedToday,
  markCompleted,
  getCompletedResult,
  loadInProgress,
  saveInProgress,
  clearInProgress,
} from "../services/dailyChallengeService";
import { toast } from "react-toastify";
import AuthModal from "../components/AuthModal";

const Sudoku = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initialBoard, setInitialBoard] = useState(null);
  const [board, setBoard] = useState(null);
  const [solution, setSolution] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Game state
  const [gameId, setGameId] = useState(0); // To reset timer on new game
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [difficulty, setDifficulty] = useState("EASY");
  const [started, setStarted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wantsNewGame, setWantsNewGame] = useState(false);
  const [gameMode, setGameMode] = useState(null); // null, 'unlimited', 'daily'
  const [boardMode, setBoardMode] = useState(null); // mode of the currently active board

  const [dailyStatus, setDailyStatus] = useState("loading"); // "loading", "completed", "available"
  const [dailyCompletedResult, setDailyCompletedResult] = useState(null);
  const [dailyInProgress, setDailyInProgress] = useState(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const orb1Cur = useRef({ x: 20, y: 18 });
  const orb2Cur = useRef({ x: 55, y: 58 });

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);
    const o1A = { x: 20, y: 18 };
    const o2A = { x: 55, y: 58 };
    const dA = 3;
    const mA = 4;
    const s1 = 0.00018;
    const s2 = 0.00013;
    const lS = 0.025;
    const lerp = (a, b, t) => a + (b - a) * t;
    let st = null;
    const animate = (ts) => {
      if (!st) st = ts;
      const t = ts - st;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      orb1Cur.current.x = lerp(
        orb1Cur.current.x,
        o1A.x + Math.sin(t * s1) * dA + (mx - 0.5) * mA * 2,
        lS,
      );
      orb1Cur.current.y = lerp(
        orb1Cur.current.y,
        o1A.y + Math.cos(t * s1 * 0.7) * dA + (my - 0.5) * mA * 2,
        lS,
      );
      orb2Cur.current.x = lerp(
        orb2Cur.current.x,
        o2A.x + Math.sin(t * s2 + 2) * dA - (mx - 0.5) * mA * 2,
        lS,
      );
      orb2Cur.current.y = lerp(
        orb2Cur.current.y,
        o2A.y + Math.cos(t * s2 * 0.8 + 1) * dA - (my - 0.5) * mA * 2,
        lS,
      );

      if (orb1Ref.current) {
        orb1Ref.current.style.left = `${orb1Cur.current.x}%`;
        orb1Ref.current.style.top = `${orb1Cur.current.y}%`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.left = `${orb2Cur.current.x}%`;
        orb2Ref.current.style.top = `${orb2Cur.current.y}%`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Notes state
  const [pencilMode, setPencilMode] = useState(false);
  const [notes, setNotes] = useState({}); // { 'row-col': [1, 2] }

  // Undo history
  const [history, setHistory] = useState([]);

  const conflicts = useMemo(() => (board ? findConflicts(board) : []), [board]);

  const startNewGame = useCallback(
    (diff = difficulty, mode = "unlimited") => {
      let seed = undefined;
      if (mode === "daily") {
        const d = new Date();
        seed = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }

      const { puzzle, solvedBoard } = generatePuzzle(diff, seed);
      setInitialBoard(puzzle.map((r) => [...r]));
      setBoard(puzzle.map((r) => [...r]));
      setSolution(solvedBoard);
      setNotes({});
      setHistory([]);
      setSeconds(0);
      setDifficulty(diff);
      setIsComplete(false);
      setIsPlaying(true);
      setGameId((prev) => prev + 1);
      setStarted(true);
      setHintsUsed(0);
      setWantsNewGame(false);
      setGameMode(mode);
      setBoardMode(mode);
    },
    [difficulty],
  );

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setInitialBoard(saved.initialBoard);
      setBoard(saved.board);
      setSolution(saved.solution);
      setNotes(saved.notes);
      setHistory(saved.history);
      setSeconds(saved.seconds);
      if (saved.difficulty) setDifficulty(saved.difficulty);
      if (saved.hintsUsed !== undefined) setHintsUsed(saved.hintsUsed);
      if (saved.gameMode !== undefined) {
        setGameMode(saved.gameMode);
        setBoardMode(saved.boardMode || saved.gameMode);
        if (saved.gameMode === "daily") {
          setDailyStatus("available");
          setDailyInProgress(saved);
        }
      }
    }
  }, []);

  const handleResume = useCallback(() => {
    setStarted(true);
    setIsPlaying(true);
  }, []);

  const getTodaySeed = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSelectDailyMode = async () => {
    setGameMode("daily");
    setDailyStatus("loading");

    const seed = getTodaySeed();
    const uid = user?.id || "local";

    try {
      const completed = await hasCompletedToday(seed, uid);
      if (completed) {
        const result = await getCompletedResult(seed, uid);
        setDailyCompletedResult(result);
        setDailyStatus("completed");
      } else {
        const inProgress = await loadInProgress(seed, uid);
        setDailyInProgress(inProgress);
        setDailyStatus("available");
      }
    } catch (e) {
      console.error(e);
      setDailyStatus("available"); // fallback
    }
  };

  // Check win condition
  useEffect(() => {
    if (!board || !solution) return;
    let won = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) {
          won = false;
          break;
        }
      }
      if (!won) break;
    }
    if (won && !isComplete) {
      setIsComplete(true);
      setIsPlaying(false);
      clearGame();

      let seed = null;
      if (boardMode === "daily") {
        seed = getTodaySeed();
        const uid = user?.id || "local";
        markCompleted({
          seed,
          userId: uid,
          timeMs: seconds * 1000,
          mistakes: 0, // not currently tracked in-game
        });
        clearInProgress(seed, uid);
      }
    }
  }, [
    board,
    solution,
    isComplete,
    difficulty,
    hintsUsed,
    seconds,
    boardMode,
    user,
  ]);

  // Auto-submit score to Supabase when game is completed or user logs in
  useEffect(() => {
    if (
      isComplete &&
      user &&
      !scoreSubmitted &&
      (boardMode === "daily" || difficulty === "EXPERT")
    ) {
      const autoSubmit = async () => {
        try {
          setIsSubmitting(true);
          const seed = boardMode === "daily" ? getTodaySeed() : null;
          const gameData = {
            isComplete: true,
            difficulty: difficulty,
            hintsUsed: hintsUsed,
            timeMs: seconds * 1000,
            mode: boardMode,
            seed: seed,
          };

          const validation = validateLeaderboardEligibility(gameData);
          if (validation.eligible) {
            if (boardMode === "daily") {
              // Mark the challenge as completed for the authenticated user,
              // in case they just logged in from the victory modal.
              await markCompleted({
                seed,
                userId: user.id,
                timeMs: seconds * 1000,
                mistakes: 0,
              });
            }

            const res = await submitScore({
              userId: user.id,
              mode: boardMode,
              seed: seed,
              timeMs: seconds * 1000,
              mistakes: 0,
            });
            console.log("Score submitted successfully!", res);

            if (res?.message === "Not a new best time") {
              toast.info("Score checked. Not a new personal best.", {
                theme: "dark",
              });
            } else {
              toast("Score automatically saved to global leaderboard!", {
                theme: "dark",
              });
            }
          }
          setScoreSubmitted(true);
        } catch (err) {
          console.error("Auto score submit failed:", err);
          toast.error("Failed to auto-save score: " + err.message, {
            theme: "dark",
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      autoSubmit();
    }
  }, [
    isComplete,
    user,
    scoreSubmitted,
    boardMode,
    difficulty,
    seconds,
    hintsUsed,
  ]);

  // Save game whenever state changes
  useEffect(() => {
    if (board && initialBoard && !isComplete) {
      // Synchronously verify we aren't saving a won board due to state lag
      let won = true;
      if (solution) {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (board[r][c] !== solution[r][c]) {
              won = false;
              break;
            }
          }
          if (!won) break;
        }
      } else {
        won = false;
      }

      if (won) return; // Do not auto-save a completed board!

      const gameState = {
        initialBoard,
        board,
        solution,
        notes,
        history,
        seconds,
        difficulty,
        hintsUsed,
        gameMode,
        boardMode,
      };
      saveGame(gameState);

      if (boardMode === "daily") {
        saveInProgress(getTodaySeed(), user?.id || "local", gameState);
      }
    }
  }, [
    board,
    initialBoard,
    solution,
    notes,
    history,
    seconds,
    difficulty,
    hintsUsed,
    gameMode,
    boardMode,
    isComplete,
  ]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev,
      {
        board: board.map((r) => [...r]),
        notes: { ...notes },
      },
    ]);
  }, [board, notes]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const lastState = newHistory.pop();
    setHistory(newHistory);
    setBoard(lastState.board);
    setNotes(lastState.notes);
  }, [history]);

  const handleNumberInput = useCallback(
    (num) => {
      if (!selectedCell || !initialBoard || !board) return;

      const { row, col } = selectedCell;
      // Prevent editing initial clues
      if (initialBoard[row][col] !== 0) return;

      if (num === 0) {
        // Erase
        if (board[row][col] === 0 && !notes[`${row}-${col}`]) return; // Nothing to erase

        pushHistory();
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = 0;
        setBoard(newBoard);

        const newNotes = { ...notes };
        delete newNotes[`${row}-${col}`];
        setNotes(newNotes);
        return;
      }

      if (pencilMode) {
        pushHistory();
        // Toggle note
        const key = `${row}-${col}`;
        const cellNotes = notes[key] || [];
        let newCellNotes;
        if (cellNotes.includes(num)) {
          newCellNotes = cellNotes.filter((n) => n !== num);
        } else {
          newCellNotes = [...cellNotes, num].sort();
        }
        setNotes({ ...notes, [key]: newCellNotes });
      } else {
        // Normal input
        if (board[row][col] === num) return; // No change
        pushHistory();
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = num;
        setBoard(newBoard);
      }
    },
    [selectedCell, initialBoard, board, pencilMode, notes, pushHistory],
  );

  const handleHint = useCallback(() => {
    if (!board || !solution) return;
    if (difficulty === "EXPERT") return;
    if (hintsUsed >= 5) return;

    let targetRow = -1;
    let targetCol = -1;

    // First, look for an incorrect cell to fix
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0 && board[r][c] !== solution[r][c]) {
          targetRow = r;
          targetCol = c;
          break;
        }
      }
      if (targetRow !== -1) break;
    }

    // If no incorrect cells, find a random empty cell
    if (targetRow === -1) {
      const emptyCells = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }

      if (emptyCells.length === 0) return; // Board is full and correct

      const randomCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      targetRow = randomCell.r;
      targetCol = randomCell.c;
    }

    // Apply hint
    pushHistory();
    const newBoard = board.map((r) => [...r]);
    newBoard[targetRow][targetCol] = solution[targetRow][targetCol];
    setBoard(newBoard);

    // Clear notes for this cell
    if (notes[`${targetRow}-${targetCol}`]) {
      const newNotes = { ...notes };
      delete newNotes[`${targetRow}-${targetCol}`];
      setNotes(newNotes);
    }

    // Select the hinted cell to highlight it
    setSelectedCell({ row: targetRow, col: targetCol });

    // Apply penalty and increment count
    setSeconds((s) => s + 30);
    setHintsUsed((h) => h + 1);
  }, [board, solution, notes, pushHistory, difficulty, hintsUsed]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (!selectedCell) return;
      const { row, col } = selectedCell;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleNumberInput(0);
      } else if (e.key === "ArrowUp") {
        setSelectedCell({ row: Math.max(0, row - 1), col });
      } else if (e.key === "ArrowDown") {
        setSelectedCell({ row: Math.min(8, row + 1), col });
      } else if (e.key === "ArrowLeft") {
        setSelectedCell({ row, col: Math.max(0, col - 1) });
      } else if (e.key === "ArrowRight") {
        setSelectedCell({ row, col: Math.min(8, col + 1) });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, handleNumberInput, handleUndo]);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Orbs */}
      <div
        ref={orb1Ref}
        className="fixed rounded-full pointer-events-none z-0 w-[60vw] h-[60vw] blur-[4px] bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]"
        style={{ willChange: "left,top", left: "20%", top: "20%" }}
      />
      <div
        ref={orb2Ref}
        className="fixed rounded-full pointer-events-none z-0 w-[50vw] h-[50vw] blur-[4px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]"
        style={{ willChange: "left,top", left: "55%", top: "60%" }}
      />

      {/* Sidebar toggle */}
      <button
        className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "✕ Close" : "🎮 Games"}
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Card Wrapper */}
      <div className="relative z-[1] w-full max-w-[500px] bg-white/[0.04] border border-white/10 p-3 sm:p-6 md:p-8 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] flex flex-col items-center">
        {!started ? (
          <>
            {gameMode === null && (
              /* Mode Selection Screen */
              <div className="text-center flex flex-col items-center gap-4 sm:gap-5 w-full animate-fade-in-scale relative pt-2">
                <div
                  className="text-[3rem] sm:text-[4rem] mb-1 sm:mb-2 animate-float"
                  style={{
                    filter: "drop-shadow(0 0 25px rgba(99,102,241,0.45))",
                  }}
                >
                  🧩
                </div>
                <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight mb-1">
                  Sudoku
                </h1>
                <p className="text-[0.8rem] sm:text-[0.9rem] text-white/50 leading-relaxed max-w-[380px] mb-2">
                  Select a game mode to test your logic skills.
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    className="w-full text-left p-3.5 sm:p-4 bg-white/[0.03] border border-white/8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer active:scale-[0.98] group flex items-center justify-between"
                    onClick={() => handleSelectDailyMode()}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div className="flex flex-col text-left">
                        <strong className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                          Daily Challenge
                        </strong>
                        <span className="text-xs text-white/45">
                          One special puzzle every day
                        </span>
                      </div>
                    </div>
                    <span className="text-white/30 group-hover:text-white/60 transition-colors">
                      ➔
                    </span>
                  </button>
                  <button
                    className="w-full text-left p-3.5 sm:p-4 bg-white/[0.03] border border-white/8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer active:scale-[0.98] group flex items-center justify-between"
                    onClick={() => setGameMode("unlimited")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">♾️</span>
                      <div className="flex flex-col text-left">
                        <strong className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                          Unlimited Mode
                        </strong>
                        <span className="text-xs text-white/45">
                          Play custom puzzles anytime
                        </span>
                      </div>
                    </div>
                    <span className="text-white/30 group-hover:text-white/60 transition-colors">
                      ➔
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3 w-full text-left mt-2">
                  {[
                    {
                      icon: "✏️",
                      title: "Pencil Notes",
                      desc: "Jot down numbers inside cells to keep track of candidates.",
                    },
                    {
                      icon: "↩️",
                      title: "Full Undo & Hints",
                      desc: "Step backwards using Undo, or get a Hint to place correct numbers.",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 sm:gap-3 bg-white/[0.02] border border-white/6 p-2.5 sm:p-3 px-3 sm:px-4 items-center"
                    >
                      <span className="text-[1.1rem] sm:text-[1.3rem]">
                        {f.icon}
                      </span>
                      <div className="flex flex-col gap-[0.1rem] sm:gap-[0.15rem]">
                        <strong className="text-[0.78rem] sm:text-[0.85rem] font-bold text-white">
                          {f.title}
                        </strong>
                        <span className="text-[0.68rem] sm:text-[0.74rem] text-white/45 leading-[1.3] sm:leading-[1.4]">
                          {f.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameMode === "unlimited" && (
              /* Unlimited Start Screen */
              <div className="text-center flex flex-col items-center gap-4 sm:gap-5 w-full">
                <div className="flex justify-between items-center w-full mb-1">
                  <button
                    onClick={() => setGameMode(null)}
                    className="text-[0.68rem] sm:text-[0.72rem] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Modes
                  </button>
                </div>
                <div
                  className="text-[3rem] sm:text-[4rem] mb-1 sm:mb-2 animate-float"
                  style={{
                    filter: "drop-shadow(0 0 25px rgba(99,102,241,0.45))",
                  }}
                >
                  🧩
                </div>
                <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight mb-1">
                  Unlimited Mode
                </h1>
                <p className="text-[0.8rem] sm:text-[0.9rem] text-white/50 leading-relaxed max-w-[380px] mb-1 sm:mb-2">
                  Select a difficulty to start a new game, or resume your game
                  in progress.
                </p>

                {board && !wantsNewGame && boardMode !== "daily" ? (
                  /* Resume / New Game Choices */
                  <div className="flex flex-col gap-3 w-full animate-fade-in-scale">
                    <button
                      className="w-full py-[0.7rem] sm:py-[0.85rem] text-[0.82rem] sm:text-[0.9rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px active:scale-[0.98]"
                      onClick={handleResume}
                    >
                      ▶ Resume Game
                    </button>
                    <button
                      className="w-full py-[0.7rem] sm:py-[0.85rem] text-[0.82rem] sm:text-[0.9rem] font-bold cursor-pointer bg-white/[0.04] border-[1.5px] border-white/8 text-white/60 hover:bg-white/8 hover:text-white transition-all duration-200 active:scale-[0.98]"
                      onClick={() => setWantsNewGame(true)}
                    >
                      🔄 New Game
                    </button>
                  </div>
                ) : (
                  /* Difficulty selector */
                  <div className="w-full animate-fade-in-scale">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[0.68rem] sm:text-[0.72rem] font-bold text-white/40 uppercase tracking-widest text-left">
                        Choose Difficulty
                      </p>
                      {board && (
                        <button
                          onClick={() => setWantsNewGame(false)}
                          className="text-[0.65rem] sm:text-[0.72rem] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          ← Back
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1 sm:gap-1.5 max-sm:grid-cols-2">
                      {[
                        { id: "EASY", color: "text-emerald-400" },
                        { id: "MEDIUM", color: "text-amber-400" },
                        { id: "HARD", color: "text-orange-500" },
                        { id: "EXPERT", color: "text-red-500" },
                      ].map((d) => (
                        <button
                          key={d.id}
                          onClick={() => startNewGame(d.id)}
                          className={`py-[0.5rem] sm:py-[0.6rem] px-1 sm:px-2 text-[0.65rem] sm:text-[0.72rem] font-bold border cursor-pointer transition-all duration-150 active:scale-95 bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/8 hover:border-white/20 hover:text-white ${d.id === "EXPERT" ? "relative overflow-hidden group" : ""}`}
                        >
                          {d.id === "EXPERT" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                          )}
                          <span
                            className={
                              d.id === "EXPERT"
                                ? "relative z-10 text-red-400 group-hover:text-red-300"
                                : ""
                            }
                          >
                            {d.id}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 sm:mt-2.5 flex items-center justify-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500/80 px-3 py-1.5 sm:py-2 text-[0.65rem] sm:text-[0.7rem] font-medium text-center leading-tight shadow-sm w-full">
                      <span className="text-[0.75rem] sm:text-[0.8rem]">
                        🏆
                      </span>
                      <span>
                        Leaderboard points are only awarded in{" "}
                        <strong>EXPERT</strong> mode.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:gap-3 w-full text-left mb-1 sm:mb-2 mt-1 sm:mt-2 animate-fade-in-scale">
                  {[
                    {
                      icon: "✏️",
                      title: "Pencil Notes",
                      desc: "Jot down numbers inside cells to keep track of candidates.",
                    },
                    {
                      icon: "↩️",
                      title: "Full Undo & Hints",
                      desc: "Step backwards using Undo, or get a Hint to place correct numbers.",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 sm:gap-3 bg-white/[0.02] border border-white/6 p-2.5 sm:p-3 px-3 sm:px-4 items-center"
                    >
                      <span className="text-[1.1rem] sm:text-[1.3rem]">
                        {f.icon}
                      </span>
                      <div className="flex flex-col gap-[0.1rem] sm:gap-[0.15rem]">
                        <strong className="text-[0.78rem] sm:text-[0.85rem] font-bold text-white">
                          {f.title}
                        </strong>
                        <span className="text-[0.68rem] sm:text-[0.74rem] text-white/45 leading-[1.3] sm:leading-[1.4]">
                          {f.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameMode === "daily" && (
              /* Daily Start Screen */
              <div className="text-center flex flex-col items-center gap-5 w-full animate-fade-in-scale py-6">
                <div className="flex justify-between items-center w-full mb-1">
                  <button
                    onClick={() => setGameMode(null)}
                    className="text-[0.68rem] sm:text-[0.72rem] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Modes
                  </button>
                </div>

                {dailyStatus === "loading" ? (
                  <div className="py-12 flex flex-col items-center gap-4 text-white/50">
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Checking today's challenge...</p>
                  </div>
                ) : dailyStatus === "completed" ? (
                  <div className="flex flex-col items-center gap-4 animate-fade-in-scale">
                    <div
                      className="text-[4rem] mb-2 animate-bounce-slight"
                      style={{
                        filter: "drop-shadow(0 0 25px rgba(52,211,153,0.45))",
                      }}
                    >
                      ✅
                    </div>
                    <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#34d399,#10b981)] bg-clip-text text-transparent tracking-tight leading-[1.1]">
                      Challenge
                      <br />
                      Complete!
                    </h1>
                    <p className="text-[0.9rem] text-white/70 max-w-[280px] mb-2">
                      You've already conquered today's puzzle. Come back
                      tomorrow for a new challenge!
                    </p>

                    <div className="bg-white/5 border border-white/10 p-4 w-full flex flex-col gap-2 mb-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Time:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {dailyCompletedResult?.timeMs
                            ? `${Math.floor(dailyCompletedResult.timeMs / 60000)
                                .toString()
                                .padStart(2, "0")}:${Math.floor(
                                (dailyCompletedResult.timeMs % 60000) / 1000,
                              )
                                .toString()
                                .padStart(2, "0")}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Mistakes:</span>
                        <span className="font-bold text-white/90">
                          {dailyCompletedResult?.mistakes || 0}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setGameMode(null)}
                      className="mt-2 w-full py-[0.8rem] text-[0.9rem] font-bold border-none cursor-pointer bg-white/[0.05] border-[1.5px] border-white/10 text-white hover:bg-white/10 transition-all duration-200 active:scale-[0.98]"
                    >
                      Return to Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="text-[4rem] mb-1 sm:mb-2 animate-float"
                      style={{
                        filter: "drop-shadow(0 0 25px rgba(244,114,182,0.45))",
                      }}
                    >
                      📅
                    </div>
                    <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#f472b6,#fb7185,#fda4af)] bg-clip-text text-transparent tracking-tight">
                      Daily Challenge
                    </h1>
                    <p className="text-[0.85rem] sm:text-[0.9rem] text-white/50 leading-relaxed max-w-[280px]">
                      Everyone plays the same Medium Sudoku. A new puzzle
                      unlocks every day!
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-2">
                      <span className="text-white/70 text-sm font-bold tracking-widest uppercase">
                        {new Date().toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {dailyInProgress ? (
                      /* Resume Choice */
                      <div className="flex flex-col gap-3 w-full animate-fade-in-scale">
                        <button
                          className="w-full py-[0.7rem] sm:py-[0.85rem] text-[0.82rem] sm:text-[0.9rem] font-bold border-none cursor-pointer rounded-xl bg-[linear-gradient(135deg,#ec4899,#f43f5e)] text-white shadow-[0_4px_18px_rgba(236,72,153,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(236,72,153,0.5)] hover:-translate-y-px active:scale-[0.98]"
                          onClick={() => {
                            setInitialBoard(dailyInProgress.initialBoard);
                            setBoard(dailyInProgress.board);
                            setSolution(dailyInProgress.solution);
                            setNotes(dailyInProgress.notes);
                            setHistory(dailyInProgress.history);
                            setSeconds(dailyInProgress.seconds);
                            setDifficulty(dailyInProgress.difficulty);
                            setHintsUsed(dailyInProgress.hintsUsed);
                            setBoardMode(dailyInProgress.boardMode);
                            setStarted(true);
                            setIsPlaying(true);
                          }}
                        >
                          ▶ Resume Today's Puzzle
                        </button>
                        <button
                          className="w-full py-[0.7rem] sm:py-[0.85rem] text-[0.82rem] sm:text-[0.9rem] font-bold cursor-pointer rounded-xl bg-white/[0.04] border-[1.5px] border-white/8 text-white/60 hover:bg-white/8 hover:text-white transition-all duration-200 active:scale-[0.98]"
                          onClick={() => startNewGame("MEDIUM", "daily")}
                        >
                          🔄 Restart Puzzle
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startNewGame("MEDIUM", "daily")}
                        className="w-full py-[0.8rem] sm:py-[0.95rem] text-[0.85rem] sm:text-[0.95rem] font-bold border-none cursor-pointer rounded-xl bg-[linear-gradient(135deg,#ec4899,#f43f5e)] text-white shadow-[0_4px_18px_rgba(236,72,153,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(236,72,153,0.5)] hover:-translate-y-px active:scale-[0.98]"
                      >
                        ▶ Play Today's Puzzle
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          /* Game Screen */
          <>
            {/* Header inside the Card */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 w-full gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[1.1rem] sm:text-[1.25rem] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight">
                  Sudoku
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="rounded-full font-bold tracking-wide bg-indigo-500/20 border border-indigo-500/35 px-[0.75rem] sm:px-[0.9rem] py-[0.25rem] sm:py-[0.3rem] text-[0.75rem] sm:text-[0.85rem] text-violet-300">
                  {boardMode === "daily" ? "DAILY CHALLENGE" : difficulty}
                </div>
                <Timer seconds={seconds} />
              </div>
            </div>

            {board && initialBoard ? (
              <div className="w-full flex flex-col items-center">
                <div className="bg-[#1e293b]/80 p-2 sm:p-4 rounded-xl shadow-2xl ring-1 ring-white/10 w-full">
                  <SudokuBoard
                    board={board}
                    initialBoard={initialBoard}
                    selectedCell={selectedCell}
                    conflicts={conflicts}
                    notes={notes}
                    onCellClick={handleCellClick}
                  />
                </div>

                <GameControls
                  pencilMode={pencilMode}
                  togglePencilMode={() => setPencilMode(!pencilMode)}
                  onErase={() => handleNumberInput(0)}
                  onUndo={handleUndo}
                  canUndo={history.length > 0}
                  onHint={handleHint}
                  hintsRemaining={5 - hintsUsed}
                  isExpert={difficulty === "EXPERT" || boardMode === "daily"}
                />

                <NumberPad onNumberClick={handleNumberInput} />

                {/* Secondary Actions */}
                <div
                  className={`grid ${boardMode === "daily" ? "grid-cols-2" : "grid-cols-3"} gap-[0.4rem] sm:gap-[0.6rem] mt-4 sm:mt-5 border-t border-white/6 pt-3 sm:pt-4 w-full`}
                >
                  <button
                    className="inline-flex items-center justify-center gap-1 bg-white/[0.04] border border-white/8 text-white/55 py-[0.5rem] sm:py-[0.6rem] text-[0.7rem] sm:text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                    onClick={() => {
                      pushHistory();
                      setBoard(initialBoard.map((r) => [...r]));
                      setNotes({});
                    }}
                  >
                    🔄 Restart
                  </button>
                  {boardMode !== "daily" && (
                    <button
                      className="inline-flex items-center justify-center gap-1 bg-white/[0.04] border border-white/8 text-white/55 py-[0.5rem] sm:py-[0.6rem] text-[0.7rem] sm:text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                      onClick={() => startNewGame(difficulty)}
                    >
                      🧩 New Game
                    </button>
                  )}
                  <button
                    className="inline-flex items-center justify-center gap-1 bg-white/[0.04] border border-white/8 text-white/55 py-[0.5rem] sm:py-[0.6rem] text-[0.7rem] sm:text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                    onClick={() => {
                      setIsPlaying(false);
                      setStarted(false);
                      setWantsNewGame(false);
                    }}
                  >
                    🏠 Home
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xl animate-pulse text-blue-300 py-12">
                Generating Puzzle...
              </div>
            )}
          </>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <VictoryModal
        isOpen={isComplete}
        time={seconds}
        difficulty={difficulty}
        isDaily={boardMode === "daily"}
        user={user}
        scoreSubmitted={scoreSubmitted}
        isSubmitting={isSubmitting}
        onSaveScore={() => {
          if (!user) {
            toast.info(
              "Please sign in to save your score to the global leaderboard!",
              { theme: "dark", autoClose: 4000 },
            );
            setAuthModalOpen(true);
          }
        }}
        onPlayAgain={() => {
          setScoreSubmitted(false);
          startNewGame(difficulty);
        }}
        onBackToMenu={() => {
          setScoreSubmitted(false);
          setIsComplete(false);
          setStarted(false);
          setGameMode(null);
          setBoard(null);
          setInitialBoard(null);
        }}
      />
    </div>
  );
};

export default Sudoku;
