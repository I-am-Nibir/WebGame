"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MascotCanvas from "@/components/3d/MascotCanvas";
import FruitSlice from "@/components/games/FruitSlice";
import BalloonPop from "@/components/games/BalloonPop";
import Xylophone3D from "@/components/games/Xylophone3D";
import WhackAMonster from "@/components/games/WhackAMonster";
import { useGameStore } from "@/lib/store";
import { sounds } from "@/lib/audioEngine";

const GAMES_LIST = [
  { id: "slice", name: "ক্যান্ডি স্লাইসার", icon: "🍉", color: "from-pink-400 to-rose-500", desc: "স্পিড স্লাইসিং গেম" },
  { id: "balloon", name: "বেলুন পপ ফ্রেঞ্জি", icon: "🎈", color: "from-blue-400 to-cyan-500", desc: "রঙিন বেলুন ফাটাও" },
  { id: "whack", name: "মনস্টার ট্যাপ", icon: "🐹", color: "from-amber-400 to-orange-500", desc: "গর্ত থেকে বের হওয়া মনস্টার" },
  { id: "xylophone", name: "৩ডি রেইনবো সুর", icon: "🎵", color: "from-emerald-400 to-teal-500", desc: "মিউজিক্যাল জাইলোফোন" },
  { id: "memory", name: "কার্ড মেমোরি ম্যাচ", icon: "🦁", color: "from-purple-400 to-violet-500", desc: "একই ছবি খুঁজে বের করো" },
  { id: "catch", name: "সুইটস ক্যাচার", icon: "🧁", color: "from-red-400 to-pink-500", desc: "ঝুড়িতে কেক সংগ্রহ করো" },
  { id: "maze", name: "মার্বেল রোলার", icon: "🔮", color: "from-teal-400 to-emerald-600", desc: "৩ডি ব্যালেন্সিং গোলকধাঁধা" },
  { id: "simon", name: "সাইমন বিট জাম", icon: "💡", color: "from-yellow-400 to-amber-600", desc: "স্মৃতিশক্তি ও বিট রিপিট" },
  { id: "math", name: "গণিত বাবল স্প্ল্যাশ", icon: "🔢", color: "from-sky-400 to-blue-600", desc: "মজার যোগ-বিয়োগের ধাঁধা" },
  { id: "tictactoe", name: "সান বনাম মুন", icon: "☀️", color: "from-orange-400 to-amber-500", desc: "স্মার্ট রোবটের সাথে খেলা" },
  { id: "space", name: "রকেট স্পেস রান", icon: "🚀", color: "from-indigo-400 to-purple-600", desc: "মহাকাশের বাধা পেরিয়ে চলো" },
  { id: "doodle", name: "ম্যাজিক গ্লো আর্ট", icon: "🎨", color: "from-fuchsia-400 to-pink-600", desc: "নিওন ড্রয়িং ও স্ট্যাম্প" },
];

export default function ArcadeHome() {
  const { coins, avatar, setAvatar } = useGameStore();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const avatars = ["🐰", "🦁", "🐼", "🦄", "🐱"];

  return (
    <main className="min-h-screen bg-[#f7f5ff] text-slate-800 pb-20">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b-4 border-purple-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-bounce">🧸</span>
          <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400">
            Maisha
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-purple-50 p-1.5 rounded-full border-2 border-purple-200">
            {avatars.map((av) => (
              <button
                key={av}
                onClick={() => {
                  sounds.playPop();
                  setAvatar(av);
                }}
                className={`w-9 h-9 text-lg rounded-full flex items-center justify-center transition ${
                  avatar === av ? "bg-white shadow-md scale-110" : "opacity-60 hover:opacity-100"
                }`}
              >
                {av}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-2xl animate-spin">⭐</span>
            <span className="font-black text-amber-800 text-lg">{coins}</span>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto mt-6 px-4">
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between">
          <div className="z-10 max-w-lg space-y-4 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-950 font-black rounded-full text-sm">
              ✨ বাচ্চাদের নিরাপদ গেমিং জোন
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              মাইশার সাথে খেলো, শেখো এবং আনন্দ করো!
            </h1>
            <p className="text-purple-150 font-medium text-lg">
              ডানদিকের ৩ডি বন্ধুকে স্পর্শ করো বোনাস স্টার কয়েন পাওয়ার জন্য!
            </p>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <MascotCanvas />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-purple-950 flex items-center gap-3">
            <span>🎮</span> জনপ্রিয় ৩ডি গেমস
          </h2>
          <span className="text-purple-700 font-bold bg-purple-100 px-4 py-1.5 rounded-full text-sm">
            ১২টি মজার খেলা
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GAMES_LIST.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="clay-card p-6 flex flex-col items-center text-center cursor-pointer group"
              onClick={() => {
                sounds.playPop();
                setSelectedGame(game.id);
              }}
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-4xl shadow-md mb-4 group-hover:rotate-6 transition`}
              >
                {game.icon}
              </div>
              <h3 className="font-black text-xl text-slate-800 mb-1">{game.name}</h3>
              <p className="text-slate-500 text-sm font-medium mb-4">{game.desc}</p>
              <button className="w-full py-2.5 rounded-xl font-black text-white clay-btn-purple text-sm">
                খেলো এখনই 🚀
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 shadow-2xl relative border-4 border-purple-200"
            >
              <button
                onClick={() => setSelectedGame(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-red-100 text-red-600 rounded-full font-black text-xl flex items-center justify-center hover:bg-red-200 transition"
              >
                ✕
              </button>

              <div className="mt-4">
                {selectedGame === "slice" && <FruitSlice />}
                {selectedGame === "balloon" && <BalloonPop />}
                {selectedGame === "whack" && <WhackAMonster />}
                {selectedGame === "xylophone" && <Xylophone3D />}
                {!["slice", "balloon", "whack", "xylophone"].includes(selectedGame) && (
                  <div className="py-12 text-center space-y-4">
                    <span className="text-6xl">🎉</span>
                    <h3 className="text-2xl font-black text-purple-950">গেমটি শুরু হচ্ছে!</h3>
                    <p className="text-slate-600">
                      কম্পোনেন্ট লোড হচ্ছে...
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
