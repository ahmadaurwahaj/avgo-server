const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const globalErrHandler = require("./controllers/errorController");

// const url = require('url');

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoute");
const notificationsRoutes = require("./routes/notificationsRoutes");
const AppError = require("./utils/appError");
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://p2p.invo.zone"],
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, PUT, POST, DELETE"
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
// const getOrigin = origin => {
// 	if ( !origin ) {
// 		return true;
// 	}
//
// 	const allowedOrigins = ['p2p-backend.invo.zone', 'localhost'];
// 	const {hostname} = url.parse(origin);
//
// 	for ( const allowedOrigin of allowedOrigins ) {
// 	  if ( allowedOrigin.includes(hostname) ) {
// 		  return true;
// 	  }
// 	}
//
// 	return false;
// };

// Allow Cross-Origin requests
// const corsOptions = {
// 	optionsSuccessStatus: 204 ,// For legacy browser support
// 	methods: "GET,PUT,POST,DELETE",
// 	credentials: true,
// 	preflightContinue: true,
// 	origin ( origin, callback ) {
// 		false !== getOrigin(origin)
// 			? callback(null, true)
// 			: callback(new Error('Not allowed by CORS'))
// 	},
// }

// app.use(cors({
// 	preflightContinue: true,
// }));
// Set security HTTP headers
app.use(helmet());

// Limit request from the same API
// const limiter = rateLimit({
//     max: 150,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too Many Request from this IP, please try again in an hour'
// });
// app.use('/api', limiter);

// Body parser, reading data from body into req.body
// app.use(
//   express.json({
//     limit: "15kb",
//   })
// );

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
app.use("/api/v1/notifications", notificationsRoutes);

// handle undefined Routes
app.use("*", (req, res, next) => {
  const err = new AppError(404, "fail", "undefined route");
  next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
