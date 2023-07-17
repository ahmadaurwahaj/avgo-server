const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// /api/chat/getChats
router.post("/addChat", chatController.addChat);
router.get("/getChats/:friendId", chatController.getChat);

module.exports = router;
