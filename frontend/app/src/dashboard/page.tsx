"use client";

import React from "react";
import RadarPage from "@/components/layout/radar";
export default function RadarDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-400">Radar Unit-01</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-800 rounded-xl">
            Calibrate
          </button>
          <button className="px-4 py-2 bg-green-500 text-black rounded-xl">
            Export Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Live Feed</h2>
            <div className="space-y-2 text-sm">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-700">
                <p className="text-red-400">CRITICAL ALERT</p>
                <p>Perimeter breach detected</p>
              </div>
              <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
                <p className="text-yellow-400">WARNING</p>
                <p>Unidentified signal detected</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Global Status</h2>
            <p className="text-sm">CPU Load: 14%</p>
            <p className="text-sm">Temp: 42°C</p>
            <p className="text-sm">Signal: -42 dBm</p>
          </div>
        </div>

        {/* Radar */}
        <RadarPage />

        {/* Right Panel */}
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Target Intelligence</h2>
            <p className="text-sm">Tracking ID: TRK-082</p>
            <p className="text-sm text-red-400">Status: Hostile</p>
            <p className="text-sm">Range: 142.5m</p>
            <p className="text-sm">Velocity: 14.2 km/h</p>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Controls</h2>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-800 p-2 rounded-lg">Alarm</button>
              <button className="bg-red-600 p-2 rounded-lg">Lockdown</button>
              <button className="bg-gray-800 p-2 rounded-lg">Tracking</button>
              <button className="bg-gray-800 p-2 rounded-lg">Alert Team</button>
            </div>
          </div>

          <button className="w-full bg-green-500 text-black py-3 rounded-xl">
            Acknowledge All Alerts
          </button>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm">Network Latency</p>
          <h3 className="text-xl">12ms</h3>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm">Uptime</p>
          <h3 className="text-xl">142h</h3>
        </div>
      </div>
    </div>
  );
}
