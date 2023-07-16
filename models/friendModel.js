const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    user2: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
).index({ user1: 1, user2: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);
module.exports = Friend;
