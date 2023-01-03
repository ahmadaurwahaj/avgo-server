const mongoose = require("mongoose");
const { trustUserEmail } = require("../controllers/authController");

const securityQuestions = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    questions: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true }
        }
      ],
      required: true
    }
  },
  { timestamps: true }
);

const SecurityQuestions = mongoose.model(
  "SecurityQuestions",
  securityQuestions
);
module.exports = SecurityQuestions;
