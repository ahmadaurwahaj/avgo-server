const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { User } = require("../models/userModel");
const bcrypt = require("bcryptjs");

const Model = User;

exports.deleteOne = () => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOne = () => async (req, res, next) => {
  try {
    const values = { ...req.body };
    if (req.body.password) {
      values.password = await bcrypt.hash(req.body.password, 12);
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, values, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createOne = () => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = () => async (req, res, next) => {
  try {
    const doc = await Model.findById({
      _id: req.params.id,
      status: "active"
    }).lean();

    if (!doc) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        ...doc
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = () => async (req, res, next) => {
  try {
    const users = await Model.find({ status: "active" });

    res.status(200).json({
      status: "success",
      data: {
        data: users
      }
    });
  } catch (error) {
    next(error);
  }
};
