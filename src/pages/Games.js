import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

const Games = () => {
  const gamesList = [
    {
      id: "typing",
      title: "Typing Speed Gym",
      subtitle: "Master Words-Per-Minute & Typing Accuracy",
      icon: "⌨️",
      badge: "Popular",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      accentGradient: "from-blue-500 to-indigo-600",
      path: "/typing-test",
      description:
        "Compete in high-speed English and Hindi typing challenges. Real-time WPM calculation, keystroke accuracy tracking, mechanical keyboard sounds, and live leaderboards.",
      tags: ["English & Hindi", "30s / 60s / 120s", "Mechanical Sounds", "Speed Graph"],
      highlights: [
        "Real-time WPM and accuracy speed calculations",
        "Dual language support (English & Hindi passages)",
        "Interactive performance graph & speed milestones",
        "Personal best tracking and global batch rankings",
      ],
      ctaText: "Launch Typing Gym",
    },
    {
      id: "shortcuts",
      title: "Shortcut Ninja",
      subtitle: "Interactive Keyboard Hotkey Challenge",
      icon: "🥷",
      badge: "NEW 🔥",
      badgeColor: "bg-amber-500/20 text-yellow-400 border-yellow-400/40",
      accentGradient: "from-yellow-400 to-amber-600",
      path: "/shortcuts",
      description:
        "Train your reflexes for Tally Prime vouchers, MS Excel formulas, MS Word typography, and Windows shortcuts using an interactive 3D mechanical keyboard visualizer.",
      tags: ["Tally Prime", "MS Excel Pro", "3D Keyboard", "Speed Rush"],
      highlights: [
        "Live on-screen glowing mechanical keyboard visualizer",
        "Course packs: Tally Vouchers, Excel Formulas, MS Word",
        "Speed Rush (60s), Survival (3 Lives) & Practice modes",
        "Combo streak multipliers (🔥 5x, 10x Ninja bonus)",
      ],
      ctaText: "Launch Shortcut Ninja",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white selection:bg-yellow-400 selection:text-gray-950 pb-20">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-yellow-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-10 max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-1.5 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-md"
          >
            <span>🎮</span>
            <span>Student Arcade & Skill Gym</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight"
          >
            Level Up Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400">
              Computer Skills
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base mt-4 leading-relaxed"
          >
            Gamified training tools designed specifically for Aeiseci students. Build muscle memory, master Tally & Excel shortcuts, and compete with batchmates for the #1 spot!
          </motion.p>
        </div>

        {/* Featured Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {gamesList.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.2 }}
              whileHover={{ y: -6 }}
              className="group relative bg-gray-900/90 border border-gray-800 hover:border-gray-700 rounded-3xl p-7 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl transition-all overflow-hidden"
            >
              {/* Corner accent glow on hover */}
              <div className="absolute -right-16 -top-16 w-44 h-44 bg-gradient-to-br from-yellow-400/10 to-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700/80 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${game.badgeColor}`}
                  >
                    {game.badge}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">
                  {game.title}
                </h2>
                <p className="text-xs font-bold text-gray-400 mt-0.5 mb-3">{game.subtitle}</p>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  {game.description}
                </p>

                {/* Feature Highlights */}
                <div className="space-y-2 mb-6">
                  {game.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-400">
                      <FiCheckCircle className="text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {game.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold bg-gray-800/70 border border-gray-700/60 text-gray-300 px-2.5 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Play Action Button */}
              <Link
                to={game.path}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-350 hover:to-yellow-400 text-gray-950 font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-yellow-500/20 group-hover:shadow-yellow-400/30 transition-all active:scale-[0.98]"
              >
                <span>{game.ctaText}</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon: Quiz Arena Teaser
        <div className="mb-16 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border border-gray-800/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-3xl flex items-center justify-center shrink-0">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-xl font-black text-white">Daily CCC & DCA Quiz Streak</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold px-2 py-0.5 rounded-full uppercase">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
                A 3-minute daily challenge with 5 essential computer questions (NIELIT CCC, Tally GST, Windows). Keep your daily streak alive and collect badges!
              </p>
            </div>
          </div>

          <div className="shrink-0 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-gray-700">
              <span>🔥 Daily Streak System</span>
            </div>
          </div>
        </div> */}

        {/* Value Proposition Cards */}
        <div className="border-t border-gray-800/80 pt-12">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Why Practice On The Student Arcade?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real advantages that help you in computer practicals and job interviews
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-900/60 border border-gray-800/80 p-6 rounded-2xl text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 text-yellow-400 text-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                ⚡
              </div>
              <h4 className="font-bold text-white text-base">4x Faster Work Speed</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Computer operators, accountants, and office executives who use shortcuts finish tasks in a fraction of the time compared to mouse-only users.
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800/80 p-6 rounded-2xl text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-400/10 text-blue-400 text-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                🎓
              </div>
              <h4 className="font-bold text-white text-base">Ace CCC & DCA Exams</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Over 30% of questions in NIELIT CCC, O-Level, and DCA semester exams test shortcut keys and computer fundamentals directly.
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800/80 p-6 rounded-2xl text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 text-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                🏆
              </div>
              <h4 className="font-bold text-white text-base">Compete With Friends</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Friendly batch competition makes practice genuinely exciting. See your name on the live leaderboard and share your achievements!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
