const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const transport = require("../utils/mail");
const { User, schema } = require("../models/userModel");
const AppError = require("../utils/appError");
const { getOrSetCache } = require("../utils/redisConfig");

const createToken = (id, secretKey) => {
  return jwt.sign(
    {
      id
    },
    secretKey,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(
        new AppError(404, "fail", "Please provide email or password"),
        req,
        res,
        next
      );
    }

    // 2) check if user exist and password is correct
    let user = await User.findOne({
      email
    }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError(401, "fail", "Email or Password is wrong"),
        req,
        res,
        next
      );
    }
    // await User.findByIdAndUpdate(user._id, { isActive: true, loginTime: new Date() });

    user = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { isActive: true, loginTime: new Date() }
      },
      {
        new: true,
        runValidators: true
      }
    );
    const token = createToken(user.id, process.env.JWT_SECRET);

    // Remove the password from the output
    user.password = undefined;
    await getOrSetCache("userInfo", user);
    res.status(200).json({
      status: "success",
      token,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    console.log(req.body);
    const inputs = req.body;
    const { error, value } = schema.validate({
      ...inputs,
      name: createUniqueUserName()
    });
    if (error) {
      return res.status(201).json(error);
    }
    const user = await User.create(value);
    const token = createToken(user.id, process.env.JWT_SECRET);
    user.password = undefined;
    ////////////////////////
    // const message = {
    //   from: process.env.MAIL_AUTH_USER,
    //   to: user.email,
    //   subject: "P2P USER - Request Access",
    //   // text: `Doctor ${doctorUser.data.first_name} ${doctorUser.data.last_name} requested for access.`,
    //   html: `P2P ${user.name} requested for access. <br><br>
    // <a href="${process.env.FRONTEND_APP_PATH}/grant-access/${user._id}/accepted">Accept</a> &nbsp;&nbsp;&nbsp;&nbsp; <a href="${process.env.FRONTEND_APP_PATH}/grant-access/${user._id}/rejected">Reject</a>`
    // };

    // const data = await transport.sendMail(message);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user
      }
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.trustUserEmail = async (req, res, next) => {
  console.log(req.body._id);
  try {
    let doc = await User.findByIdAndUpdate(
      req.body._id,
      { $set: { isEmailVerified: true } },
      { new: true }
    );
    console.log(doc);
    return res.status(200).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (err) {
    next(err);
  }
};
exports.logout = async (req, res, next) => {
  try {
    let doc = await User.findByIdAndUpdate(
      req.body._id,
      {
        $set: { isActive: false, lastSeenTime: new Date() }
      },
      {
        new: true,
        runValidators: true
      }
    );
    const time = moment(doc.lastSeenTime).fromNow();
    const loggedInTime = doc.loginTime;
    const loggedOutTime = doc.lastSeenTime;
    const d = Math.trunc((loggedOutTime - loggedInTime) / 1000);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);

    var hDisplay = h > 0 && h < 24 ? h + (h == 1 ? " hour" : " hours") : "";
    var mDisplay = m > 0 && h < 1 ? m + (m == 1 ? " min" : " mins") : "";
    doc = await User.findByIdAndUpdate(
      doc._id,
      {
        $set: { activeTime: hDisplay + mDisplay, lastSeen: time }
      },
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (err) {
    next(err);
  }
};
exports.sendPasswordForgetEmail = async (req, res, next) => {
  try {
    let { email } = req.body;
    const user = await User.findOne({
      email
    });
    if (!user)
      return res.status(404).json({
        status: "error",
        message: "User does not exist!"
      });
    const token = createToken(user._id, process.env.RESET_JWT_KEY);
    const message = {
      from: process.env.MAIL_AUTH_USER,
      to: user.email,
      subject: "P2P USER - Password Reset",
      // text: `Doctor ${doctorUser.data.first_name} ${doctorUser.data.last_name} requested for access.`,
      html: `P2P ${user.name} requested for password reset. <br><br>
    <a href="${process.env.FRONTEND_APP_PATH}/reset-password/${token}/accepted">Reset Password</a> &nbsp;&nbsp;&nbsp;&nbsp; `
    };

    const data = await transport.sendMail(message);
    return res.status(200).json({
      status: "success",
      message: "Email Sent with reset instructions!"
    });
  } catch (error) {
    next(error);
  }
};
exports.updateForgetPassword = async (req, res, next) => {
  let { reqIp, reqCity, reqCountry, reqBrowser, reqTime } = req.body;
  let { password, token } = req.body;
  try {
    const decode = await promisify(jwt.verify)(
      token,
      process.env.RESET_JWT_KEY
    );
    password = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(
      { _id: decode.id },
      {
        $set: {
          password,
          changePass: new Date(),
          reqIp,
          reqCity,
          reqCountry,
          reqBrowser,
          reqTime
        }
      },
      { new: true }
    );
    if (user)
      return res.status(200).json({
        status: "success",
        message: "Password Reset"
      });
    else
      return res.status(200).json({
        status: "error",
        message: "User not Found!"
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Error Occured"
    });
  }
};

exports.updateUserData = async (req, res, next) => {
  try {
    console.log(req.params);
    if (!req.params.id) next(new Error("User ID not found!"));
    const doc = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { ...req.body }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!doc) {
      res.send("error");
    }

    res.status(201).json({
      status: "success",
      message: "Password changed successfully",
      data: {
        doc
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    let { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({
      email
    }).select("+password");
    const oldPassword = user.password;
    var passwordIsValid = bcrypt.compareSync(currentPassword, oldPassword);
    if (!passwordIsValid) {
      return res.status(409).json({
        status: "error",
        message: "Current password in not correct",
        data: {
          user
        }
      });
    }
    const password = await bcrypt.hash(newPassword, 12);
    const doc = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { password, changePass: new Date() }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!doc) {
      res.send("error");
    }

    res.status(201).json({
      status: "success",
      message: "Password changed successfully",
      data: {
        doc
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) check if the token is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError(
          401,
          "fail",
          "You are not logged in! Please login in to continue"
        ),
        req,
        res,
        next
      );
    }

    // 2) Verify token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if the user is exist (not deleted)
    const user = await User.findById(decode.id);
    if (!user) {
      return next(
        new AppError(401, "fail", "This user is no longer exist"),
        req,
        res,
        next
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("#####roles", req?.user?.role, roles);
      return next(
        new AppError(403, "fail", "You are not allowed to do this action"),
        req,
        res,
        next
      );
    }
    next();
  };
};

function createUniqueUserName() {
  return "_" + Math.random().toString(36).substr(2, 9);
}
