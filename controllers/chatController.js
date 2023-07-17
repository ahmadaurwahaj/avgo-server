const Chat = require("../models/chatModel");

// Get chat data route
exports.getChat = async (req, res, next) => {
  console.log(req.params);
  Chat.find({ friendId: req.params.friendId })
    .populate("sender", "user_name")
    .populate("receiver", "user_name")
    .exec((err, chats) => {
      if (err) return res.status(400).send(err);
      else res.status(200).send(chats);
    });
};

exports.addChat = async (req, res, next) => {
  const value = req.body;
  if (!value.sender || !value.receiver || !value.message || !value.friendId) {
    return next(new AppError(404, "fail", "Invalid Request"), req, res, next);
  }
  value.sendAt = new Date();
  try {
    const chat = await Chat.create(value);
    res.status(201).json({
      status: "success",
      data: {
        chat
      }
    });
  } catch (error) {
    next(error);
  }
};
