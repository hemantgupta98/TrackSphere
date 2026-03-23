"use client";

import { useEffect, useState } from "react";

type Target = {
  id: number;
  x: number;
  y: number;
};

export default function RadarPage() {
  const [angle, setAngle] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);

  // Rotate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Generate live targets
  useEffect(() => {
    const interval = setInterval(() => {
      setTargets((prev) => [
        ...prev.slice(-6), // keep last 6 targets
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full min-h-96 items-center justify-center bg-black text-green-400">
      <div className="relative w-100 h-96 rounded-full border border-green-500 overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.3)]">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-green-900/10"></div>

        {/* Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-green-700"></div>
        <div className="absolute inset-8 rounded-full border border-green-700"></div>
        <div className="absolute inset-16 rounded-full border border-green-700"></div>
        <div className="absolute inset-24 rounded-full border border-green-700"></div>

        {/* Cross Lines */}
        <div className="absolute w-full h-px bg-green-700 top-1/2"></div>
        <div className="absolute h-full w-px bg-green-700 left-1/2"></div>

        {/* Sweep Line */}
        <div
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "center",
          }}
        >
          <div className="absolute left-1/2 top-1/2 w-0.5 h-[200px] bg-green-400 origin-bottom"></div>
        </div>

        {/* Sweep Glow */}
        <div
          className="absolute w-full h-full"
          style={{
            background: `conic-gradient(rgba(34,197,94,0.25) ${angle}deg, transparent ${angle}deg)`,
          }}
        ></div>

        {/* Targets */}
        {/**  {targets.map((t) => (
          <div
            key={t.id}
            className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
            style={{
              top: `${t.y}%`,
              left: `${t.x}%`,
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        ))} */}

        {/* Center Dot */}
        <div className="absolute w-3 h-3 bg-green-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
}
