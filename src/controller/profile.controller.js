const { SellerProfile, User } = require('../models/');
const objectID = require('mongodb').ObjectId;

exports.createProfile = async (req, res) => {
  try {
    if (objectID.isValid(req.body.sellerId) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const result = await User.findOne({ _id: req.body.sellerId });
    if (!result) {
      return res.status(400).json({
        message: 'please insert valid sellerId',
        succes: false,
      });
    }
    const findProfile = await SellerProfile.findOne({
      sellerId: req.body.sellerId,
    });
    if (findProfile) {
      updateProfile(req, res);
    } else {
      const createProfile = await SellerProfile.create(req.body);
      return res.status(200).json({
        createProfile: createProfile,
        message: 'create profile successfully',
        succes: true,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

updateProfile = async (req, res) => {
  try {
    if (objectID.isValid(req.body.sellerId) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
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
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
      });
    }
    return res.status(200).json({
      message: 'profile update successfully',
      succes: true,
      updateadd: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

// exports.showProfile = async (req, res) => {
//   try {
//     const user = await SellerProfile.findOne({ sellerId: req.body.sellerId});
//     if (!user) {
//       return res.status(400).json({
//         message: 'inavlid id',
//         succes: false,
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
//       succes: false,
//     });
//   }
// };
