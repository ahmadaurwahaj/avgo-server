const mongoose = require("mongoose");

const avatarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    storage_url: {
      type: String,
      unique: true,
      lowercase: true
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

const Avatar = mongoose.model("Avatar", avatarSchema);
module.exports = { Avatar, schema };
