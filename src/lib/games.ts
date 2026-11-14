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

/** Extra coins for reaching 0/1/2/3 stars. */
export const STAR_BONUS = [0, 2, 5, 10];

/** Coins depend on the score itself (relative to the game's 3-star target) plus a star bonus, so every game/score pays differently. */
export function calcCoins(score: number, stars: number, meta: Pick<GameMeta, "stars">): number {
  const target = meta.stars[2] || 1;
  return Math.min(40, Math.round((score * 15) / target)) + STAR_BONUS[stars];
}

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
    icon: "🔨",
    color: "from-amber-400 to-orange-500",
    bg: "bg-gradient-to-b from-sky-300 to-emerald-400",
    desc: "আবির কাকুর মুখের মনস্টার ধরো!",
    howTo: "গর্ত থেকে আবির কাকু-মনস্টার উঠলেই ট্যাপ করো, পালিয়ে যাওয়ার আগে!",
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

/** Little emoji "poster" shown on each home-page card (centre emoji first). */
export const CARD_ART: Record<string, { art: [string, string, string]; panel: string }> = {
  balloon: { art: ["🎈", "🎈", "⭐"], panel: "bg-violet-200" },
  whack: { art: ["🐹", "🔨", "🌱"], panel: "bg-orange-200" },
  xylophone: { art: ["🎹", "🎵", "🎶"], panel: "bg-emerald-200" },
  catch: { art: ["🧁", "🍩", "🍬"], panel: "bg-pink-200" },
  maze: { art: ["🔮", "⭐", "🌀"], panel: "bg-teal-200" },
  space: { art: ["🚀", "🪐", "⭐"], panel: "bg-indigo-200" },
  slice: { art: ["🍉", "🍓", "🍋"], panel: "bg-rose-200" },
  memory: { art: ["🦁", "🐼", "🐸"], panel: "bg-purple-200" },
  simon: { art: ["💡", "🔴", "🔵"], panel: "bg-yellow-200" },
  math: { art: ["🔢", "➕", "➖"], panel: "bg-sky-200" },
  tictactoe: { art: ["☀️", "🌙", "⭐"], panel: "bg-amber-200" },
  doodle: { art: ["🎨", "🖌️", "🌈"], panel: "bg-fuchsia-200" },
};

export const GAME_EN: Record<string, { name: string; desc: string; howTo: string }> = {
  balloon: { name: "Balloon Pop Frenzy", desc: "Pop colourful 3D balloons", howTo: "Tap the flying balloons. Golden star balloons give more points!" },
  whack: { name: "Monster Tap", desc: "Catch Abir Kaku's monster face!", howTo: "Tap the Abir Kaku monster as soon as it pops out of a hole, before it runs away!" },
  xylophone: { name: "3D Rainbow Tunes", desc: "A musical xylophone", howTo: "Tap the colourful bars or slide your finger to play a tune!" },
  catch: { name: "Sweets Catcher", desc: "Catch cakes in the basket", howTo: "Move your finger or mouse to catch the falling sweets in your basket!" },
  maze: { name: "Marble Roller", desc: "A 3D balancing maze", howTo: "Drag to tilt the board. Collect the stars and drop the marble in the golden hole!" },
  space: { name: "Rocket Space Run", desc: "Fly past the space rocks", howTo: "Tap the left or right side of the screen to change lanes. Dodge rocks, grab stars!" },
  slice: { name: "Candy Slicer", desc: "A fast slicing game", howTo: "Swipe to slice flying fruits and candies! Slice many in a row for a combo bonus." },
  memory: { name: "Card Memory Match", desc: "Find the matching pictures", howTo: "Flip two cards to find a matching pair. The fewer moves, the more stars!" },
  simon: { name: "Simon Beat Jam", desc: "Memory and beat repeat", howTo: "Watch which colours light up, then tap them in the same order. You have three hearts!" },
  math: { name: "Math Bubble Splash", desc: "Fun adding and subtracting puzzles", howTo: "Tap the bubble with the right answer. Be quick and keep a streak for a bonus!" },
  tictactoe: { name: "Sun vs Moon", desc: "Play against a smart robot", howTo: "You are ☀️, the robot is 🌙. Get three in a row to win!" },
  doodle: { name: "Magic Glow Art", desc: "Neon drawing and stamps", howTo: "Draw with your finger, add stamps and save your picture!" },
};

/** Localised name/desc/howTo for a game. */
export const gameText = (g: GameMeta, lang: "bn" | "en") =>
  lang === "en" && GAME_EN[g.id] ? GAME_EN[g.id] : { name: g.name, desc: g.desc, howTo: g.howTo };
