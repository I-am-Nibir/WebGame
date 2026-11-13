export interface GameMeta {
  id: string;
  name: string;
  icon: string;
  color: string; // card gradient
  bg: string; // in-game background gradient
  desc: string;
  howTo: string;
  is3d: boolean;
  /** Round length in seconds. Omit if the game ends itself. */
  duration?: number;
  /** Free play: no rounds, scores or rewards. */
  freePlay?: boolean;
  /** Score needed for 1, 2, 3 stars. */
  stars: [number, number, number];
}

export const COINS_BY_STARS = [2, 5, 10, 20];

export const GAMES: GameMeta[] = [
  {
    id: "balloon",
    name: "বেলুন পপ ফ্রেঞ্জি",
    icon: "🎈",
    color: "from-blue-400 to-cyan-500",
    bg: "bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500",
    desc: "৩ডি রঙিন বেলুন ফাটাও",
    howTo: "উড়ন্ত বেলুনে ট্যাপ করো। সোনালী তারা বেলুনে বেশি পয়েন্ট!",
    is3d: true,
    duration: 40,
    stars: [75, 150, 225],
  },
  {
    id: "whack",
    name: "মনস্টার ট্যাপ",
    icon: "🐹",
    color: "from-amber-400 to-orange-500",
    bg: "bg-gradient-to-b from-sky-300 to-emerald-400",
    desc: "গর্ত থেকে বের হওয়া মনস্টার",
    howTo: "গর্ত থেকে মনস্টার উঠলেই ট্যাপ করো, পালিয়ে যাওয়ার আগে!",
    is3d: true,
    duration: 40,
    stars: [60, 120, 200],
  },
  {
    id: "xylophone",
    name: "৩ডি রেইনবো সুর",
    icon: "🎵",
    color: "from-emerald-400 to-teal-500",
    bg: "bg-gradient-to-b from-amber-100 via-orange-200 to-pink-300",
    desc: "মিউজিক্যাল জাইলোফোন",
    howTo: "রঙিন বারে ট্যাপ করো বা আঙুল টেনে সুর বাজাও!",
    is3d: true,
    freePlay: true,
    stars: [0, 0, 0],
  },
  {
    id: "catch",
    name: "সুইটস ক্যাচার",
    icon: "🧁",
    color: "from-red-400 to-pink-500",
    bg: "bg-gradient-to-b from-pink-200 via-rose-300 to-fuchsia-400",
    desc: "ঝুড়িতে কেক সংগ্রহ করো",
    howTo: "আঙুল বা মাউস সরিয়ে ঝুড়ি দিয়ে পড়ন্ত মিষ্টি ধরো!",
    is3d: true,
    duration: 40,
    stars: [60, 120, 180],
  },
  {
    id: "maze",
    name: "মার্বেল রোলার",
    icon: "🔮",
    color: "from-teal-400 to-emerald-600",
    bg: "bg-gradient-to-b from-indigo-400 via-purple-500 to-fuchsia-600",
    desc: "৩ডি ব্যালেন্সিং গোলকধাঁধা",
    howTo: "আঙুল টেনে বোর্ড হেলাও। তারা কুড়িয়ে সোনালী গর্তে মার্বেল ফেলো!",
    is3d: true,
    duration: 60,
    stars: [30, 60, 90],
  },
  {
    id: "space",
    name: "রকেট স্পেস রান",
    icon: "🚀",
    color: "from-indigo-400 to-purple-600",
    bg: "bg-gradient-to-b from-indigo-950 via-purple-950 to-black",
    desc: "মহাকাশের বাধা পেরিয়ে চলো",
    howTo: "স্ক্রিনের বাঁ বা ডান দিকে ট্যাপ করে লেন বদলাও। পাথর এড়াও, তারা কুড়াও!",
    is3d: true,
    duration: 45,
    stars: [60, 120, 200],
  },
  {
    id: "slice",
    name: "ক্যান্ডি স্লাইসার",
    icon: "🍉",
    color: "from-pink-400 to-rose-500",
    bg: "bg-gradient-to-b from-indigo-900 to-purple-950",
    desc: "স্পিড স্লাইসিং গেম",
    howTo: "আঙুল টেনে উড়ন্ত ফল ও ক্যান্ডি কেটে ফেলো! একটানা কাটলে কম্বো বোনাস।",
    is3d: false,
    duration: 45,
    stars: [100, 200, 300],
  },
  {
    id: "memory",
    name: "কার্ড মেমোরি ম্যাচ",
    icon: "🦁",
    color: "from-purple-400 to-violet-500",
    bg: "bg-gradient-to-b from-violet-300 to-purple-500",
    desc: "একই ছবি খুঁজে বের করো",
    howTo: "দুটো কার্ড উল্টে একই ছবি মেলাও। যত কম চালে পারবে, তত বেশি তারা!",
    is3d: false,
    stars: [100, 130, 155],
  },
  {
    id: "simon",
    name: "সাইমন বিট জাম",
    icon: "💡",
    color: "from-yellow-400 to-amber-600",
    bg: "bg-gradient-to-b from-slate-700 to-slate-900",
    desc: "স্মৃতিশক্তি ও বিট রিপিট",
    howTo: "কোন রঙ কোন ক্রমে জ্বলছে দেখো, তারপর একই ক্রমে ট্যাপ করো। তিনটা হার্ট আছে!",
    is3d: false,
    stars: [30, 60, 100],
  },
  {
    id: "math",
    name: "গণিত বাবল স্প্ল্যাশ",
    icon: "🔢",
    color: "from-sky-400 to-blue-600",
    bg: "bg-gradient-to-b from-cyan-300 to-blue-500",
    desc: "মজার যোগ-বিয়োগের ধাঁধা",
    howTo: "প্রশ্নের সঠিক উত্তরের বাবলে ট্যাপ করো। দ্রুত ও ধারাবাহিক হলে বোনাস!",
    is3d: false,
    duration: 45,
    stars: [50, 100, 150],
  },
  {
    id: "tictactoe",
    name: "সান বনাম মুন",
    icon: "☀️",
    color: "from-orange-400 to-amber-500",
    bg: "bg-gradient-to-b from-amber-200 to-orange-400",
    desc: "স্মার্ট রোবটের সাথে খেলা",
    howTo: "তুমি ☀️, রোবট 🌙। একই লাইনে তিনটা বসাতে পারলেই জিত!",
    is3d: false,
    stars: [20, 50, 100],
  },
  {
    id: "doodle",
    name: "ম্যাজিক গ্লো আর্ট",
    icon: "🎨",
    color: "from-fuchsia-400 to-pink-600",
    bg: "bg-gradient-to-b from-slate-900 to-indigo-950",
    desc: "নিওন ড্রয়িং ও স্ট্যাম্প",
    howTo: "আঙুল দিয়ে আঁকো, স্ট্যাম্প বসাও, আর ছবি সেভ করো!",
    is3d: false,
    freePlay: true,
    stars: [0, 0, 0],
  },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);
