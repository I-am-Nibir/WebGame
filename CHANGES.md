# Maisha Kids Arcade: রিভিউ ও পরিবর্তনের সারসংক্ষেপ

এই ফাইলে মূল প্রজেক্টের রিভিউ, কী কী ঠিক করা হয়েছে, নতুন কী যোগ হয়েছে এবং কীভাবে টেস্ট করা হয়েছে, সব এক জায়গায় আছে।

---

## ১. মূল প্রজেক্টে যা পাওয়া গিয়েছিল

### সবচেয়ে বড় সমস্যা
- সাইটটি "৩ডি গেমস" বলে দাবি করলেও ৩ডি ছিল শুধু হোমপেজের একটা গোল মাসকট। ৪টা গেমই ২ডি ছিল (emoji, CSS button, canvas)।
- ১২টা গেম কার্ডের মধ্যে **৮টার কোনো কোড ছিলই না**। ক্লিক করলে শুধু "কম্পোনেন্ট লোড হচ্ছে..." দেখাত।

### বাগ
| # | সমস্যা |
|---|---|
| 1 | `autoprefixer` `package.json`-এ ছিল না, তাই `next build` ফেইল করত |
| 2 | `@prisma/client` ছিল কিন্তু `schema.prisma` ছিল না, README-র `prisma db push` চলত না |
| 3 | Fruit Slice-এ টাচ কাজ করত না ঠিকমতো: listener cleanup ছিল না, স্লাইসের সময় পেজ স্ক্রল হত |
| 4 | Fruit Slice-এ `forEach`-এর ভেতরে `splice`, তাই আইটেম skip হত |
| 5 | Fruit Slice-এর canvas `devicePixelRatio` handle করত না, ফোনে ঝাপসা দেখাত |
| 6 | Balloon Pop-এ মিস হওয়া বেলুন DOM থেকে মুছত না |
| 7 | Whack-a-Monster-এ শুরুর বোতাম ও মিসের ফিডব্যাক ছিল না |
| 8 | কয়েন অসীম ফার্ম করা যেত এবং কয়েনের কোনো ব্যবহার ছিল না |
| 9 | `text-purple-150` Tailwind-এ নেই |
| 10 | সাউন্ড টগল স্টোরের সাথে যুক্ত ছিল না, UI-তে মিউট বোতামও ছিল না |
| 11 | বাংলা ফন্ট স্ট্যাক ছিল না |

---

## ২. কী কী করা হয়েছে

### ফাউন্ডেশন
- `autoprefixer` যোগ, `prisma` বাদ, ESLint (`next/core-web-vitals`) ও `.gitignore` যোগ।
- **Store (`src/lib/store.ts`):** কয়েন, অবতার (কেনা যায়), সাউন্ড, গেমভিত্তিক high score ও সর্বোচ্চ তারা, মাসকট বোনাস (৪৫ সেকেন্ড cooldown)। localStorage-এ সেভ হয়।
- **Sound engine (`src/lib/audioEngine.ts`):** Web Audio দিয়ে ১৩টি সাউন্ড, compressor সহ, মিউট করলে পুরো বন্ধ।
- **GameShell (`src/components/ui/GameShell.tsx`):** সব গেমের সাধারণ পর্দা:
  - শুরু / বিরতি / শেষ স্ক্রিন, টাইমার বার
  - তারা (১-৩) ও কয়েন পুরস্কার, নতুন রেকর্ড দেখানো
  - Escape বা ট্যাব লুকালে অটো pause
  - গেম থেকে `useGame()` দিয়ে `addScore` ও `finish` ডাকা যায়
- **Scene3D / Burst / shapes (`src/components/3d/`):** ৩ডি গেমের শেয়ার্ড অংশ: মোবাইল-ফ্রেন্ডলি canvas, স্ক্রিনে ফিট করার `useFit`, পার্টিকল বার্স্ট, ৩ডি তারা।

### কয়েন নিয়ম
রাউন্ড শেষে: ০ তারা = ২, ১ তারা = ৫, ২ তারা = ১০, ৩ তারা = ২০ কয়েন। মাসকটে ট্যাপে প্রতি ৪৫ সেকেন্ডে একবার +৫। অবতারের দাম ০ থেকে ২০০ কয়েন।

### মাসকট
গোল বলের বদলে নতুন চরিত্র: কান, মুখ, গাল, নাক, হাত-পা। পয়েন্টারের দিকে চোখ ঘোরে, ঝিমঝিম করে ব্লিংক করে, ট্যাপ করলে লাফায় (squash and stretch), হাসে, হৃদয় confetti ছড়ায়। মেসেজ বাবল আছে।

### হোমপেজ
- নতুন নেভ: অবতার পিকার (শপ), সাউন্ড বোতাম, কয়েন
- গেম কার্ড এখন `<button>` (আগে nested button ছিল), ৩ডি/২ডি ব্যাজ, সেরা তারা ও স্কোর দেখায়
- হাইড্রেশন সেফ (`useHydrated`)
- `manifest.ts` ও `icon.svg` (PWA ইনস্টল)

### ১২টি গেম

| গেম | ধরন | সময় | নিয়ন্ত্রণ |
|---|---|---|---|
| বেলুন পপ ফ্রেঞ্জি | ৩ডি | ৪০s | ট্যাপ, সোনালী তারা বেলুনে ১৫ পয়েন্ট, কম্বো পিচ |
| মনস্টার ট্যাপ | ৩ডি | ৪০s | ৯টা গর্ত, ৫ রঙের মনস্টার, ক্রমে দ্রুত |
| ৩ডি রেইনবো সুর | ৩ডি | ফ্রি | সা-রে-গা-মা বার, আঙুল টানা, কীবোর্ড ১-৮, "তারার গান" হিন্ট |
| সুইটস ক্যাচার | ৩ডি | ৪০s | আঙুল/মাউস সরিয়ে ঝুড়ি, তীর কী |
| মার্বেল রোলার | ৩ডি | ৬০s | টেনে বোর্ড হেলানো, প্রতিবার নতুন ম্যাজ, ৩ তারা + গোল |
| রকেট স্পেস রান | ৩ডি | ৪৫s | বাঁ/ডান ট্যাপ, ৩ জীবন |
| ক্যান্ডি স্লাইসার | ২ডি | ৪৫s | আঙুল টেনে কাটা, কম্বো, অর্ধেক হয়ে ভাঙা |
| কার্ড মেমোরি | ২ডি | নিজে শেষ | CSS ৩ডি ফ্লিপ, কম চালে বেশি তারা |
| সাইমন বিট জাম | ২ডি | নিজে শেষ | ৩ হার্ট, pause করলে সিকোয়েন্সও থামে |
| গণিত বাবল স্প্ল্যাশ | ২ডি | ৪৫s | বাংলা সংখ্যা, ধাপে কঠিন, ধারাবাহিক বোনাস |
| সান বনাম মুন | ২ডি | নিজে শেষ | রোবট ~৬০% স্মার্ট, যাতে বাচ্চা জিততে পারে |
| ম্যাজিক গ্লো আর্ট | ২ডি | ফ্রি | নিওন ব্রাশ, রংধনু, স্ট্যাম্প, আনডু, রাবার, PNG সেভ |

### নতুন গেম যোগ করার নিয়ম
1. `src/lib/games.ts`-এ এন্ট্রি (নাম, সময়, তারার স্কোর)
2. `src/components/games/` ফোল্ডারে কম্পোনেন্ট লিখুন, `useGame()` দিয়ে স্কোর ও শেষ জানান
3. `src/components/games/index.tsx`-এ `lazy(() => import(...))` যোগ করুন

---

## ৩. টেস্ট ও যাচাই

- `npx tsc --noEmit`, `npx next lint`, `npx next build`: সব পাস
- First Load JS: **৩৫২ kB → ১৩৯ kB**
- Headless Chrome (৩৯০×৭৮০, টাচ মোড) দিয়ে ১২টা গেম খুলে console error যাচাই: **০টি error**
- Balloon Pop-এ ট্যাপ করে স্কোর বাড়া যাচাই
- Memory ও Sun vs Moon শেষ পর্যন্ত খেলে রেজাল্ট স্ক্রিন, কয়েন (২০ → ৩০ → ৫০) ও high score সেভ যাচাই

### টেস্টে ধরা পড়া বাগ (ঠিক করা হয়েছে)
1. **Tailwind `src/lib` ফোল্ডার স্ক্যান করত না**, তাই `games.ts`-এর গ্রেডিয়েন্ট ক্লাস তৈরি হয়নি এবং গেমের ব্যাকগ্রাউন্ড স্বচ্ছ ছিল। `tailwind.config.ts`-এ `./src/lib/**` যোগ করে ঠিক।
2. **Memory গেমে card id বাগ।** `id` শাফলের আগে দেওয়া হয়েছিল কিন্তু `deck[id]` দিয়ে শাফলের পরে খোঁজা হত। ফলে স্ক্রিনের কার্ড আর যে কার্ড তুলনা হচ্ছিল আলাদা ছিল, নকল ম্যাচ ও ভুল স্কোর হত। শাফলের পরে id দিয়ে ঠিক। ১৪ বার flakiness টেস্টে ০ anomaly।
3. Xylophone-এর শেষ বার বোতামের নিচে ঢেকে যেত, Sweets Catcher-এর ডোনাট চ্যাপ্টা দেখাত: দুটোই ঠিক।

---

## ৪. যা এখনো বাকি / সীমাবদ্ধতা

- **ক্যান্ডি স্লাইসার ২ডি** রয়ে গেছে।
- **অফলাইন সাপোর্ট নেই:** manifest আছে, service worker নেই।
- **আসল ফোনে টাচ ও পারফরম্যান্স টেস্ট হয়নি** (শুধু headless Chrome-এ)। সস্তা ফোনে ৩ডি লোড দেখা দরকার।
- সাউন্ডের ভলিউম ফোনে টিউন করা দরকার হতে পারে।
- বাংলা ফন্ট এখন সিস্টেম ফন্টের ওপর নির্ভর করে (Hind Siliguri, Noto Sans Bengali, Nirmala UI ইত্যাদি স্ট্যাক)। ওয়েবফন্ট লোড করা হয়নি, যাতে বাইরের সার্ভারে কোনো রিকোয়েস্ট না যায়।

### ভবিষ্যতের আইডিয়া
- মাসকটকে আরও চরিত্র (পোশাক, টুপি) ও লেভেল সিস্টেম
- দৈনিক চ্যালেঞ্জ ও স্টিকার সংগ্রহ
- service worker দিয়ে অফলাইন খেলা
- প্যারেন্ট গেট ও খেলার সময়সীমা

---

## ৫. GitHub-এ আপলোড

`node_modules` ও `.next` আপলোড করার দরকার নেই, `.gitignore` এগুলো বাদ দেয়। `package-lock.json` রাখুন।

```bash
cd maisha-kids-arcade
git init
git add .
git commit -m "Maisha Kids Arcade: 12 games, 3D mascot, shared game shell"
git branch -M main
git remote add origin https://github.com/<তোমার-ইউজারনেম>/<রিপোর-নাম>.git
git push -u origin main
```

ডিপ্লয় করতে চাইলে Vercel-এ GitHub রিপো ইমপোর্ট করলেই হবে (Next.js অটো ডিটেক্ট হয়, কোনো এনভায়রনমেন্ট ভেরিয়েবল লাগে না)।

---

## ৬. ফোল্ডার কাঠামো

```
src/
  app/            page.tsx, layout.tsx, globals.css, manifest.ts, icon.svg
  lib/            games.ts, store.ts, audioEngine.ts, avatars.ts, format.ts, useHydrated.ts
  components/
    ui/           GameShell.tsx, HeroBanner.tsx
    3d/           MascotCanvas.tsx, Scene3D.tsx, Burst.tsx, shapes.ts
    games/        index.tsx + ১২টি গেম
```

---

## ৭. হোমপেজ ডিজাইন আপডেট (অ্যানিমেটেড ব্যানার)

রেফারেন্স ডিজাইন অনুযায়ী হোমপেজ নতুন করে সাজানো হয়েছে।

### অ্যানিমেটেড হিরো ব্যানার (`src/components/ui/HeroBanner.tsx`)
সলিড রঙের বদলে ব্যানারের ব্যাকগ্রাউন্ড এখন চলমান:
- ঝিকমিক করা তারা (১৬টি), মাঝে মাঝে উল্কা
- ঘুমন্ত মুখওয়ালা দোলনা-খাওয়া চাঁদ
- ভেসে যাওয়া মেঘ
- পাহাড়ের ওপর দৌড়ানো ঘোড়া 🐎 (ডান থেকে বামে), আকাশে উড়ন্ত ইউনিকর্ন 🦄 ✨
- ওপরে ওঠা রঙিন বেলুন 🎈, কোনাকুনি উড়ন্ত রকেট 🚀, প্রজাপতি 🦋
- নিচে ঢেউখেলানো বেগুনি পাহাড়, তার ওপরে ৩ডি মাসকট

প্রযুক্তিগত দিক:
- শুধু CSS `transform` ও `opacity` অ্যানিমেশন, তাই হালকা (কোনো অতিরিক্ত JS লাইব্রেরি নেই)
- ডেটা স্থির (`Math.random` নেই), তাই সার্ভার ও ক্লায়েন্টের মার্কআপ এক
- `prefers-reduced-motion` চালু থাকলে সব অ্যানিমেশন বন্ধ
- ফোনে লেখা পড়ার জন্য সাজসজ্জা কমানো হয়, মেঘ ও ইউনিকর্ন লেখার জায়গা থেকে সরিয়ে রাখা হয়
- ঘোড়ার মুখ উল্টো দিকে দেখালে (ইমোজির দিক ডিভাইসভেদে আলাদা হতে পারে): `HeroBanner.tsx`-এ ঘোড়ার ইমোজিটা `<span className="inline-block -scale-x-100">🐎</span>` দিয়ে মুড়ে দিন এবং বাইরের ডিভের `hero-gallop` ক্লাসের বদলে `hero-drift` দিন (ঘোড়া তখন বাম থেকে ডানে দৌড়াবে)। `hero-hop` ডিভে সরাসরি `scale-x` দেবেন না, কারণ অ্যানিমেশন সেটাকে ওভাররাইট করে।

### বাকি অংশ
- নেভ: রঙিন বড় লোগো, হোম / ৩ডি গেমস লিংক (স্ক্রল করে), সোনালী কয়েন পিল
- গেম কার্ড: মোটা বেগুনি বর্ডার, রঙিন ছবির প্যানেল, কমলা "খেলো এখনই" বোতাম
- ক্রিম ব্যাকগ্রাউন্ডে হালকা কনফেটি ডট
- "খেলা শুরু করো" বোতাম গেম তালিকায় স্মুথ স্ক্রল করে

---

## ৮. প্রিভিউ ও ডিপ্লয় নোট

- প্রিভিউয়ের জন্য সাইটটি স্ট্যাটিক এক্সপোর্ট (`output: "export"`) করে আলাদা কপিতে বিল্ড করা হয়েছিল। আসল প্রজেক্টের `next.config.mjs` বদলানো হয়নি।
- প্রিভিউয়ে `_next` ফোল্ডারের নাম `nx` করতে হয়েছিল, কারণ প্রিভিউ হোস্ট `_` দিয়ে শুরু হওয়া নাম নেয় না। নিজের হোস্টিংয়ে এটা লাগবে না।
- প্রিভিউয়ে ডাউনলোড (ডুডল সেভ) বন্ধ, আর কয়েন/স্কোর সেভ ভিউয়ারের ব্রাউজার ব্লক করলে চলবে না।
- হেডলেস Chrome-এ ১২টা গেম খুলে কনসোল এরর নেই দেখা হয়েছে। আসল ফোনে টাচ ও পারফরম্যান্স এখনো টেস্ট হয়নি।

### Render-এ ডিপ্লয়
| সেটিং | মান |
|---|---|
| ধরন | Web Service (Runtime: Node) |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Environment | `NODE_VERSION` = `20` |

- ফ্রি প্ল্যানে কিছুক্ষণ কেউ না এলে সাইট ঘুমিয়ে যায়, আবার খুললে প্রথম লোডে প্রায় ৫০ সেকেন্ড লাগতে পারে।
- ফ্রি প্ল্যানে মেমরি কম (৫১২ MB)। বিল্ডে "out of memory" এলে Environment-এ `NODE_OPTIONS` = `--max-old-space-size=460` দিন।
- Render-এ আমি ডিপ্লয় করে দেখিনি, এটা সাধারণ Node সেটআপ অনুযায়ী।

---

## 9. Maisha character, Abir monsters, 3D cartoon icons (latest)

**Maisha character (animated)**
- Uses the character-design art you made (4 poses cut out to transparent WebP in `public/maisha/`: `stand`, `wave`, `explore`, `victory`).
- `src/components/ui/MaishaChar.tsx` — one component, 3 modes:
  - `chill` – breathing + gentle sway, waves hello every few seconds (stand ↔ wave frames), twinkling icons around her
  - `victory` – jumping with arms up + falling confetti icons
  - `explore` – walking bob (backpack + map)
- Home page hero: `MaishaMascot.tsx` (tap her → she hops, giggles, speech bubble, +5 coin bonus every 45 s). It replaces the old 3D bunny, so `MascotCanvas.tsx` was deleted.
- Game start screen: Maisha chills/waves. Game result screen: Maisha does the victory jump when you get ≥ 1 star.
- Nav logo + favicon (`icon.svg`): small vector cartoon Maisha face (`MaishaFace.tsx`).

**Monster Tap (Whack-a-Monster)**
- Monsters now have Abir kaku's face wrapped on their head (`public/photos/abir-face.webp`, 400 px, soft edges), horns, ears; they wobble, go red + dizzy stars when bonked, and stay up for a moment before sinking.
- One monster per hole instead of five hidden variants (lighter for phones).

**All emoji replaced by 3D cartoon icons**
- `src/components/ui/Icons.tsx`: 55 hand-built SVG icons (clay shading + outline): stars, hearts, rocket, balloon, animals, fruits, rainbow, trophy, etc.
- `<Ico n="⭐" />` renders an icon by emoji or name; `<Rich>text 🎉</Rich>` swaps emoji inside strings.
- Canvas games (Fruit Slice, Glow Doodle) draw the same icons via `src/lib/iconImage.ts`.
- Emoji characters are still used internally as keys (saved avatar, game ids) but are never shown.

**Privacy note:** anything in `public/` is public once the site is online. `public/photos/abir-face.webp` is Abir's photo crop — remove/replace it if you don't want that public. Maisha's own photos are NOT in the project (only the cartoon art).

**To add a new icon:** add an entry to `DRAW` and `EMOJI_MAP` in `Icons.tsx`.
