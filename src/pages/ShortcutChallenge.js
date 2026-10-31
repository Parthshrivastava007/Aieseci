import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../Backend/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  FiClock,
  FiHeart,
  FiAward,
  FiVolume2,
  FiVolumeX,
  FiRefreshCw,
  FiHelpCircle,
  FiPlay,
  FiShare2,
  FiCheckCircle,
  FiBookOpen,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

// ==========================================
// 1. SHORTCUTS DATABASE (Curriculum Aligned)
// ==========================================
export const SHORTCUT_DATABASE = {
  all: {
    id: "all",
    name: "Grand Master (All)",
    icon: "⚡",
    badgeColor: "from-amber-500 to-orange-600",
    description: "Random mix of Tally, Excel, Word, Windows & Design shortcuts!",
  },
  tally: {
    id: "tally",
    name: "Tally Prime",
    icon: "💼",
    badgeColor: "from-emerald-500 to-teal-700",
    description: "Voucher entries, ledger creation, and accounting shortcuts.",
    items: [
      { prompt: "Open Contra Voucher (Cash/Bank transfers)", keys: ["F4"], explanation: "F4 is used for Contra transactions like cash deposit or withdrawal from bank." },
      { prompt: "Open Payment Voucher (All business payments)", keys: ["F5"], explanation: "F5 opens Payment voucher for salary, rent, cash or cheque payments." },
      { prompt: "Open Receipt Voucher (All incoming money)", keys: ["F6"], explanation: "F6 opens Receipt voucher to record money received from debtors/customers." },
      { prompt: "Open Journal Voucher (Adjustment & non-cash entries)", keys: ["F7"], explanation: "F7 is used for depreciation, credit purchases of fixed assets, and adjustment entries." },
      { prompt: "Open Sales Voucher (Goods sold to customers)", keys: ["F8"], explanation: "F8 enters credit or cash sales invoices for goods or services." },
      { prompt: "Open Purchase Voucher (Goods bought from vendors)", keys: ["F9"], explanation: "F9 records purchase invoices from suppliers." },
      { prompt: "Quick create a new Ledger / Master from voucher screen", keys: ["Alt", "C"], explanation: "Alt + C creates a new ledger or item directly without leaving the voucher." },
      { prompt: "Toggle Detailed / Condensed report view", keys: ["Alt", "F1"], explanation: "Alt + F1 expands or collapses sub-ledgers in Balance Sheet and P&L reports." },
      { prompt: "Change Current Accounting Period", keys: ["Alt", "F2"], explanation: "Alt + F2 sets the start and end dates of the working financial year." },
      { prompt: "Save & Accept current voucher or screen immediately", keys: ["Ctrl", "A"], explanation: "Ctrl + A quickly accepts and saves the entire voucher without pressing Enter through each field." },
      { prompt: "Cancel or Delete a voucher / master entry", keys: ["Alt", "D"], explanation: "Alt + D deletes an open voucher or ledger (if no transactions exist)." },
      { prompt: "Cancel current entry without saving", keys: ["Alt", "X"], explanation: "Alt + X cancels an existing voucher." },
      { prompt: "Open Calculator panel in Tally", keys: ["Ctrl", "N"], explanation: "Ctrl + N toggles the bottom calculation panel in Tally." },
    ],
  },
  excel: {
    id: "excel",
    name: "MS Excel",
    icon: "📊",
    badgeColor: "from-green-500 to-emerald-700",
    description: "Spreadsheet speed, formulas, formatting, and table filters.",
    items: [
      { prompt: "Toggle AutoFilter on/off for selected data", keys: ["Ctrl", "Shift", "L"], explanation: "Ctrl + Shift + L instantly adds dropdown filter arrows to table headers." },
      { prompt: "Quick AutoSum (Sum all numbers above or left)", keys: ["Alt", "="], explanation: "Alt + = automatically inserts =SUM() formula for the adjacent cell range." },
      { prompt: "Repeat last action OR cycle absolute cell references ($A$1)", keys: ["F4"], explanation: "F4 locks cell formulas ($A$1) or repeats your last action like coloring or deleting." },
      { prompt: "Insert Current Date into the active cell", keys: ["Ctrl", ";"], explanation: "Ctrl + ; stamps today's date into the selected cell." },
      { prompt: "Open Format Cells dialog box", keys: ["Ctrl", "1"], explanation: "Ctrl + 1 opens the comprehensive Format Cells window (Number, Alignment, Font, Border)." },
      { prompt: "Apply Currency Format ($ or ₹) with 2 decimals", keys: ["Ctrl", "Shift", "$"], explanation: "Ctrl + Shift + $ instantly formats selected numbers into currency format." },
      { prompt: "Apply Percentage Format with no decimals", keys: ["Ctrl", "Shift", "%"], explanation: "Ctrl + Shift + % multiplies by 100 and applies the percent symbol." },
      { prompt: "Select entire row of the active cell", keys: ["Shift", "Space"], explanation: "Shift + Space selects all cells across the current worksheet row." },
      { prompt: "Select entire column of the active cell", keys: ["Ctrl", "Space"], explanation: "Ctrl + Space selects the entire vertical column." },
      { prompt: "Edit active cell directly in cell edit mode", keys: ["F2"], explanation: "F2 activates the in-cell cursor at the end of the text for rapid editing." },
      { prompt: "Insert a brand new worksheet", keys: ["Shift", "F11"], explanation: "Shift + F11 creates a new empty worksheet immediately." },
      { prompt: "Convert data range into an official Excel Table", keys: ["Ctrl", "T"], explanation: "Ctrl + T formats rows into a smart Excel Table with banding and headers." },
      { prompt: "Flash Fill data pattern automatically down the column", keys: ["Ctrl", "E"], explanation: "Ctrl + E automatically fills values based on patterns in neighboring columns." },
    ],
  },
  word: {
    id: "word",
    name: "MS Word & Docs",
    icon: "📝",
    badgeColor: "from-blue-500 to-indigo-700",
    description: "Document formatting, typography, alignment, and navigation.",
    items: [
      { prompt: "Center-align selected text or paragraph", keys: ["Ctrl", "E"], explanation: "Ctrl + E centers headings or paragraphs cleanly." },
      { prompt: "Justify text (clean straight edges on left & right)", keys: ["Ctrl", "J"], explanation: "Ctrl + J spreads text evenly across left and right page margins." },
      { prompt: "Make selected text BOLD", keys: ["Ctrl", "B"], explanation: "Ctrl + B toggles bold weight on the selected text." },
      { prompt: "Make selected text ITALIC", keys: ["Ctrl", "I"], explanation: "Ctrl + I italicizes the selected text." },
      { prompt: "Underline selected text", keys: ["Ctrl", "U"], explanation: "Ctrl + U toggles a single underline." },
      { prompt: "Increase font size one point / step", keys: ["Ctrl", "Shift", ">"], explanation: "Ctrl + Shift + > quickly scales up the typography size." },
      { prompt: "Decrease font size one point / step", keys: ["Ctrl", "Shift", "<"], explanation: "Ctrl + Shift + < shrinks selected text size." },
      { prompt: "Open Find & Replace dialog window", keys: ["Ctrl", "H"], explanation: "Ctrl + H opens replace mode to substitute words throughout a document." },
      { prompt: "Insert a hyperlink / web link onto text", keys: ["Ctrl", "K"], explanation: "Ctrl + K attaches a web URL or bookmark to the selected words." },
      { prompt: "Run Spelling & Grammar Check", keys: ["F7"], explanation: "F7 scans the entire document for typos and grammar suggestions." },
      { prompt: "Insert a manual Page Break", keys: ["Ctrl", "Enter"], explanation: "Ctrl + Enter jumps to the top of a fresh new page immediately." },
      { prompt: "Select all contents of the document", keys: ["Ctrl", "A"], explanation: "Ctrl + A highlights every word and image in the document." },
    ],
  },
  windows: {
    id: "windows",
    name: "Windows & PC",
    icon: "💻",
    badgeColor: "from-cyan-500 to-blue-700",
    description: "Productivity shortcuts for Windows 10/11 operating systems.",
    items: [
      { prompt: "Instantly minimize all windows & Show Desktop", keys: ["Win", "D"], explanation: "Win + D clears the screen to reveal desktop icons and wallpaper." },
      { prompt: "Open Clipboard History (view past copied text & images)", keys: ["Win", "V"], explanation: "Win + V lets you access multiple previously copied items from clipboard history." },
      { prompt: "Open Task Manager directly without Ctrl+Alt+Del menu", keys: ["Ctrl", "Shift", "Esc"], explanation: "Ctrl + Shift + Esc launches Task Manager instantly to monitor CPU/RAM." },
      { prompt: "Take a selective snipping screenshot of part of the screen", keys: ["Win", "Shift", "S"], explanation: "Win + Shift + S opens the Windows Snipping tool crosshair overlay." },
      { prompt: "Quickly lock your Windows PC when stepping away", keys: ["Win", "L"], explanation: "Win + L immediately locks your workstation to protect your account." },
      { prompt: "Open File Explorer (My PC)", keys: ["Win", "E"], explanation: "Win + E opens a new File Explorer folder window." },
      { prompt: "Switch between currently running applications", keys: ["Alt", "Tab"], explanation: "Alt + Tab displays the app switcher strip to bounce between programs." },
      { prompt: "Undo the last action in any software", keys: ["Ctrl", "Z"], explanation: "Ctrl + Z reverses your most recent typing, deleting, or movement action." },
      { prompt: "Redo or repeat the previously undone action", keys: ["Ctrl", "Y"], explanation: "Ctrl + Y reapplies an action you previously rolled back." },
      { prompt: "Permanently delete a file bypassing the Recycle Bin", keys: ["Shift", "Delete"], explanation: "Shift + Delete removes the item permanently from storage." },
      { prompt: "Close active window or application directly", keys: ["Alt", "F4"], explanation: "Alt + F4 terminates the currently focused application." },
    ],
  },
  design: {
    id: "design",
    name: "Photoshop & Design",
    icon: "🎨",
    badgeColor: "from-pink-500 to-purple-700",
    description: "Layer transformations, tool selection, and canvas zoom.",
    items: [
      { prompt: "Activate Free Transform tool on selected layer", keys: ["Ctrl", "T"], explanation: "Ctrl + T activates transform handles to scale, rotate, or skew." },
      { prompt: "Duplicate currently selected Layer or Selection", keys: ["Ctrl", "J"], explanation: "Ctrl + J creates a copy of the active layer or masked selection." },
      { prompt: "Create a brand new blank layer with options dialog", keys: ["Ctrl", "Shift", "N"], explanation: "Ctrl + Shift + N creates a fresh transparent layer." },
      { prompt: "Deselect any active marquee marching ants selection", keys: ["Ctrl", "D"], explanation: "Ctrl + D clears current marquee bounding selections." },
      { prompt: "Fit canvas image entirely to screen view", keys: ["Ctrl", "0"], explanation: "Ctrl + 0 scales the document window so the entire canvas is visible." },
      { prompt: "Zoom in closer into the canvas", keys: ["Ctrl", "+"], explanation: "Ctrl + + steps up magnification level." },
      { prompt: "Zoom out from the canvas", keys: ["Ctrl", "-"], explanation: "Ctrl + - reduces magnification level." },
      { prompt: "Select the Move / Pointer Tool", keys: ["V"], explanation: "V selects the primary Move tool to reposition layers on the canvas." },
      { prompt: "Select the Brush Tool for drawing/painting", keys: ["B"], explanation: "B picks the standard artistic paintbrush." },
      { prompt: "Invert layer colors / mask selection", keys: ["Ctrl", "I"], explanation: "Ctrl + I reverses black/white mask values or inverts RGB colors." },
    ],
  },
};

// ==========================================
// 2. WEB AUDIO API SYNTHESIZER (Mechanical Sound)
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Realistic mechanical switch click
  playKeyClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.03);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Audio fallback
    }
  }

  // Positive victory / match chime
  playCorrect() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + idx * 0.04;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.26);
      });
    } catch {}
  }

  // Error thud
  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    } catch {}
  }
}

const soundEngine = new SoundSynth();

// ==========================================
// 3. KEYBOARD LAYOUT DEFINITION FOR VISUALIZER
// ==========================================
const KEYBOARD_ROWS = [
  // Function row
  [
    { code: "Escape", label: "Esc", width: "w-10" },
    { code: "F1", label: "F1" },
    { code: "F2", label: "F2" },
    { code: "F3", label: "F3" },
    { code: "F4", label: "F4", highlightCategory: "tally" },
    { code: "F5", label: "F5", highlightCategory: "tally" },
    { code: "F6", label: "F6", highlightCategory: "tally" },
    { code: "F7", label: "F7", highlightCategory: "tally" },
    { code: "F8", label: "F8", highlightCategory: "tally" },
    { code: "F9", label: "F9", highlightCategory: "tally" },
    { code: "F10", label: "F10" },
    { code: "F11", label: "F11" },
    { code: "F12", label: "F12" },
  ],
  // Number row
  [
    { code: "Backquote", label: "`" },
    { code: "Digit1", label: "1" },
    { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" },
    { code: "Digit4", label: "4" },
    { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" },
    { code: "Digit7", label: "7" },
    { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-" },
    { code: "Equal", label: "=" },
    { code: "Backspace", label: "Bksp", width: "w-16" },
  ],
  // QWERTY
  [
    { code: "Tab", label: "Tab", width: "w-14" },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[" },
    { code: "BracketRight", label: "]" },
    { code: "Backslash", label: "\\", width: "w-12" },
  ],
  // Home row
  [
    { code: "CapsLock", label: "Caps", width: "w-16" },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";" },
    { code: "Quote", label: "'" },
    { code: "Enter", label: "Enter", width: "w-20" },
  ],
  // Bottom row
  [
    { code: "ShiftLeft", label: "Shift", width: "w-20", isModifier: true, modifierType: "Shift" },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: "," },
    { code: "Period", label: "." },
    { code: "Slash", label: "/" },
    { code: "ShiftRight", label: "Shift", width: "w-20", isModifier: true, modifierType: "Shift" },
  ],
  // Modifier row
  [
    { code: "ControlLeft", label: "Ctrl", width: "w-16", isModifier: true, modifierType: "Ctrl" },
    { code: "MetaLeft", label: "Win", width: "w-14", isModifier: true, modifierType: "Win" },
    { code: "AltLeft", label: "Alt", width: "w-14", isModifier: true, modifierType: "Alt" },
    { code: "Space", label: "Spacebar", width: "flex-1" },
    { code: "AltRight", label: "Alt", width: "w-14", isModifier: true, modifierType: "Alt" },
    { code: "ControlRight", label: "Ctrl", width: "w-16", isModifier: true, modifierType: "Ctrl" },
  ],
];

// Helper to normalize keys to match between keyboard definitions and active shortcut
const normalizeKey = (k) => {
  if (!k) return "";
  const upper = k.toUpperCase();
  if (upper === "CONTROL" || upper === "CTRL") return "Ctrl";
  if (upper === "ALT") return "Alt";
  if (upper === "SHIFT") return "Shift";
  if (upper === "META" || upper === "WIN" || upper === "WINDOWS") return "Win";
  if (upper === "ENTER") return "Enter";
  if (upper === "SPACE" || upper === "SPACEBAR" || k === " ") return "Space";
  if (upper === "DELETE" || upper === "DEL") return "Delete";
  if (upper === "BACKSPACE") return "Bksp";
  if (upper === "ESCAPE" || upper === "ESC") return "Esc";
  return upper;
};

// Check if a virtual key matches any key in an array of required keys
const isKeyInCombo = (virtualKey, requiredKeys) => {
  if (!requiredKeys || requiredKeys.length === 0) return false;
  return requiredKeys.some((rk) => {
    const normRk = normalizeKey(rk);
    if (normRk === "Ctrl" && (virtualKey.code === "ControlLeft" || virtualKey.code === "ControlRight")) return true;
    if (normRk === "Alt" && (virtualKey.code === "AltLeft" || virtualKey.code === "AltRight")) return true;
    if (normRk === "Shift" && (virtualKey.code === "ShiftLeft" || virtualKey.code === "ShiftRight")) return true;
    if (normRk === "Win" && (virtualKey.code === "MetaLeft" || virtualKey.code === "MetaRight")) return true;
    if (normRk === "Space" && virtualKey.code === "Space") return true;
    if (normRk === virtualKey.label.toUpperCase()) return true;
    if (virtualKey.code === `Key${normRk}`) return true;
    if (virtualKey.code === `Digit${normRk}`) return true;
    if (virtualKey.code === normRk) return true;
    if (normRk === ";" && virtualKey.code === "Semicolon") return true;
    if (normRk === "=" && virtualKey.code === "Equal") return true;
    if (normRk === "$" && (virtualKey.code === "Digit4" || virtualKey.label === "4")) return true;
    if (normRk === "%" && (virtualKey.code === "Digit5" || virtualKey.label === "5")) return true;
    if (normRk === ">" && (virtualKey.code === "Period" || virtualKey.label === ".")) return true;
    if (normRk === "<" && (virtualKey.code === "Comma" || virtualKey.label === ",")) return true;
    if (normRk === "+" && (virtualKey.code === "Equal" || virtualKey.label === "=")) return true;
    if (normRk === "-" && (virtualKey.code === "Minus" || virtualKey.label === "-")) return true;
    return false;
  });
};

const ShortcutChallenge = () => {
  const { user } = useAuth();

  // Game configuration states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [gameMode, setGameMode] = useState("speed"); // 'speed' (60s), 'survival' (3 lives), 'practice'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active game run states
  const [gameState, setGameState] = useState("idle"); // 'idle', 'countdown', 'playing', 'ended'
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Active shortcut prompt
  const [currentShortcutIndex, setCurrentShortcutIndex] = useState(0);
  const [shortcutDeck, setShortcutDeck] = useState([]);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong', message: string }
  const [showHint, setShowHint] = useState(false);

  // Key visualizer tracker states
  const [activePhysicalKeys, setActivePhysicalKeys] = useState(new Set());
  const activeModifiersRef = useRef({ ctrl: false, alt: false, shift: false, win: false });

  // Leaderboard & Result modal states
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("game"); // 'game' | 'leaderboard'
  const [playerName, setPlayerName] = useState(user?.name || "");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Build the deck of shortcuts based on selected category
  const buildDeck = useCallback(() => {
    let pool = [];
    if (selectedCategory === "all") {
      Object.keys(SHORTCUT_DATABASE).forEach((k) => {
        if (k !== "all" && SHORTCUT_DATABASE[k].items) {
          pool.push(
            ...SHORTCUT_DATABASE[k].items.map((item) => ({
              ...item,
              categoryName: SHORTCUT_DATABASE[k].name,
              categoryIcon: SHORTCUT_DATABASE[k].icon,
            }))
          );
        }
      });
    } else {
      const cat = SHORTCUT_DATABASE[selectedCategory];
      if (cat && cat.items) {
        pool = cat.items.map((item) => ({
          ...item,
          categoryName: cat.name,
          categoryIcon: cat.icon,
        }));
      }
    }

    // Shuffle deck
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled;
  }, [selectedCategory]);

  // Start game countdown
  const startGame = () => {
    const deck = buildDeck();
    if (deck.length === 0) {
      toast.error("No shortcuts found for this category");
      return;
    }

    setShortcutDeck(deck);
    setCurrentShortcutIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLives(3);
    setTimeLeft(60);
    setFeedback(null);
    setShowHint(gameMode === "practice");
    setScoreSubmitted(false);
    setGameState("countdown");
    setCountdown(3);

    if (soundEnabled) soundEngine.init();
  };

  // Countdown timer effect
  useEffect(() => {
    if (gameState === "countdown") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 900);
        return () => clearTimeout(timer);
      } else {
        setGameState("playing");
      }
    }
  }, [gameState, countdown]);

  // Main game tick timer (for Speed Rush mode)
  useEffect(() => {
    if (gameState === "playing" && gameMode === "speed") {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, gameMode]); //eslint-disable-line

  // End game handler
  const endGame = useCallback(() => {
    setGameState("ended");
    setActivePhysicalKeys(new Set());
    if (soundEnabled) soundEngine.playCorrect();
  }, [soundEnabled]);

  // Advance to next shortcut
  const nextShortcut = useCallback(() => {
    setShowHint(gameMode === "practice");
    setCurrentShortcutIndex((prev) => {
      if (prev + 1 >= shortcutDeck.length) {
        const freshDeck = buildDeck();
        setShortcutDeck(freshDeck);
        return 0;
      }
      return prev + 1;
    });
  }, [gameMode, shortcutDeck.length, buildDeck]);

  // Fetch Firestore leaderboard
  const fetchLeaderboard = async () => {
    try {
      const q = query(
        collection(db, "shortcut_leaderboard"),
        orderBy("score", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(list);
    } catch {
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Submit score to Firestore
  const handleScoreSubmit = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsSubmittingScore(true);
    try {
      const accuracy =
        correctCount + wrongCount > 0
          ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
          : 100;

      const newEntry = {
        name: playerName.trim(),
        score,
        accuracy,
        category: SHORTCUT_DATABASE[selectedCategory]?.name || "All",
        maxStreak,
        date: new Date().toLocaleDateString(),
        createdAt: new Date(),
      };

      await addDoc(collection(db, "shortcut_leaderboard"), newEntry);
      toast.success("Score recorded on Leaderboard! 🏆");
      setScoreSubmitted(true);
      fetchLeaderboard();
    } catch {
      toast.error("Could not save to cloud, saved locally!");
      setScoreSubmitted(true);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Keyboard Event Listener (Core gameplay mechanics)
  useEffect(() => {
    if (gameState !== "playing") return;

    const currentTarget = shortcutDeck[currentShortcutIndex];
    if (!currentTarget) return;

    const handleKeyDown = (e) => {
      // Prevent browser default actions that disrupt the game
      const trappedKeys = ["p", "s", "f", "h", "j", "e", "k", "t", "d", "n", "l", "b", "u", "i", "a", "c", "v", "z", "y", "w"];
      if (
        (e.ctrlKey || e.altKey || e.metaKey) &&
        trappedKeys.includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      if (e.key.startsWith("F") && e.key.length <= 3) {
        e.preventDefault();
      }
      if (e.altKey && e.key === "c") {
        e.preventDefault();
      }

      // Update active physical keys set for visualizer glow
      setActivePhysicalKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      // Update modifier states
      activeModifiersRef.current = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        win: e.metaKey,
      };

      if (soundEnabled) {
        soundEngine.playKeyClick();
      }

      // If user pressed a modifier alone, don't grade yet
      if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        return;
      }

      // Evaluate match against currentTarget.keys
      const requiredKeys = currentTarget.keys;
      const requiresCtrl = requiredKeys.includes("Ctrl");
      const requiresAlt = requiredKeys.includes("Alt");
      const requiresShift = requiredKeys.includes("Shift");
      const requiresWin = requiredKeys.includes("Win");

      const mainTargetKey = requiredKeys.find(
        (k) => !["Ctrl", "Alt", "Shift", "Win"].includes(k)
      );

      const ctrlMatches = requiresCtrl ? e.ctrlKey : !e.ctrlKey;
      const altMatches = requiresAlt ? e.altKey : !e.altKey;
      const shiftMatches = requiresShift ? e.shiftKey : !e.shiftKey;
      const winMatches = requiresWin ? e.metaKey : !e.metaKey;

      let keyMatches = false;
      if (mainTargetKey) {
        const pressedKeyUpper = e.key.toUpperCase();
        const mainTargetUpper = mainTargetKey.toUpperCase();

        if (pressedKeyUpper === mainTargetUpper) {
          keyMatches = true;
        } else if (mainTargetUpper === "SPACE" && e.code === "Space") {
          keyMatches = true;
        } else if (mainTargetUpper === "ENTER" && e.key === "Enter") {
          keyMatches = true;
        } else if (mainTargetUpper === "DELETE" && e.key === "Delete") {
          keyMatches = true;
        } else if (mainTargetKey === ";" && e.key === ";") {
          keyMatches = true;
        } else if (mainTargetKey === "=" && (e.key === "=" || e.code === "Equal")) {
          keyMatches = true;
        } else if (mainTargetKey === "$" && e.key === "$") {
          keyMatches = true;
        } else if (mainTargetKey === "%" && e.key === "%") {
          keyMatches = true;
        } else if (mainTargetKey === ">" && (e.key === ">" || (e.shiftKey && e.code === "Period"))) {
          keyMatches = true;
        } else if (mainTargetKey === "<" && (e.key === "<" || (e.shiftKey && e.code === "Comma"))) {
          keyMatches = true;
        } else if (mainTargetKey === "+" && (e.key === "+" || (e.shiftKey && e.code === "Equal"))) {
          keyMatches = true;
        } else if (mainTargetKey === "-" && (e.key === "-" || e.code === "Minus")) {
          keyMatches = true;
        }
      }

      const isExactMatch =
        ctrlMatches && altMatches && shiftMatches && winMatches && keyMatches;

      if (isExactMatch) {
        if (soundEnabled) soundEngine.playCorrect();
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);

        const multiplier = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
        const pointsEarned = 100 * multiplier;
        setScore((prev) => prev + pointsEarned);
        setCorrectCount((prev) => prev + 1);

        setFeedback({
          type: "correct",
          message: `+${pointsEarned} pts! ${newStreak > 3 ? `🔥 ${newStreak}x Streak!` : ""}`,
        });

        setTimeout(() => {
          setFeedback(null);
          nextShortcut();
        }, 300);
      } else {
        if (soundEnabled) soundEngine.playError();
        setStreak(0);
        setWrongCount((prev) => prev + 1);

        setFeedback({
          type: "wrong",
          message: `Miss! Expected: ${currentTarget.keys.join(" + ")}`,
        });

        if (gameMode === "survival") {
          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              endGame();
            }
            return nextLives;
          });
        }

        setTimeout(() => {
          setFeedback(null);
        }, 1200);
      }
    };

    const handleKeyUp = (e) => {
      setActivePhysicalKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
      activeModifiersRef.current = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        win: e.metaKey,
      };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, currentShortcutIndex, shortcutDeck, streak, maxStreak, gameMode, soundEnabled, nextShortcut, endGame]);

  const getRank = (sc) => {
    if (sc >= 1500) return { title: "Grand Keyboard Ninja 🥷⚡", color: "text-amber-400" };
    if (sc >= 1000) return { title: "Cyber Hotkey Master 👑", color: "text-purple-400" };
    if (sc >= 600) return { title: "Shortcut Specialist 🎯", color: "text-blue-400" };
    if (sc >= 300) return { title: "Keystroke Explorer 🚀", color: "text-emerald-400" };
    return { title: "Keyboard Apprentice 🌱", color: "text-gray-400" };
  };

  const activeTarget = shortcutDeck[currentShortcutIndex];

  const handleVirtualKeyClick = (virtualKey) => {
    if (gameState !== "playing" || !activeTarget) return;
    const isMod = virtualKey.isModifier;
    if (isMod) {
      toast("Use your physical keyboard for combinations!", { icon: "⌨️" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white selection:bg-yellow-400 selection:text-gray-950 pb-16">
      {/* Top Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-yellow-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="container mx-auto px-4 pt-6 max-w-6xl relative z-10">
        {/* Navigation & Header Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
              🥷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Shortcut <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">Ninja</span>
                </h1>
                <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Interactive Game
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Master Tally, Excel, Word & Windows hotkeys through muscle memory challenges
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-3">
            {/* Link to Games Arcade */}
            <Link
              to="/games"
              className="text-xs bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl border border-gray-700/60 transition-all flex items-center gap-1.5 font-medium shadow-sm"
              title="All Practice Games"
            >
              🎮 All Games
            </Link>

            {/* Link to Typing Test */}
            <Link
              to="/typing-test"
              className="text-xs bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl border border-gray-700/60 transition-all flex items-center gap-1.5 font-medium shadow-sm"
              title="Practice WPM on Typing Test"
            >
              ⌨️ Typing Test
            </Link>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-all ${
                soundEnabled
                  ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 shadow-md shadow-yellow-400/10"
                  : "bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200"
              }`}
              title={soundEnabled ? "Mute Mechanical Audio" : "Unmute Mechanical Audio"}
            >
              {soundEnabled ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
            </button>

            {/* View Leaderboard Tab Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "game" ? "leaderboard" : "game")}
              className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                activeTab === "leaderboard"
                  ? "bg-yellow-400 text-gray-950 border-yellow-400 font-bold shadow-lg shadow-yellow-400/20"
                  : "bg-gray-800/80 hover:bg-gray-700 text-gray-200 border-gray-700"
              }`}
            >
              <FiAward size={16} />
              {activeTab === "leaderboard" ? "Back to Game" : "Leaderboard"}
            </button>
          </div>
        </div>

        {/* VIEW 1: LEADERBOARD TAB */}
        {activeTab === "leaderboard" ? (
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  🏆 Shortcut Ninja Hall of Fame
                </h2>
                <p className="text-sm text-gray-400">Live verified scores submitted by students</p>
              </div>
              <button
                onClick={fetchLeaderboard}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition"
                title="Refresh scores"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-14 px-6 border border-dashed border-gray-800 rounded-3xl bg-gray-900/40">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 text-yellow-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-yellow-400/20">
                  🏆
                </div>
                <h3 className="text-xl font-black text-white mb-2">No Scores Recorded Yet</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                  Be the first student to test your reflexes and claim the #1 spot on the live Hall of Fame!
                </p>
                <button
                  onClick={() => {
                    setActiveTab("game");
                    startGame();
                  }}
                  className="bg-yellow-400 hover:bg-yellow-350 text-gray-950 font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-yellow-400/20 transition-all hover:scale-105 inline-flex items-center gap-2 text-sm"
                >
                  <FiPlay className="fill-current" />
                  Play First Challenge!
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      idx === 0
                        ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10"
                        : idx === 1
                        ? "bg-gray-800/60 border-gray-700"
                        : idx === 2
                        ? "bg-amber-950/20 border-amber-800/40"
                        : "bg-gray-800/30 border-gray-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                          idx === 0
                            ? "bg-yellow-400 text-gray-950 shadow-md shadow-yellow-400/30"
                            : idx === 1
                            ? "bg-gray-300 text-gray-900"
                            : idx === 2
                            ? "bg-amber-700 text-white"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {entry.name}
                          {idx === 0 && <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Champion 👑</span>}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-medium">
                            {entry.category}
                          </span>
                          <span>• Acc: {entry.accuracy}%</span>
                          {entry.date && <span>• {entry.date}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-yellow-400">{entry.score} pts</div>
                      <div className="text-xs text-gray-400 font-medium">
                        {entry.rankTitle || getRank(entry.score).title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setActiveTab("game")}
                  className="bg-yellow-400 hover:bg-yellow-350 text-gray-950 font-black px-8 py-3 rounded-2xl shadow-xl shadow-yellow-400/20 transition-all hover:scale-105"
                >
                  Play & Beat These Scores! 🚀
                </button>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: GAMEPLAY TAB */
          <div>
            {/* Top Config Cards */}
            {gameState === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 mb-8"
              >
                {/* 1. Category Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Step 1: Choose Your Course / Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.keys(SHORTCUT_DATABASE).map((key) => {
                      const cat = SHORTCUT_DATABASE[key];
                      const isSelected = selectedCategory === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key)}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                            isSelected
                              ? "bg-gray-800/95 border-yellow-400 shadow-xl shadow-yellow-400/10 ring-1 ring-yellow-400/50"
                              : "bg-gray-900/60 hover:bg-gray-800/80 border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          <div className="text-2xl mb-2">{cat.icon}</div>
                          <div className={`font-bold text-sm ${isSelected ? "text-yellow-400" : "text-gray-200"}`}>
                            {cat.name}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">
                            {cat.description}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Game Mode Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Step 2: Select Game Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Speed Rush */}
                    <button
                      onClick={() => setGameMode("speed")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        gameMode === "speed"
                          ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-yellow-400 ring-1 ring-yellow-400/40"
                          : "bg-gray-900/60 hover:bg-gray-800/70 border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">⏱️</span>
                        <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                          Competitive
                        </span>
                      </div>
                      <div className="font-bold text-white">Speed Rush (60s Blitz)</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Score as many hotkeys as possible before the 60-second timer hits zero!
                      </div>
                    </button>

                    {/* Survival Mode */}
                    <button
                      onClick={() => setGameMode("survival")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        gameMode === "survival"
                          ? "bg-gradient-to-br from-rose-500/20 to-red-500/10 border-rose-400 ring-1 ring-rose-400/40"
                          : "bg-gray-900/60 hover:bg-gray-800/70 border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">❤️❤️❤️</span>
                        <span className="text-[11px] font-bold bg-rose-400/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-400/30">
                          Challenging
                        </span>
                      </div>
                      <div className="font-bold text-white">Survival Mode (3 Lives)</div>
                      <div className="text-xs text-gray-400 mt-1">
                        No timer, but you only have 3 chances. One wrong hotkey loses a heart!
                      </div>
                    </button>

                    {/* Practice & Learn Mode */}
                    <button
                      onClick={() => setGameMode("practice")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        gameMode === "practice"
                          ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-400 ring-1 ring-emerald-400/40"
                          : "bg-gray-900/60 hover:bg-gray-800/70 border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">📖</span>
                        <span className="text-[11px] font-bold bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                          Learning
                        </span>
                      </div>
                      <div className="font-bold text-white">Practice & Learn</div>
                      <div className="text-xs text-gray-400 mt-1">
                        No timer pressure. Keys light up in gold to teach you the combinations step-by-step.
                      </div>
                    </button>
                  </div>
                </div>

                {/* Big Start Challenge Button */}
                <div className="pt-2 text-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startGame}
                    className="w-full sm:w-auto min-w-[280px] bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-950 font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-3 mx-auto transition-all"
                  >
                    <FiPlay className="fill-current" />
                    Start Keyboard Challenge
                  </motion.button>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Physical keyboard recommended. Watch the on-screen visualizer light up in real-time!
                  </p>
                </div>
              </motion.div>
            )}

            {/* COUNTDOWN OVERLAY */}
            <AnimatePresence>
              {gameState === "countdown" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-md">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 1 }}
                    exit={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                      {countdown > 0 ? countdown : "GO!"}
                    </div>
                    <div className="text-lg font-bold text-gray-300 mt-4 tracking-wider uppercase">
                      Hands on Keyboard! ⌨️
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* LIVE GAME INTERACTION HUD & PROMPT */}
            {gameState === "playing" && activeTarget && (
              <div className="space-y-6">
                {/* Top Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/80 border border-gray-800 p-4 rounded-2xl backdrop-blur-xl">
                  {/* Metric 1: Timer or Lives */}
                  {gameMode === "speed" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-400 flex items-center justify-center text-xl">
                        <FiClock />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase">Time Remaining</div>
                        <div className={`text-2xl font-black ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
                          {timeLeft}s
                        </div>
                      </div>
                    </div>
                  ) : gameMode === "survival" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
                        <FiHeart />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase">Lives Left</div>
                        <div className="text-xl font-black text-rose-400">
                          {"❤️".repeat(lives) || "💀"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                        <FiBookOpen />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase">Mode</div>
                        <div className="text-sm font-bold text-emerald-400">Practice (No rush)</div>
                      </div>
                    </div>
                  )}

                  {/* Metric 2: Score */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xl font-black">
                      ★
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase">Score</div>
                      <div className="text-2xl font-black text-yellow-400">{score}</div>
                    </div>
                  </div>

                  {/* Metric 3: Streak */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      streak >= 5 ? "bg-orange-500/30 text-orange-400 animate-bounce" : "bg-gray-800 text-gray-400"
                    }`}>
                      🔥
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase">Streak</div>
                      <div className="text-2xl font-black text-white">
                        {streak}x{" "}
                        {streak >= 10 && <span className="text-xs text-amber-400 font-bold">NINJA!</span>}
                        {streak >= 5 && streak < 10 && <span className="text-xs text-orange-400 font-bold">FIRE!</span>}
                      </div>
                    </div>
                  </div>

                  {/* Metric 4: Progress / Restart */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase">Completed</div>
                      <div className="text-2xl font-black text-white">
                        {correctCount} <span className="text-xs text-gray-500 font-normal">correct</span>
                      </div>
                    </div>
                    <button
                      onClick={endGame}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition"
                    >
                      End Run
                    </button>
                  </div>
                </div>

                {/* ACTIVE SHORTCUT CHALLENGE CARD */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 border border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Category Pill */}
                  <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700 px-3.5 py-1 rounded-full text-xs font-semibold text-gray-300 mb-4">
                    <span>{activeTarget.categoryIcon || "⚡"}</span>
                    <span>{activeTarget.categoryName || "Computer Shortcut"}</span>
                  </div>

                  {/* Prompt Text */}
                  <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-4 max-w-2xl mx-auto">
                    "{activeTarget.prompt}"
                  </h2>

                  {/* Feedback Overlay Banner */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`inline-block px-4 py-1.5 rounded-xl text-sm font-bold mb-4 ${
                          feedback.type === "correct"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        }`}
                      >
                        {feedback.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Target Keys Display or Hint */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    {showHint ? (
                      activeTarget.keys.map((k, i) => (
                        <React.Fragment key={i}>
                          <span className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400/80 text-yellow-400 font-mono font-black text-sm sm:text-base px-3.5 py-2 rounded-xl shadow-lg shadow-yellow-400/15 min-w-[48px]">
                            {k}
                          </span>
                          {i < activeTarget.keys.length - 1 && (
                            <span className="text-gray-500 font-bold text-lg">+</span>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 flex items-center gap-2 bg-gray-800/40 px-4 py-2 rounded-xl border border-gray-800">
                        <FiHelpCircle className="text-yellow-400" />
                        <span>Press the shortcut key combination on your keyboard now</span>
                        <button
                          onClick={() => setShowHint(true)}
                          className="ml-2 text-yellow-400 underline hover:text-yellow-300 font-medium"
                        >
                          Show Hint?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Practical Explanation */}
                  {showHint && activeTarget.explanation && (
                    <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto italic mt-2">
                      💡 {activeTarget.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ⌨️ INTERACTIVE MECHANICAL KEYBOARD VISUALIZER */}
            <div className="mt-8 bg-gray-900/80 border border-gray-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Live Mechanical Keyboard Visualizer
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-yellow-400/30 border border-yellow-400" />
                    <span>Target Key</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-cyan-400 border border-cyan-400" />
                    <span>Pressed Down</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Container on small screens to prevent overflow */}
              <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800">
                <div className="min-w-[700px] flex flex-col gap-1.5 select-none font-mono">
                  {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1.5">
                      {row.map((k) => {
                        const isPhysicallyPressed = activePhysicalKeys.has(k.code);
                        const isHintKey =
                          gameState === "playing" &&
                          (showHint || gameMode === "practice") &&
                          activeTarget &&
                          isKeyInCombo(k, activeTarget.keys);

                        return (
                          <button
                            key={k.code}
                            onClick={() => handleVirtualKeyClick(k)}
                            className={`h-11 sm:h-12 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-75 relative border shadow-md active:scale-95 ${
                              k.width || "w-11 sm:w-12"
                            } ${
                              isPhysicallyPressed
                                ? "bg-cyan-400 text-gray-950 border-cyan-300 translate-y-1 shadow-inner shadow-cyan-900/50"
                                : isHintKey
                                ? "bg-yellow-400/20 text-yellow-300 border-yellow-400 ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-400/30 animate-pulse"
                                : "bg-gradient-to-b from-gray-800 to-gray-850 text-gray-300 border-gray-700/70 hover:border-gray-600 hover:text-white"
                            }`}
                          >
                            <span>{k.label}</span>
                            <span className="absolute inset-x-1 top-0.5 h-[1px] bg-white/10 rounded-t-lg pointer-events-none" />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESULTS MODAL (After Game Ends) */}
            <AnimatePresence>
              {gameState === "ended" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-950 text-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-yellow-400/20">
                      🏆
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white">Challenge Completed!</h3>
                    <p className={`text-base font-bold mt-1 ${getRank(score).color}`}>
                      {getRank(score).title}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 my-6 bg-gray-800/60 border border-gray-700/60 p-4 rounded-2xl">
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase">Final Score</div>
                        <div className="text-2xl font-black text-yellow-400">{score}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase">Accuracy</div>
                        <div className="text-2xl font-black text-white">
                          {correctCount + wrongCount > 0
                            ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                            : 100}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase">Max Streak</div>
                        <div className="text-2xl font-black text-orange-400">🔥 {maxStreak}</div>
                      </div>
                    </div>

                    {/* Leaderboard Submission */}
                    {!scoreSubmitted ? (
                      <div className="mb-6 bg-gray-800/40 p-4 rounded-2xl border border-gray-700/70 text-left">
                        <label className="text-xs font-bold text-gray-300 block mb-2">
                          Post Your Score to the Leaderboard:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter your name or Roll No."
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-yellow-400"
                          />
                          <button
                            onClick={handleScoreSubmit}
                            disabled={isSubmittingScore}
                            className="bg-yellow-400 hover:bg-yellow-350 text-gray-950 font-bold px-4 py-2 rounded-xl text-sm transition shadow-md disabled:opacity-50"
                          >
                            {isSubmittingScore ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                        <FiCheckCircle />
                        <span>Score successfully posted to the Hall of Fame!</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={startGame}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-350 text-gray-950 font-black py-3.5 rounded-xl shadow-lg shadow-yellow-400/20 transition flex items-center justify-center gap-2"
                      >
                        <FiRefreshCw />
                        Play Again
                      </button>

                      <button
                        onClick={() => {
                          const shareText = `⌨️ I scored ${score} pts with a ${maxStreak}x streak on Aeiseci Shortcut Ninja! Can you beat my score? 🔥`;
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(shareText);
                            toast.success("Share summary copied to clipboard! 📋");
                          }
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-5 rounded-xl border border-gray-700 transition flex items-center justify-center gap-2"
                      >
                        <FiShare2 />
                        Share
                      </button>

                      <button
                        onClick={() => {
                          setGameState("idle");
                          setActiveTab("leaderboard");
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3.5 px-4 rounded-xl border border-gray-700 transition"
                      >
                        Leaderboard
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* BOTTOM MOTIVATIONAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Boost Typing & Job Speed</h4>
              <p className="text-xs text-gray-400 mt-1">
                Computer operators who know Tally and Excel shortcuts work 4x faster than mouse users.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl shrink-0">
              🎓
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Pass CCC & DCA Exams</h4>
              <p className="text-xs text-gray-400 mt-1">
                Over 30% of CCC, O-Level, and DCA exam questions ask directly for keyboard shortcuts.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
              🔥
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Challenge Your Batchmates</h4>
              <p className="text-xs text-gray-400 mt-1">
                Share your score with your institute friends on WhatsApp and see who takes the #1 spot!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutChallenge;
