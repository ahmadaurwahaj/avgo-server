const express = require("express");
const router = express.Router();
const securityQuestionsRoutes = require("../controllers/securityQuestionController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);

router.post("/addQuestion", securityQuestionsRoutes.addQuestion);
// /api/chat/getChats
router.get("/getQuestion", securityQuestionsRoutes.getQuestion);

module.exports = router;
