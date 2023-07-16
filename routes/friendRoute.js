const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");

// /api/chat/getChats
router.post("/addFriend", friendController.addFriend);
router.get("/getFriends/:id", friendController.getFriends);

module.exports = router;
