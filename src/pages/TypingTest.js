import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; //eslint-disable-line
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
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  FiClock,
  FiAward,
  FiVolume2,
  FiVolumeX,
  FiRefreshCw,
  FiTrendingUp,
  FiCpu,
  FiShield,
  FiShare2,
  FiAlertCircle,
  FiGlobe,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

// Pool of passages in English
const SENTENCE_BANK = [
  "Computers are execution engines that operate on instructions written by engineers.",
  "Every key pressed represents a signal translated into machine language.",
  "Web design requires careful balance of responsive layouts, premium animations, and structural semantics.",
  "Excellent developers write clean, robust code that stands the test of system complexity.",
  "Database management systems orchestrate retrieval pipelines and index search trees.",
  "Transaction pipelines enforce ACID properties to protect relational database integrity.",
  "Machine learning models digest multi-dimensional vectors to predict classification outcomes.",
  "Deep neural networks map complex synthetic media inputs into linear features.",
  "Typing is a core digital skill that builds memory inside motor reflex fibers.",
  "Practice allows developers to build software products at maximum velocity.",
  "Software systems rely on solid architecture paradigms like composition and encapsulation.",
  "Functional state containers manage mutable memory blocks in decoupled applications.",
  "Cyber security practitioners implement public key infrastructure to secure sessions.",
  "Symmetric encryption algorithms protect local disks from unauthorized access.",
  "Cloud nodes scale compute instances dynamically to balance user demand peaks.",
  "Continuous integration pipelines compile tests and deploy bundles to staging environments.",
  "Version control logs document changes, merge branching logic, and resolve conflicts.",
  "Hardware chips synchronize internal clock cycles with millions of microscopic gates.",
  "Microprocessor cores fetch instructions from cache registers to accelerate operations.",
  "Algorithms analyze time complexity to optimize performance and conserve server resources.",
  "Recursive patterns split workloads into self-similar sub-problems.",
  "Compilers parse source code syntax trees to produce executable binary code.",
  "API gateways route public requests, handle authentication, and rate limit clients.",
  "Websockets establish persistent bidirectional links between browsers and sockets.",
  "Responsive media queries adjust CSS layouts according to device viewport width."
];

// Pool of passages in Hindi
const HINDI_SENTENCE_BANK = [
  "कंप्यूटर एक इलेक्ट्रॉनिक मशीन है जो डेटा को इनपुट के रूप में स्वीकार करता है।",
  "इंटरनेट सूचनाओं का एक विशाल नेटवर्क है जो पूरी दुनिया को आपस में जोड़ता है।",
  "टाइपिंग का निरंतर अभ्यास करने से उंगलियों की गति और शुद्धता में सुधार होता है।",
  "सॉफ्टवेयर प्रोग्रामों का समूह है जो कंप्यूटर हार्डवेयर को काम करने का निर्देश देता है।",
  "सफलता का मुख्य आधार अभ्यास, कठिन परिश्रम और निरंतर किया गया प्रयास है।",
  "डिजिटल साक्षरता आज के युग में प्रत्येक छात्र के विकास के लिए अत्यंत आवश्यक है।",
  "ईमेल के माध्यम से हम दुनिया में किसी भी व्यक्ति को संदेश भेज सकते हैं।",
  "हार्डवेयर कंप्यूटर के भौतिक भाग होते हैं जिन्हें हम छू सकते हैं और देख सकते हैं।",
  "ऑपरेटिंग सिस्टम कंप्यूटर और उपयोगकर्ता के बीच एक सेतु की तरह काम करता है।",
  "कीबोर्ड और माउस कंप्यूटर के सबसे महत्वपूर्ण इनपुट डिवाइस माने जाते हैं।",
  "माइक्रोप्रोसेसर चिप लाखों ट्रांजिस्टर को मिलाकर एक छोटे सर्किट पर बनाई जाती है।",
  "सूचना सुरक्षा का मुख्य उद्देश्य डिजिटल डेटा को अनधिकृत पहुंच से बचाना है।",
  "क्लाउड स्टोरेज से हम दुनिया में कहीं से भी अपने डेटा को एक्सेस कर सकते हैं।",
  "डेटाबेस मैनेजमेंट सिस्टम डेटा को व्यवस्थित रूप से स्टोर और अपडेट करता है।",
  "सर्च इंजन इंटरनेट पर मौजूद सूचनाओं को खोजने में हमारी सहायता करते हैं।",
  "वेबसाइट डिजाइनिंग में एचटीएमएल और सीएसएस का उपयोग मुख्य रूप से किया जाता है।",
  "प्रोग्रामिंग भाषा कंप्यूटर को विभिन्न जटिल समस्याओं को हल करना सिखाती है।",
  "कंप्यूटर मेमोरी दो प्रकार की होती है जिसमें रैम और रोम शामिल हैं।",
  "एल्गोरिदम किसी समस्या को चरण-दर-चरण हल करने की एक निश्चित प्रक्रिया है।",
  "साइबर क्राइम से बचने के लिए हमें मजबूत पासवर्ड का उपयोग करना चाहिए।",
  "नेटवर्क प्रोटोकॉल डेटा ट्रांसफर के लिए बने नियमों का एक समूह होता है।",
  "कंप्यूटर का आविष्कार मानव इतिहास की सबसे बड़ी उपलब्धियों में से एक है।",
  "डिजिटल इंडिया मिशन से देश के कोने-कोने में तकनीक का विस्तार हुआ है।",
  "असेम्बलर सोर्स कोड को मशीन कोड में बदलने का काम करता है।",
  "एंटीवायरस सॉफ्टवेयर कंप्यूटर को वायरस और मैलवेयर हमलों से सुरक्षित रखता है।"
];

// Synth click sound generator utilizing Web Audio API
const playClickSound = (volume = 0.25, isError = false) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isError) {
      // Low pitch dull buzz for errors
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 1.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      // Standard mechanical click sound (high-passed pitch decay)
      osc.type = "sine";
      osc.frequency.setValueAtTime(160 + Math.random() * 60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch (err) {
    // Fail silently if browser blocks AudioContext initialization
  }
};

const TypingTest = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Passage config states
  const [passage, setPassage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30); // 30s, 60s, 120s
  const [selectedLength, setSelectedLength] = useState("medium"); // short, medium, long
  const [selectedLanguage, setSelectedLanguage] = useState("english"); // english, hindi
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Game state flags
  const [isTyping, setIsTyping] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  // Statistics trackers
  const [wpmData, setWpmData] = useState([]); // Array of { second: X, wpm: Y }
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Nickname registration states for guests
  const [nickName, setNickName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // DOM Refs
  const hiddenInputRef = useRef(null);
  const textContainerRef = useRef(null);

  // Helper to generate dynamic paragraphs of custom lengths
  const generatePassage = (lengthMode, langMode, lastPassage = "") => {
    let count = 1; // Short
    if (lengthMode === "medium") count = 3;
    if (lengthMode === "long") count = 6;

    let chosenSentences = [];
    const sourceBank = langMode === "hindi" ? HINDI_SENTENCE_BANK : SENTENCE_BANK;
    let available = [...sourceBank];

    // Pick random unique sentences from bank
    for (let i = 0; i < count; i++) {
      if (available.length === 0) break;
      const idx = Math.floor(Math.random() * available.length);
      chosenSentences.push(available[idx]);
      available.splice(idx, 1);
    }

    const newPassage = chosenSentences.join(" ");
    
    // Ensure we don't repeat the exact same passage
    if (newPassage === lastPassage && sourceBank.length > count) {
      return generatePassage(lengthMode, langMode, lastPassage);
    }
    return newPassage;
  };

  // Fetch top 10 global leaderboard scores from Firestore
  const fetchGlobalLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const q = query(
        collection(db, "typingLeaderboard"),
        orderBy("wpm", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const scores = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setGlobalLeaderboard(scores);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Reset the test parameters
  const resetTest = () => {
    const newPassage = generatePassage(selectedLength, selectedLanguage, passage);
    setPassage(newPassage);
    setUserInput("");
    setTimeLeft(selectedDuration);
    setIsTyping(false);
    setHasEnded(false);
    setErrorCount(0);
    setWpmData([]);
    setScoreSubmitted(false);
    setNickName("");
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
      hiddenInputRef.current.focus();
    }
  };

  // Load initial passage, configuration, and leaderboard
  useEffect(() => {
    resetTest();
    fetchGlobalLeaderboard();
  }, [selectedDuration, selectedLength, selectedLanguage]); //eslint-disable-line

  // Handle countdown and live stats tracking
  useEffect(() => {
    let timer = null;
    if (isTyping && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const nextTime = prev - 1;
          const timeElapsed = selectedDuration - nextTime;
          
          // Calculate live WPM
          const correctChars = countCorrectCharacters(userInput);
          const currentWpm = timeElapsed > 0 ? Math.round((correctChars / 5) / (timeElapsed / 60)) : 0;
          
          setWpmData((prevData) => [
            ...prevData,
            { second: timeElapsed, wpm: currentWpm }
          ]);

          if (nextTime <= 0) {
            endTest();
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTyping, timeLeft, userInput]); //eslint-disable-line

  // Count correct matching characters
  const countCorrectCharacters = (input) => {
    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === passage[i]) {
        correct++;
      }
    }
    return correct;
  };

  // Process input changes
  const handleInputChange = (e) => {
    if (hasEnded) return;
    const value = e.target.value;

    // Start timer on first keystroke
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
    }

    // Determine if last key was correct or error
    if (value.length > userInput.length) {
      const addedChar = value[value.length - 1];
      const targetChar = passage[userInput.length];
      const isCorrect = addedChar === targetChar;

      if (soundEnabled) {
        playClickSound(0.25, !isCorrect);
      }

      if (!isCorrect) {
        setErrorCount((prev) => prev + 1);
      }
    } else {
      // Backspace sound
      if (soundEnabled) {
        playClickSound(0.15, false);
      }
    }

    setUserInput(value);

    // End test if passage is fully completed
    if (value.length >= passage.length) {
      endTest();
    }
  };

  // Final Calculations
  const finalCorrect = countCorrectCharacters(userInput);
  const finalTimeElapsed = selectedDuration - timeLeft;
  const finalWpm = finalTimeElapsed > 0 ? Math.round((finalCorrect / 5) / (finalTimeElapsed / 60)) : 0;
  const finalAccuracy = Math.round((finalCorrect / Math.max(userInput.length, 1)) * 100);

  // End test and trigger auto-submit if student is logged in
  const endTest = async () => {
    setIsTyping(false);
    setHasEnded(true);

    // Automatically submit to live leaderboard if student is logged in
    if (isAuthenticated && user?.name) {
      submitScoreToLeaderboard(user.name);
    }
  };

  // Upload score payload to Firestore typingLeaderboard collection
  const submitScoreToLeaderboard = async (displayName) => {
    if (!displayName || !displayName.trim()) {
      toast.error("Please enter a valid name.");
      return;
    }
    setSubmittingScore(true);
    try {
      await addDoc(collection(db, "typingLeaderboard"), {
        name: displayName.trim(),
        wpm: finalWpm,
        accuracy: finalAccuracy,
        duration: selectedDuration,
        length: selectedLength,
        language: selectedLanguage,
        date: new Date().toLocaleDateString("en-IN"),
        createdAt: new Date(),
      });
      toast.success("Score added to Live Leaderboard!");
      setScoreSubmitted(true);
      fetchGlobalLeaderboard();
    } catch (err) {
      console.error("Failed to submit score:", err);
      toast.error("Failed to upload to leaderboard.");
    } finally {
      setSubmittingScore(false);
    }
  };

  // Determine Badge Tier
  const getBadgeTier = (wpm) => {
    if (wpm >= 80) return { title: "Speed Demon", color: "from-purple-500 to-indigo-500", desc: "Expert master level typing speeds." };
    if (wpm >= 60) return { title: "Keyboard Warrior", color: "from-red-500 to-orange-500", desc: "Highly fluent typing enthusiast." };
    if (wpm >= 40) return { title: "Typing Specialist", color: "from-blue-500 to-teal-500", desc: "Professional office speed tier." };
    if (wpm >= 20) return { title: "Junior Typist", color: "from-green-500 to-emerald-500", desc: "Competent basic typing skills." };
    return { title: "Novice Typist", color: "from-gray-500 to-slate-500", desc: "Needs steady keyboard practice." };
  };

  const badge = getBadgeTier(finalWpm);

  // Share score text copy
  const shareScore = () => {
    const shareText = `⌨️ Live Typing Speed Test Score on AIESECI!\nSpeed: ${finalWpm} WPM\nAccuracy: ${finalAccuracy}%\nLanguage: ${selectedLanguage === "hindi" ? "Hindi" : "English"}\nBadge: ${badge.title}\nTest your speed now at AIESECI.`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success("Score copied to clipboard! Share it with friends!");
    });
  };

  // Refocus hidden textarea
  const focusInput = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-slate-950 pb-20">
      
      {/* Background Glowing Mesh Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Grid Wrapper */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-yellow-400 font-semibold text-xs tracking-widest uppercase shadow-md"
          >
            <FiAward className="text-sm animate-pulse" />
            <span>Interactive Game</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight"
          >
            Typing <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Speed Gym</span>
          </motion.h1>

          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Test your WPM (Words Per Minute) and accuracy skills under time limits. Play sound effects and compete on the global leaderboard!
          </p>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-6 mb-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          {/* Language Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Lang:</span>
            <div className="flex space-x-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/50">
              <button
                disabled={isTyping}
                onClick={() => setSelectedLanguage("english")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-350 flex items-center space-x-1.5 ${
                  selectedLanguage === "english"
                    ? "bg-yellow-400 text-slate-950 shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <FiGlobe className="text-xs" />
                <span>English</span>
              </button>
              <button
                disabled={isTyping}
                onClick={() => setSelectedLanguage("hindi")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-350 flex items-center space-x-1.5 ${
                  selectedLanguage === "hindi"
                    ? "bg-yellow-400 text-slate-950 shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <FiGlobe className="text-xs" />
                <span>Hindi</span>
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Timer:</span>
            <div className="flex space-x-2">
              {[30, 60, 120].map((dur) => (
                <button
                  key={dur}
                  disabled={isTyping}
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${selectedDuration === dur
                    ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                    : "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                    } disabled:opacity-50`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Length Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Length:</span>
            <div className="flex space-x-2">
              {["short", "medium", "long"].map((len) => (
                <button
                  key={len}
                  disabled={isTyping}
                  onClick={() => setSelectedLength(len)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${selectedLength === len
                    ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                    : "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                    } disabled:opacity-50`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-700/50 transition font-semibold text-xs"
              title={soundEnabled ? "Disable Sounds" : "Enable Sounds"}
            >
              {soundEnabled ? (
                <>
                  <FiVolume2 className="text-yellow-400 text-sm" />
                  <span className="text-slate-300">Click ON</span>
                </>
              ) : (
                <>
                  <FiVolumeX className="text-slate-500 text-sm" />
                  <span className="text-slate-400">Muted</span>
                </>
              )}
            </button>

            {/* Restart Button */}
            <button
              onClick={resetTest}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-700/50 transition font-semibold text-xs"
            >
              <FiRefreshCw className="text-yellow-400 text-sm" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* TYPING WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Interactive Typing Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hindi Keyboard Layout Tip Banner */}
            {selectedLanguage === "hindi" && !hasEnded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 bg-blue-500/10 border border-blue-500/25 text-blue-300 p-4 rounded-2xl text-xs sm:text-sm"
              >
                <FiAlertCircle className="text-blue-400 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Hindi Typing Mode Active!</span> Please activate your system's Hindi keyboard layout (e.g., Hindi Inscript, Remington, or Indic Input Tool) in your OS settings or language bar to begin typing in Hindi Devanagari.
                </div>
              </motion.div>
            )}

            {hasEnded ? (
              /* Inline Results Dashboard (No Fullscreen certificate popup) */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/60 border border-slate-850 rounded-3xl p-8 backdrop-blur-md space-y-8 overflow-hidden w-full"
              >
                {/* Stats Headers */}
                <div className="text-center space-y-2">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r ${badge.color} text-white shadow-md`}>
                    {badge.title}
                  </span>
                  <h2 className="text-3xl font-black text-white">Performance Summary</h2>
                  <p className="text-slate-500 text-xs">Test evaluation concluded. Check your metrics below!</p>
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl">
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Speed (WPM)</p>
                    <p className="text-4xl font-black mt-2 text-yellow-400">{finalWpm}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl">
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Accuracy</p>
                    <p className="text-4xl font-black mt-2 text-emerald-400">{finalAccuracy}%</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl">
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Errors</p>
                    <p className="text-4xl font-black mt-2 text-rose-500">{errorCount}</p>
                  </div>
                </div>

                {/* Nickname Form for guests */}
                {!isAuthenticated && !scoreSubmitted && (
                  <div className="bg-slate-950/50 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                    <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                      <FiCpu />
                      <span>Submit to Live Leaderboard</span>
                    </p>
                    <p className="text-slate-400 text-xs">Enter your name below to register your speed score globally.</p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Your Name / Nickname"
                        value={nickName}
                        onChange={(e) => setNickName(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                      <button
                        disabled={submittingScore}
                        onClick={() => submitScoreToLeaderboard(nickName)}
                        className="bg-yellow-400 hover:bg-yellow-350 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition active:scale-95 disabled:opacity-50"
                      >
                        {submittingScore ? "Saving..." : "Submit"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={resetTest}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-350 text-slate-950 font-bold py-4 rounded-2xl text-sm tracking-wide shadow-lg shadow-yellow-400/25 transition active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <FiRefreshCw className="text-base" />
                    <span>Try Again</span>
                  </button>

                  <button
                    onClick={shareScore}
                    className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-sm transition border border-slate-700/50 flex items-center justify-center space-x-2"
                  >
                    <FiShare2 className="text-base text-yellow-400" />
                    <span>Share Score</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Standard typing workspace interface */
              <div
                onClick={focusInput}
                className="relative bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-8 cursor-text backdrop-blur-md transition-all duration-300 hover:border-slate-700 flex flex-col justify-between overflow-hidden w-full"
              >
                {/* Hidden text area that receives actual typing triggers */}
                <textarea
                  ref={hiddenInputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none cursor-default resize-none"
                  disabled={hasEnded}
                  autoFocus
                />

                {/* Status Header */}
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/40 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-yellow-400 text-base" />
                    <span>Time remaining: <span className="text-white text-base ml-1">{timeLeft}s</span></span>
                  </div>
                  <div>
                    Accuracy: <span className="text-white text-base ml-1">{finalAccuracy || 0}%</span>
                  </div>
                </div>

                {/* Typing Character Renderer */}
                <div
                  ref={textContainerRef}
                  className="text-base sm:text-xl font-mono leading-relaxed select-none py-4 text-slate-500 tracking-wide break-words whitespace-pre-wrap"
                >
                  {passage.split("").map((char, index) => {
                    let className = "transition-all duration-150 ";
                    if (index < userInput.length) {
                      className += userInput[index] === char
                        ? "text-emerald-400 font-bold"
                        : "text-rose-500 bg-rose-900/20 px-0.5 rounded border border-rose-500/30";
                    } else if (index === userInput.length) {
                      className += "text-white font-extrabold border-b-2 border-yellow-400 animate-pulse bg-yellow-400/10 px-0.5 rounded";
                    } else {
                      className += "text-slate-600";
                    }
                    return (
                      <span key={index} className={className}>
                        {char}
                      </span>
                    );
                  })}
                </div>

                {/* Focus Prompt overlay when input isn't typing */}
                {!isTyping && (
                  <div className="absolute inset-0 bg-slate-950/80 rounded-3xl flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-2">
                      <p className="text-yellow-400 font-black tracking-wider uppercase text-sm">Click to Start Typing Gym</p>
                      <p className="text-slate-500 text-xs">The timer starts automatically as you begin to key in the letters.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LIVE GRAPHS AND ANALYTICS PROGRESSION */}
            {wpmData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md overflow-hidden"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FiTrendingUp className="text-yellow-400 text-lg" />
                  <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400">WPM Speed Progression</h3>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wpmData}>
                      <defs>
                        <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="second" stroke="#475569" strokeWidth={1} style={{ fontSize: 10 }} />
                      <YAxis stroke="#475569" strokeWidth={1} style={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
                      <Area type="monotone" dataKey="wpm" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#wpmGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>

          {/* High Scores Dashboard & Side info */}
          <div className="space-y-6">
            
            {/* Live Stats display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl text-center">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Speed (WPM)</p>
                <p className="text-4xl sm:text-5xl font-black mt-2 text-yellow-400">{finalWpm}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl text-center">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Accuracy</p>
                <p className="text-4xl sm:text-5xl font-black mt-2 text-emerald-400">{finalAccuracy || 0}%</p>
              </div>
            </div>

            {/* LIVE GLOBAL LEADERBOARD CARD */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-black tracking-wider uppercase text-slate-300 border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                <FiAward className="text-yellow-400 text-lg" />
                <span>Live Leaderboard</span>
              </h3>
              {loadingLeaderboard ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Loading high scores...
                </div>
              ) : globalLeaderboard.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No records yet. Be the first to claim high scores!
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
                  {globalLeaderboard.map((score, idx) => (
                    <div key={score.id || idx} className="flex justify-between items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 transition-all hover:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-yellow-400 text-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{score.name}</p>
                          <p className="text-slate-500 text-[10px]">{score.wpm} WPM • {score.accuracy}% Acc</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full capitalize">
                          {score.length}
                        </span>
                        <span className="text-[8px] text-slate-500 font-semibold uppercase">
                          {score.language === "hindi" ? "Hindi" : "Eng"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRO TIPS SECTION */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-sm text-slate-400 space-y-3">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <FiShield className="text-blue-400" />
                <span>Ergonomics Tips</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs leading-relaxed">
                <li>Keep your wrists straight and fingers naturally curved.</li>
                <li>Focus on high accuracy first, speed will follow naturally.</li>
                <li>Avoid looking down at the keyboard; build muscle memory!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
