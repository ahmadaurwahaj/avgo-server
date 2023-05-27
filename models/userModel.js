const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String
      // required: [true, "Please fill your name"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true
    },

    bio: {
      type: String,
      trim: true,
      default: ""
    },
    password: {
      type: String,
      required: [true, "Please fill your password"],
      minLength: 6,
      select: false
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    avatar_id: {
      type: mongoose.Types.ObjectId,
      ref: "Avatar",
      required: false
    },

    lastSeenTime: {
      type: Date
    },

    signupCompleted: {
      type: Boolean,
      default: false
    },
    age: {
      type: String,
      required: false
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male"
    },
    country: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

userSchema.pre("save", async function (next) {
  // check the password if it is modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
userSchema.methods.correctPassword = async function (
  typedPassword,
  originalPassword
) {
  return await bcrypt.compare(typedPassword, originalPassword);
};
//user's schema validation
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  bio: Joi.string().max(100),
  user_name: Joi.string()
}).options({ allowUnknown: true });

const User = mongoose.model("User", userSchema);
module.exports = { User, schema };
