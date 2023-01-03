const mongoose = require("mongoose");

const notifications = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    transaction: {
      type: mongoose.Types.ObjectId,
      ref: "transaction",
      required: true
    }
  },
  { timestamps: true }
);

const Notifications = mongoose.model("Notifications", notifications);
module.exports = Notifications;
