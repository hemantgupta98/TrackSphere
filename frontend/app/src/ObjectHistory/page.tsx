"use client";

import { useState } from "react";

export default function Page() {
  const [active, setActive] = useState(0);

  const history = [
    {
      id: "TRK-9021",
      title: "Unmanned Aerial Vehicle",
      threat: "HIGH",
      speed: "42 km/h",
      distance: "120m",
    },
    {
      id: "TRK-8842",
      title: "Ground Vehicle",
      threat: "LOW",
      speed: "12 km/h",
      distance: "450m",
    },
    {
      id: "TRK-8710",
      title: "Biological - Human",
      threat: "MEDIUM",
      speed: "4 km/h",
      distance: "15m",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT PANEL */}
        <div className="col-span-4 border border-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Detection History</h2>

          <input
            placeholder="Search by ID, type..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4"
          />

          <div className="space-y-3">
            {history.map((item, i) => (
              <div
                key={i}
                onClick={() => setActive(i)}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  active === i
                    ? "border-green-500 bg-gray-900"
                    : "border-gray-800"
                }`}
              >
                <p className="text-sm text-gray-400">{item.id}</p>
                <h3 className="font-medium">{item.title}</h3>
                <p
                  className={`text-xs mt-1 ${
                    item.threat === "HIGH"
                      ? "text-red-400"
                      : item.threat === "MEDIUM"
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  {item.threat} THREAT
                </p>

                <div className="flex justify-between text-xs mt-2 text-gray-400">
                  <span>{item.speed}</span>
                  <span>{item.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-8 space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">TRK-9021</h1>
              <p className="text-gray-400 text-sm">High Priority Track</p>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-700 rounded-lg text-sm">
                Export JSON
              </button>
              <button className="px-4 py-2 border border-gray-700 rounded-lg text-sm">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-green-500 text-black rounded-lg text-sm font-medium">
                Generate Report
              </button>
            </div>
          </div>

          {/* RADAR + TELEMETRY */}
          <div className="grid grid-cols-12 gap-4">
            {/* RADAR */}
            <div className="col-span-8 border border-gray-800 rounded-xl p-4">
              <h2 className="text-sm text-gray-400 mb-2">
                Spatial Path Reconstruction
              </h2>

              <div className="h-64 bg-gradient-to-br from-green-900/20 to-black rounded-lg flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border border-green-500 animate-pulse"></div>
              </div>
            </div>

            {/* TELEMETRY */}
            <div className="col-span-4 space-y-4">
              <div className="border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Peak Speed</p>
                <h3 className="text-xl font-bold text-green-400">42 km/h</h3>
              </div>

              <div className="border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Closest Approach</p>
                <h3 className="text-xl font-bold text-green-400">120m</h3>
              </div>

              <div className="border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">Confidence</p>
                <div className="w-full bg-gray-800 h-2 rounded">
                  <div className="w-[94%] h-2 bg-green-500 rounded"></div>
                </div>
                <p className="text-xs mt-1 text-gray-400">94.2%</p>
              </div>
            </div>
          </div>

          {/* CHART + SNAPSHOTS */}
          <div className="grid grid-cols-12 gap-4">
            {/* CHART */}
            <div className="col-span-7 border border-gray-800 rounded-xl p-4">
              <h2 className="text-sm text-gray-400 mb-4">Velocity vs Time</h2>

              <div className="h-48 flex items-end gap-2">
                {[10, 30, 50, 40, 20, 35, 25].map((v, i) => (
                  <div
                    key={i}
                    className="bg-green-500 w-6"
                    style={{ height: `${v}%` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* SNAPSHOTS */}
            <div className="col-span-5 border border-gray-800 rounded-xl p-4">
              <h2 className="text-sm text-gray-400 mb-4">Visual Evidence</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-gray-800 rounded"></div>
                <div className="h-24 bg-gray-800 rounded"></div>
                <div className="h-24 bg-gray-800 rounded"></div>
                <div className="h-24 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">
                  View More
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-xs text-gray-500 flex justify-between">
            <span>© RadarGuard AI Systems</span>
            <span className="text-green-500">System Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
