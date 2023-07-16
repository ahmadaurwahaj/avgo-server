const multer = require("multer");
const Chat = require("../models/chatModel");

// // Multer upload images and access in local folders
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}_${file.originalname}`);
//   },
// });

// Upload single file through multer at the same time
// const upload = multer({ storage: storage }).single("file");

// Multer upload route
// exports.multerRoute = async (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.json({ sucess: false, err });
//     }
//     return res.json({ sucess: true, url: 'res.req '});
//   });
// };

// Get chat data route
exports.getChat = async (req, res, next) => {
  console.log(req.params);
  Chat.find({
    $or: [
      { senderId: req.params.senderId },
      { receiverId: req.params.receiverId }
    ]
  }).exec((err, chats) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(chats);
  });
};

exports.addChat = async (req, res, next) => {
  const value = req.body;
  if (!value.sender || !value.receiver || !value.message) {
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
