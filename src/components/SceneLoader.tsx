"use client";

import dynamic from "next/dynamic";

// three.js needs the browser; keep it out of SSR.
export default dynamic(() => import("./Scene"), { ssr: false });
