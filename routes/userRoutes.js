const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const middleware = require("../middlewares/auth");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/resetPassword/:id", authController.resetPassword);
router.post("/sendForgetEmail", authController.sendPasswordForgetEmail);
router.post("/updateForgetPass", authController.updateForgetPassword);
router.route("/").get(userController.getAllUsers);

// Protect all routes after this middleware
router.put("/block", userController.blockUser);
router.put("/unblock", userController.unBlockUser);
router.get("/block-list", userController.blockList);
router.post("/logout", authController.logout);
router.post("/emailVerify", authController.trustUserEmail);

router.use(middleware.protect);

router.put("/add-favorites", userController.addFavorites);
router.put("/remove-favorites", userController.removeFavorites);
router.put("/hasBlocked", userController.hasBlocked);
router.put("/blockedBy/:id", userController.blockedBy);
router.get("/findBlock/:id/:Id", userController.findBlock);

router
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.route("/").get(userController.getAllUsers);
// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));
router.put("/block/account", userController.blockUser);

router.put("/unblock/account", userController.unBlockUser);
router.get("/blocklist/accounts", userController.blockList);

router.delete("/deleteMe", userController.deleteMe);

router.post("/enrollUser", userController.enrollUser);
router.post("/verifyUser", userController.verifyUser);
router.post("/documentVerification", userController.documentVerification);

module.exports = router;
