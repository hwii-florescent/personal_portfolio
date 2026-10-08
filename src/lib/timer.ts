"use client";

// One THREE.Timer for the whole scene (replaces R3F's THREE.Clock, deprecated in three). <TimerTick /> advances it once per frame.
import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Timer } from "three";

export const timer = new Timer();

export function TimerTick() {
  useEffect(() => { timer.connect(document); return () => timer.disconnect(); }, []);
  useFrame(() => { timer.update(); }, -1); // negative priority: runs before the other frame callbacks, doesn't take over rendering
  return null;
}
