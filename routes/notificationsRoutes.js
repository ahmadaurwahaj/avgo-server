const express = require("express");
const router = express.Router();
const notificationsRoutes = require("../controllers/notificationsController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);

router.post("/addNotification", notificationsRoutes.addNotifications);
// /api/chat/getChats
router.get("/getNotification", notificationsRoutes.getNotifications);

module.exports = router;
