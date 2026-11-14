"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Ico } from "@/components/ui/Icons";

const Loading = () => (
  <div className="h-full w-full grid place-items-center animate-bounce" aria-label="Loading">
    <Ico n="🎮" size={80} />
  </div>
);

const lazy = (loader: () => Promise<{ default: ComponentType }>) => dynamic(loader, { ssr: false, loading: Loading });

/** Every game is code-split so the home page stays light. */
export const GAME_COMPONENTS: Record<string, ComponentType> = {
  balloon: lazy(() => import("./BalloonPop")),
  whack: lazy(() => import("./WhackAMonster")),
  xylophone: lazy(() => import("./Xylophone3D")),
  catch: lazy(() => import("./SweetsCatcher")),
  maze: lazy(() => import("./MarbleMaze")),
  space: lazy(() => import("./SpaceRun")),
  slice: lazy(() => import("./FruitSlice")),
  memory: lazy(() => import("./MemoryMatch")),
  simon: lazy(() => import("./SimonBeat")),
  math: lazy(() => import("./MathBubbles")),
  tictactoe: lazy(() => import("./SunVsMoon")),
  doodle: lazy(() => import("./GlowDoodle")),
};
