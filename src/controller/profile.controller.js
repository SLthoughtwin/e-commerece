const { SellerProfile, User } = require('../models/');
const objectID = require('mongodb').ObjectId;
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');

exports.createProfile = async (req, res, next) => {
  try {
    if (objectID.isValid(req.body.sellerId) === false) {
      return next(new ApiError(400, 'id must be correct format'));
    }
    const result = await User.findOne({ _id: req.body.sellerId });
    if (!result) {
      return next(new ApiError(404, 'please insert valid sellerId'));
    }
    const findProfile = await SellerProfile.findOne({
      sellerId: req.body.sellerId,
    });
    if (findProfile) {
      updateProfile(req, res);
    } else {
      const createProfile = await SellerProfile.create(req.body);
      return responseHandler(
        201,
        'create profile successfull',
        res,
        createProfile,
      );
    }
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

updateProfile = async (req, res, next) => {
  try {
    if (objectID.isValid(req.body.sellerId) === false) {
      return next(new ApiError(400, 'id must be correct format'));
    }
    const id = req.body.sellerId;
    const result = await SellerProfile.findOneAndUpdate(
      { sellerId: id },
      req.body,
      {
        new: true,
      },
    );
    if (!result) {
      return next(new ApiError(404, 'inavlid id'));
    }
    return responseHandler(200, 'profile update successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

// exports.showProfile = async (req, res) => {
//   try {
//     const user = await SellerProfile.findOne({ sellerId: req.body.sellerId});
//     if (!user) {
//       return res.status(400).json({
//         message: 'inavlid id',
//         ,
//       });
//     }
//     return res.status(200).json({
//       message: 'profile found successfully',
//       succes: true,
//       seller: user,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       message: 'Id lenght must be 24 character/invalid id format',
//       ,
//     });
//   }
// };
