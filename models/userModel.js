const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String
      // required: [true, "Please fill your name"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    currency: {
      type: String,
      trim: true
    },
    language: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Please fill your password"],
      minLength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["admin", "buyer", "seller", "vendor"],
      default: "buyer"
    },
    trusted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },
    favorites: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Offer"
      }
    ],
    hasBlocked: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User"
      }
    ],
    blockedBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User"
      }
    ],
    isActive: {
      type: Boolean,
      default: false
    },
    profilePic: {
      type: String
    },
    loginTime: {
      type: Date
    },
    lastSeenTime: {
      type: Date
    },
    lastSeen: {
      type: String
    },
    activeTime: {
      type: String
    },
    changePass: {
      type: Date
    },
    enrolled: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isIdVerified: {
      type: Boolean,
      default: false
    },
    isAddressVerified: {
      type: Boolean,
      default: false
    },
    loginIp: {
      type: String,
      default: ''
    },
    loginCountry:{
      type: String,
      default: ''
    },
    loginCity:{
      type: String,
      default: ''
    },
    loginBrowser: {
      type: String,
      default: ''
    },
    updateIp:{
      type: String,
      default: ''
    },
    updateCountry: {
      type: String,
      default: ''
    },
    updateCity: {
      type: String,
      default: ''
    },
    updateBrowser:{
      type: String,
      default: ''
    },
    updateUserTime: {
      type: Date
    },
    kycIp:{
      type: String,
      default: ''
    },
    kycCountry: {
      type: String,
      default: ''
    },
    kycCity: {
      type: String,
      default: ''
    },
    kycBrowser:{
      type: String,
      default: ''
    },
    kycUserTime: {
      type: Date
    },
    reqIp:{
      type: String,
      default: ''
    },
    reqCountry: {
      type: String,
      default: ''
    },
    reqCity: {
      type: String,
      default: ''
    },
    reqBrowser:{
      type: String,
      default: ''
    },
    reqTime: {
      type: Date
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

// encrypt the password using 'bcryptjs'
// Mongoose -> Document Middleware
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
  type: Joi.string().required().valid("EMAIL", "PHONE"),
  email: Joi.string()
    .email()
    .when("type", {
      is: "EMAIL",
      then: Joi.required(),
      otherwise: Joi.string().allow("")
    }),
  phoneNumber: Joi.string().when("type", {
    is: "PHONE",
    then: Joi.required(),
    otherwise: Joi.string().allow("")
  }),
  password: Joi.string().required().min(8),
  name: Joi.string(),
  role: Joi.string()
}).options({ allowUnknown: true });

const User = mongoose.model("User", userSchema);
module.exports = { User, schema };
