"use client";

import React from "react";
import { useState } from "react";
import RadarPage from "@/components/layout/radar";
export default function RadarDashboard() {
  const [isRadarOn, setIsRadarOn] = useState(false);
  const [isHardware, setIsHardwae] = useState(false);
  const [capturedAlerts] = useState<
    Array<{
      level: "critical" | "warning";
      title: string;
      message: string;
    }>
  >([]);
  const [targetIntelligence] = useState<{
    trackingId: string;
    status: string;
    range: string;
    velocity: string;
  } | null>(null);
  const [systemMetrics] = useState<{
    networkLatency: string;
    uptime: string;
  } | null>(null);
  const criticalAlert = capturedAlerts.find(
    (alert) => alert.level === "critical",
  );
  const warningAlert = capturedAlerts.find(
    (alert) => alert.level === "warning",
  );

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

      <div className="grid grid-cols-3 mb-4 gap-5">
        <button
          type="button"
          onClick={() => setIsRadarOn((prev) => !prev)}
          className={`rounded-xl px-4 py-2 font-semibold transition ${
            isRadarOn
              ? "bg-green-500 text-black hover:bg-green-400"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
        >
          {isRadarOn ? "Radar System: ON" : "Radar System: OFF"}
        </button>
        <button
          type="button"
          onClick={() => setIsHardwae((prev) => !prev)}
          className={`rounded-xl px-4 py-2 font-semibold transition ${
            isHardware
              ? "bg-green-500 text-black hover:bg-green-400"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
        >
          {isRadarOn
            ? "Connect Hardware Radar: ON"
            : "Connect Hardware Radar: OFF"}
        </button>
      </div>

      <div className="grid grid-cols-3 items-stretch gap-6">
        {/* Left Panel */}
        <div className="h-full space-y-2">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Live Feed</h2>
            <div className="space-y-2 text-sm">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-700">
                <p className="text-red-400">CRITICAL ALERT</p>
                <p>
                  {isRadarOn && criticalAlert
                    ? criticalAlert.message
                    : "No data"}
                </p>
              </div>
              <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
                <p className="text-yellow-400">WARNING</p>
                <p>
                  {isRadarOn && warningAlert ? warningAlert.message : "No data"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Global Status</h2>
            {isRadarOn ? (
              <>
                <p className="text-sm">CPU Load: 14%</p>
                <p className="text-sm">Temp: 42°C</p>
                <p className="text-sm">Signal: -42 dBm</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data</p>
            )}
          </div>
        </div>

        {/* Radar */}
        <div className="h-full">
          {isRadarOn ? (
            <RadarPage />
          ) : (
            <div className="h-full min-h-96 rounded-2xl border border-gray-800 bg-black" />
          )}
        </div>

        {/* Right Panel */}
        <div className="h-full space-y-4">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Target Intelligence</h2>
            {isRadarOn && targetIntelligence ? (
              <>
                <p className="text-sm">
                  Tracking ID: {targetIntelligence.trackingId}
                </p>
                <p className="text-sm text-red-400">
                  Status: {targetIntelligence.status}
                </p>
                <p className="text-sm">Range: {targetIntelligence.range}</p>
                <p className="text-sm">
                  Velocity: {targetIntelligence.velocity}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data</p>
            )}
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
          <h3 className="text-xl">
            {systemMetrics ? systemMetrics.networkLatency : "No data"}
          </h3>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm">Uptime</p>
          <h3 className="text-xl">
            {systemMetrics ? systemMetrics.uptime : "No data"}
          </h3>
        </div>
      </div>
    </div>
  );
}
