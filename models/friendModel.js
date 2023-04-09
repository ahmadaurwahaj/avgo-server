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
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

const Friend = mongoose.model("Friend", friendSchema);
module.exports = { Friend };
