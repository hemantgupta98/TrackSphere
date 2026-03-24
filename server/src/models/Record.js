import mongoose from "mongoose";

const detectionSchema = new mongoose.Schema(
  {
    distance: { type: Number, default: null },
    angle: { type: Number, default: null },
    confidence: { type: Number, default: null },
    detected: { type: Boolean, default: false },
  },
  { _id: false },
);

const recordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["video", "snapshot"],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sourceIp: {
      type: String,
      default: "",
      trim: true,
    },
    detection: {
      type: detectionSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

const Record = mongoose.model("Record", recordSchema);

export default Record;
