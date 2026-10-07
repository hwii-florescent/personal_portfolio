"use client";

import dynamic from "next/dynamic";

// three.js needs the browser; keep it out of SSR.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneLoader() {
  return <Scene />;
}
