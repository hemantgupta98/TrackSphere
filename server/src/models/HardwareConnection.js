import mongoose from "mongoose";

const hardwareConnectionSchema = new mongoose.Schema(
  {
    ssid: {
      type: String,
      required: true,
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      required: true,
      min: 1,
      max: 65535,
    },
    status: {
      type: String,
      enum: ["connected", "not_connected"],
      default: "not_connected",
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

hardwareConnectionSchema.index({ ipAddress: 1, port: 1 }, { unique: true });

const HardwareConnection = mongoose.model(
  "HardwareConnection",
  hardwareConnectionSchema,
);

export default HardwareConnection;
