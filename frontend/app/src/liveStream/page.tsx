"use client";

import React from "react";

type Feed = {
  title: string;
  location: string;
  image: string;
  tag?: string;
};

const feeds: Feed[] = [
  {
    title: "MAIN ENTRANCE - SOUTH",
    location: "GROUND LEVEL - AREA A",
    image: "https://images.unsplash.com/photo-1529429617124-95b109e86bb8",
    tag: "HUMAN",
  },
  {
    title: "PERIMETER FENCE - NORTH",
    location: "RESTRICTED ZONE",
    image: "https://images.unsplash.com/photo-1501696461415-6bd6660c6742",
  },
  {
    title: "LOADING DOCK 04",
    location: "WAREHOUSE COMPLEX",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
  },
  {
    title: "EXECUTIVE PARKING",
    location: "LEVEL B2",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    tag: "SEDAN",
  },
  {
    title: "DATA CENTER LOBBY",
    location: "BUILDING 7",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    tag: "STAFF",
  },
  {
    title: "ROOFTOP HELIPAD",
    location: "OBSERVATION TOWER",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-400">
          LIVE MONITORING SUITE
        </h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            Grid View
          </button>
          <button className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500">
            Start Master Rec
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT GRID */}
        <div className="col-span-9 grid grid-cols-2 gap-6">
          {feeds.map((feed, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-green-500 transition"
            >
              <div className="relative">
                <img
                  src={feed.image}
                  alt={feed.title}
                  className="w-full h-48 object-cover"
                />

                {/* Tag */}
                {feed.tag && (
                  <span className="absolute top-2 left-2 bg-green-500 text-xs px-2 py-1 rounded">
                    {feed.tag}
                  </span>
                )}

                {/* REC Badge */}
                <span className="absolute top-2 right-2 bg-red-600 text-xs px-2 py-1 rounded">
                  REC
                </span>
              </div>

              <div className="p-3">
                <h2 className="text-sm font-semibold">{feed.title}</h2>
                <p className="text-xs text-gray-400">{feed.location}</p>
              </div>
            </div>
          ))}

          {/* Add Node */}
          <div className="border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center h-48 text-gray-500 hover:border-green-500">
            + ADD SURVEILLANCE NODE
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-3 bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">ACTIVE DETECTIONS</h2>

          {/* Detection Card */}
          <div className="bg-black border border-gray-700 p-3 rounded-lg mb-3">
            <p className="text-sm font-semibold text-green-400">
              HUMAN DETECTED
            </p>
            <p className="text-xs text-gray-400">98% Match</p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs bg-green-600 px-2 py-1 rounded">
                Verify
              </button>
              <button className="text-xs bg-gray-700 px-2 py-1 rounded">
                Dismiss
              </button>
            </div>
          </div>

          <div className="bg-black border border-gray-700 p-3 rounded-lg">
            <p className="text-sm font-semibold text-blue-400">
              VEHICLE DETECTED
            </p>
            <p className="text-xs text-gray-400">85% Match</p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs bg-green-600 px-2 py-1 rounded">
                Verify
              </button>
              <button className="text-xs bg-gray-700 px-2 py-1 rounded">
                Dismiss
              </button>
            </div>
          </div>

          {/* Footer Button */}
          <button className="w-full mt-6 bg-green-600 py-2 rounded-lg hover:bg-green-500">
            Export All Logs
          </button>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 text-sm">
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400">Sensor Health</p>
          <p className="text-green-400 font-bold">98%</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400">Network Throughput</p>
          <p className="font-bold">842 Mbps</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400">Latency</p>
          <p className="font-bold">12 ms</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400">Storage</p>
          <p className="font-bold">78% Full</p>
        </div>
      </div>
    </div>
  );
}
