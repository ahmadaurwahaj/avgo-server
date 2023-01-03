const Notifications = require("../models/notificationsModel");
const { io } = require("../socket");

exports.addNotifUtil = async req => {
  const response = { data: undefined, error: undefined };
  try {
    response.data = await Notifications.findOneAndUpdate(
      { transaction: req.body.transaction, user: req.body.user },
      { $set: req.body },
      { upsert: true, new: true }
    ).populate({
      path: "transaction",
      populate: [{ path: "offerId" }, { path: "buyerId" }, { path: "sellerId" }]
    });
    if (response.data) io.emit("notification-recieved", response.data);
  } catch (err) {
    response.error = err;
  }
  return response;
};
exports.addNotifications = async (req, res, next) => {
  const { data, error } = await this.addNotifUtil(req);

  if (data) {
    res.status(200).json({
      status: "success",
      data
    });
  } else
    res.status(400).json({
      status: "failed",
      message: error
    });
};

exports.getNotifications = async (req, res, next) => {
  try {
    const update = await Notifications.find({
      user: req.user.id
    })
      .populate({
        path: "transaction",
        populate: [
          { path: "offerId" },
          { path: "buyerId" },
          { path: "sellerId" }
        ]
      })
      .sort({ createdAt: -1 });
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Notifications Not Found"
      });
  } catch (err) {
    next(err);
  }
};
