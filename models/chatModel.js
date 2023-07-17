const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    friendId: {
      type: mongoose.Types.ObjectId,
      ref: "Friend",
      required: true
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true
    },
    // file: {
    //   type: String
    // },
    send_at: {
      type: Date
    },
    seen_at: {
      type: Date
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
