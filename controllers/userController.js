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

exports.addFavorites = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        favorites: { $ne: offer }
      },
      {
        $push: { favorites: offer }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find User Data or Already Favorited!"));
  } catch (err) {
    next(err);
  }
};

exports.removeFavorites = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        favorites: offer
      },
      {
        $pull: { favorites: offer }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find User or Not Favorited!"));
  } catch (err) {
    next(err);
  }
};
