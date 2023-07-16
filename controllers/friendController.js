const Friend = require("../models/friendModel");

exports.getFriends = async (req, res, next) => {
  console.log(req.params);
  Friend.find({
    $or: [{ user1: req.params.id }, { user2: req.params.id }]
  })
    .populate("user1", "user_name")
    .populate("user2", "user_name")
    .exec((err, friends) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(friends);
    });
};

exports.addFriend = async (req, res, next) => {
  const value = req.body;
  if (!value.user1 || !value.user2) {
    return next(new AppError(404, "fail", "Invalid Request"), req, res, next);
  }
  value.sendAt = new Date();
  try {
    const friend = await Friend.create(value);
    res.status(201).json({
      status: "success",
      data: {
        friend
      }
    });
  } catch (error) {
    next(error);
  }
};
