const { User } = require("../models/userModel");
const base = require("./baseController");
const { connection } = require("../services/kycServices");
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      active: false
    });

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = base.getAll();
exports.getUser = base.getOne();

// Don't update password on this
exports.updateUser = base.updateOne();
exports.deleteUser = base.deleteOne();
exports.blockUser = base.blockUser();
exports.blockList = base.blockList();
exports.unBlockUser = base.unBlockUser();

exports.addFavorites = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        favorites: { $ne: offer }
      },
      {
        $push: { favorites: offer }
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
    } else next(new Error("Unable to Find User Data or Already Favorited!"));
  } catch (err) {
    next(err);
  }
};

exports.removeFavorites = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        favorites: offer
      },
      {
        $pull: { favorites: offer }
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
    } else next(new Error("Unable to Find User or Not Favorited!"));
  } catch (err) {
    next(err);
  }
};
exports.enrollUser = async (req, res, next) => {
  //required parameters { req.body.base64Image, req.user.id, req.body.name,  first_name: 'KUKU',
  // last_name: 'KUKU',
  // country: 'KE',
  // id_type: 'NATIONAL_ID',
  // id_number: '00000000',
  // dob: "2002-12-31", // yyyy-mm-dd
  // entered: "true" // must be a string }
  let partner_params = {
    job_id: Date.now().toString(),
    user_id: req?.user?.id,
    job_type: 4
  };
  let image_details = [
    {
      image_type_id: 2,
      image: req.body.base64Image
    }
  ];
  const [first_name, last_name] = req?.body?.user_name?.split(" ");
  let id_info = {
    first_name: first_name,
    last_name: last_name,
    country: "KE",
    id_type: "NATIONAL_ID",
    id_number: "00000000",
    dob: req?.body?.user_dob, // yyyy-mm-dd
    entered: "true" // must be a string
  };

  let options = {
    return_job_status: true,
    return_history: true,
    return_image_links: true,
    signature: true
  };
  let enrolled = true;
  const go = async () => {
    try {
      response = await connection.submit_job(
        partner_params,
        image_details,
        id_info,
        options
      );

      response.result.ResultCode !== "0840" && (enrolled = false);

      console.log("here: ", enrolled);

      res.send(response);
    } catch (error) {
      error.message.slice(0, 4) !== "2209" && (enrolled = false);
      res.status(404).send({ error: error.message });
    }
    const doc = await User.findByIdAndUpdate(
      req.user.id,
      { enrolled },
      {
        new: true
      }
    );
  };
  go();
};

exports.verifyUser = async (req, res, next) => {
  //required parameters { req.body.base64Image, req.user.id }
  let partner_params = {
    job_id: Date.now().toString(),
    user_id: req.user.id,
    job_type: 2
  };
  let image_details = [
    {
      image_type_id: 2,
      image: req.body.base64Image
    }
  ];

  let options = {
    return_job_status: true,
    return_history: true,
    return_image_links: true,
    signature: true
  };
  let verified = true;
  const go = async () => {
    try {
      response = await connection.submit_job(
        partner_params,
        image_details,
        {},
        options
      );
      response.result.ResultCode !== "0820" && (verified = false);

      res.send(response);
      // res.write(JSON.stringify(response));
    } catch (error) {
      verified = false;
      res.status(404).send({ error: error.message });
      // res.end();
    }

    console.log("verified: ", verified);
    const doc = await User.findByIdAndUpdate(
      req.user.id,
      { verified },
      {
        new: true
      }
    );
  };
  go();
};
exports.documentVerification = async (req, res, next) => {
  //required parameters { selfieImage, frontIDImage, backIdImage, country, id_type, id_number, firstName, lastName }

  let partner_params = {
    job_id: Date.now().toString(),
    user_id: req.user.id,
    job_type: 6
  };
  let image_details = [
    {
      image_type_id: 2,
      image: req.body.selfieImage // selfie of user
    },
    {
      image_type_id: 3,
      image: req.body.frontIDImage // front of ID Document
    },
    {
      image_type_id: 7,
      image: req.body.backIdImage // back of ID Document
    }
  ];

  let id_info = {
    country: req.body.country, //'<2-letter country code>', // The country where ID document was issued
    id_type: req.body.id_type // ['DRIVERS_LICENSE', 'VOTER_ID', 'PASSPORT', 'NATIONAL_ID', The ID document type,
  };

  let options = {
    return_job_status: true,
    return_history: true,
    return_image_links: true,
    signature: true
  };
  let verified = true;
  const go = async () => {
    console.log(partner_params);
    try {
      response = await connection.submit_job(
        partner_params,
        image_details,
        id_info,
        options
      );
      response?.result?.ResultCode !== "0810" && (verified = false);

      res.send(response);
      // res.write(JSON.stringify(response));
    } catch (error) {
      verified = false;
      res.status(404).send({ error: error.message });
    }

    if (verified) {
      const data = await User.findByIdAndUpdate(
        req.user.id,
        { verified },
        {
          new: true
        }
      );
      console.log(data);
    }
  };
  go();
};

exports.hasBlocked = async (req, res, next) => {
  const blockedByUserId = req.user._id;
  const blockedUserId = req.body._id;
  if (!blockedByUserId || !blockedUserId) next(new Error("UserId or Blocked User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: blockedByUserId,
        hasBlocked: { $ne: blockedUserId }
      },
      {
        $push: { hasBlocked: blockedUserId }
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
    } else next(new Error("Unable to Blocked User or Already Blocked!"));
  } catch (err) {
    next(err);
  }
};

exports.blockedBy = async (req, res, next) => {
  const user = req.params.id;
  const blockedByUserId = req.body._id;
  if (!user || !blockedByUserId) next(new Error("UserId or Blocked By User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        blockedBy: { $ne: blockedByUserId }
      },
      {
        $push: { blockedBy: blockedByUserId }
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
    } else next(new Error("Unable to find Blocked By Users"));
  } catch (err) {
    next(err);
  }
};

exports.findBlock = async (req, res, next) => {
  const user = req.params.id;
  const blockedUserId = req.params.Id;
  if (!user || !blockedUserId) next(new Error("UserId or Blocked By User Id not provided"));
  try {
    const doc = await User.find(
      {
        _id: user,
        hasBlocked: blockedUserId
      }
    );
    if (doc) {
      res.status(200).json({
        status: "success",
        data: doc
      });
    } else next(new Error("Unable to find Blocked By Users"));
  } catch (err) {
    next(err);
  }
};
