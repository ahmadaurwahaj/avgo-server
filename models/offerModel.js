const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  cryptoCurrencyType: {
    type: String,
    enum: ["bitcoin", "ethereum", "USDT"],
    required: true
  },
  //buy or sale
  tradingMethod: {
    type: String,
    enum: ["buy", "sell"],
    required: true
  },
  preferredCurrency: {
    type: String
  },
  tradingType: {
    type: String,
    enum: ["fixedPrice", "marketPrice"]
  },
  tradeMin: {
    type: Number,
    required: true
  },
  tradeMax: {
    type: Number,
    required: true
  },
  offerMargin: {
    type: Number,
    required: true
  },
  offerTimeLimit: {
    type: Number,
    required: true,
    max: 30,
    min: 5
  },
  fixedAmountTrade: {
    type: Array,
    default: []
  },
  isFixedAmountTrade: {
    type: Boolean,
    default: false
  },
  offerTags: {
    type: Array,
    default: [],
    require: true
  },
  offerLabel: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  offerTerms: {
    type: String,
    required: true
  },
  tradeInstructions: {
    type: String,
    required: true
  },
  requireVerificationID: {
    type: Boolean,
    default: false
  },
  requireVerificationName: {
    type: Boolean,
    default: false
  },
  subPaymentMethodId: {
    type: mongoose.Types.ObjectId,
    ref: "subPaymentMethod"
  },
  paymentMethodId: {
    type: mongoose.Types.ObjectId,
    ref: "paymentMethod"
  },
  isGiftCard: {
    type: Boolean,
    default: false
  },
  likeCount: {
    type: Number,
    default: 0
  },
  disLikeCount: {
    type: Number,
    default: 0
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User"
    }
  ],
  disLikes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User"
    }
  ],
  isVerified: {
    type: Boolean,
    default: false
  },
  offerLocation: {
    type: String,
    default: ""
  },
  cancel: {
    type: Boolean,
    default: false
  },
  expired: {
    type: Boolean,
    default: false
  },
  tradeSpeed: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now }
});

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
