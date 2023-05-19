const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const globalErrHandler = require("./controllers/errorController");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoute");

const AppError = require("./utils/appError");
const app = express();

const corsOptions = {
  origin: ["localhost:3001"],
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, PUT, POST, DELETE"
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
//Headers security
app.use(helmet());

// Use to access files with local folders
app.use(express.static("uploads"));
app.use("/uploads", express.static("uploads"));

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("debug", true);
// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chat", chatRoutes);

// handle undefined Routes
app.use("*", (req, res, next) => {
  const err = new AppError(404, "fail", "undefined route");
  next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
