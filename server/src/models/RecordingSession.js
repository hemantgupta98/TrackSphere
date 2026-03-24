import mongoose from "mongoose";

const recordingSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    streamPath: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["recording", "stopped"],
      default: "recording",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    stoppedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const RecordingSession = mongoose.model(
  "RecordingSession",
  recordingSessionSchema,
);

export default RecordingSession;
