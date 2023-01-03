const SecurityQuestions = require("../models/securityQuestionModel");

exports.addQuestion = async (req, res, next) => {
  console.log(req.body);
  try {
    const update = await SecurityQuestions.create(req.body);
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Error Occured!"));
  } catch (err) {
    next(err);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const update = await SecurityQuestions.find({
      user: req.user.id
    });
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Security Questions Not Found"
      });
  } catch (err) {
    next(err);
  }
};
