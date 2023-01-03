const Offer = require("../models/offerModel");
const AppError = require("../utils/appError");
const { filterKeys } = require("../utils/offerFilters");
exports.createOffer = async (req, res, next) => {
  const inputs = req.body;
  const values = {
    user: req.user._id,
    cryptoCurrencyType: inputs.cryptoCurrencyType,
    tradingMethod: inputs.tradingMethod,
    preferredCurrency: inputs.preferredCurrency,
    tradingType: inputs.tradingType,
    tradeMin: inputs.tradeMin,
    tradeMax: inputs.tradeMax,
    offerMargin: inputs.offerMargin,
    offerTimeLimit: inputs.offerTimeLimit,
    fixedAmountTrade: inputs.fixedAmountTrade,
    offerTags: inputs.offerTags,
    offerLabel: inputs.offerLabel,
    offerTerms: inputs.offerTerms,
    tradeInstructions: inputs.tradeInstructions,
    subPaymentMethodId: inputs.subPaymentMethodId,
    paymentMethodId: inputs.paymentMethodId,
    offerLocation: inputs.offerLocation,
    isVerified: inputs.isVerified
  };
  try {
    const offer = await Offer.create({ ...values });
    if (offer) {
      res.status(200).json({
        status: "success",
        data: offer
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getOffers = async (req, res, next) => {
  let { filters, type, area } = req?.query;
  filters = JSON.parse(filters);
  const key = filterKeys(filters);
  try {
    const one = 10;
    const page = req.params.page;

    const preferredCurrency = area === "local" ? "PKR" : { $ne: "PKR" };

    const offers = await Offer.aggregate([
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentMethodId",
          foreignField: "_id",
          as: "paymentMethodId"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $match: {
          $and: [
            {
              preferredCurrency: preferredCurrency,
              tradingMethod: type,
              user: { $ne: req.user.id },
              ...(key !== undefined && { ...key })
            }
          ]
        }
      },
      {
        $sort: {
          ...(filters?.priceFilter !== undefined && filters?.priceFilter !== 0
            ? { offerMargin: filters?.priceFilter }
            : filters?.speedFilter !== undefined && filters?.speedFilter !== 0
            ? { tradeSpeed: filters?.speedFilter }
            : filters?.activeFilter === true
            ? { lastSeenTime: 1 }
            : { createdAt: -1 })
        }
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * one }, { $limit: one }]
        }
      }
    ]);

    console.log("Offers1:", offers);
    if (offers) {
      res.status(200).json({
        status: "success",
        data: {
          ...(area === "local"
            ? { offersCount: offers[0]?.metadata[0]?.total }
            : { worldWideOfferscount: offers[0]?.metadata[0]?.total }),
          ...(area === "local"
            ? { offers: offers[0]?.data }
            : { worldWideOffers: offers[0]?.data })
        }
      });
    }
  } catch (error) {
    console.log(error, req.query);
    next(error);
  }
};

exports.giftCardOffer = async (req, res, next) => {
  let option = { tradingMethod: "buy", status: true };
  if (req?.query?.paymentMethod) {
    option.paymentMethodId = req.query.paymentMethod;
  }
  console.log(req.query);
  if (req?.query?.subPaymentMethodId) {
    option.subPaymentMethodId = req.query.subPaymentMethodId;
  }
  if (req?.query?.isGiftCard) {
    option.isGiftCard = req.query.isGiftCard;
  }
  try {
    const offers = await Offer.find(option)
      .populate("user name")
      .populate("subPaymentMethodId");
    if (offers) {
      res.status(200).json({
        status: "success",
        data: offers
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.addLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        likes: { $ne: user },
        disLikes: { $ne: user }
      },
      {
        $inc: { likeCount: 1 },
        $push: { likes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.removeLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;

  if (!user || !offer) next(new Error("UserId or OfferId not provided"));

  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        likes: user
      },
      {
        $inc: { likeCount: -1 },
        $pull: { likes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Not Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.addDisLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        disLikes: { $ne: user },
        likes: { $ne: user }
      },
      {
        $inc: { disLikeCount: 1 },
        $push: { disLikes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.removedisLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;

  if (!user || !offer) next(new Error("UserId or OfferId not provided"));

  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        disLikes: user
      },
      {
        $inc: { disLikeCount: -1 },
        $pull: { disLikes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Not Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    let doc = await Offer.findById(req.params.id).populate(
      "user paymentMethodId"
    );

    if (doc === null) {
      next(new Error("Unable to Find Offer!"));
      return;
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

exports.getByPaymentId = async (req, res, next) => {
  try {
    let doc = await Offer.find({ paymentMethodId: req.params.id }).populate(
      "user paymentMethodId"
    );

    if (doc === null) {
      next(new Error("Unable to Find Offer against this payment method!"));
      return;
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

exports.updateCancel = async (req, res, next) => {
  const offer = req.body._id;
  try {
    let update = await Offer.findByIdAndUpdate(
      { _id: offer },
      {
        $set: { cancel: true }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!update) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }
    res.status(200).json({
      status: "success",
      data: update
    });
  } catch (err) {
    next(err);
  }
};

exports.updateExpired = async (req, res, next) => {
  const offer = req.body._id;
  try {
    let update = await Offer.findByIdAndUpdate(
      { _id: offer },
      {
        $set: { expired: true }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!update) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }
    res.status(200).json({
      status: "success",
      data: update
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserAllOfferBuy = async (req, res, next) => {
  try {
    let doc = await Offer.find({ tradingMethod: "buy" }).populate({
      path: "user"
    });
    doc = doc.filter(item => {
      return item.user._id == req.params.id;
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

exports.getUserAllOfferSell = async (req, res, next) => {
  try {
    let doc = await Offer.find({ tradingMethod: "sell" }).populate({
      path: "user"
    });
    doc = doc.filter(item => {
      return item.user._id == req.params.id;
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
