const { User } = require("../models/userModel");
const base = require("./baseController");

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      active: false
    });

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = base.getAll();
exports.getUser = base.getOne();

// Don't update password on this
exports.updateUser = base.updateOne();
exports.deleteUser = base.deleteOne();
