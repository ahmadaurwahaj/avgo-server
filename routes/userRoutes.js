const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const middleware = require("../middlewares/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/resetPassword/:id", authController.resetPassword);
router.post("/sendForgetEmail", authController.sendPasswordForgetEmail);
router.post("/updateForgetPass", authController.updateForgetPassword);

router.use(middleware.protect);
// Protect all routes after this middleware
router.post("/emailVerify", authController.trustUserEmail);

router
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.route("/").get(userController.getAllUsers);

router.delete("/deleteMe", userController.deleteMe);

module.exports = router;
