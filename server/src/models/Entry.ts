import { Schema, model, Types } from "mongoose";

const timeLogSchema = new Schema({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  activity: { type: String, required: true },
  category: { type: String, default: "work" }
});

const entrySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    entry_date: { type: String, required: true }, // Format: YYYY-MM-DD
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    mood: {
      type: String,
      enum: ["amazing", "happy", "okay", "tired", "sad", "angry", "anxious", "grateful", ""],
      default: "",
    },
    tags: { type: [String], default: [] },
    is_private: { type: Boolean, default: true },
    time_logs: { type: [timeLogSchema], default: [] }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Ensure a user can only have one entry per date
entrySchema.index({ user_id: 1, entry_date: 1 }, { unique: true });

export const Entry = model("Entry", entrySchema);
