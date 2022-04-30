const jwt = require('jsonwebtoken');
const { User, Category, Brand, Product } = require('./../models/');
const { admin, seller, userRole } = require('./../config/');
const notifier = require('node-notifier');
const { accessToken, bcryptPasswordMatch, fields } = require('../services/');
const objectID = require('mongodb').ObjectId;
const ApiError = require('../config/apierror');
const {responseHandler} = require('../config/')
// const {fields } = require('./../services/')
const checkId = (req) => {
  if (req.params) {
    return req.params.id;
  } else {
    return req.body.id;
  }
};

exports.adminLogin = async (req, res,next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const findAdmin = await User.findOne({ role: admin });
      if (findAdmin) {
        return next(new ApiError(400,'admin already exist'))
      }
      req.body.role = admin;
      req.body.isApproved = true
      req.body.isVerified = true
      const {email,password,} = req.body
      const createAdmin = await User.create(req.body);
      const userId = createAdmin.id;
      const accesstoken = await accessToken(userId);
      return responseHandler(200,"login successfully",res,accesstoken)
    }
    const db_pass = user.password;
    const user_pass = req.body.password;
    const match = await bcryptPasswordMatch(user_pass, db_pass);
    if (match === true && req.body.email === user.email) {
      const userId = user.id;
      const accesstoken = await accessToken(userId);
      return responseHandler(200,"login successfully",res,accesstoken)
    } else {
      return next(new ApiError(400,'invalid login details'))
    }
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};

exports.approvedAndRejectSellerByAdmin = async (req, res,next) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return next(new ApiError(400,'id must be correct format'))
    }
    const result = await User.findOne({ _id: req.body.id });
    if (!result) {
      return next(new ApiError(400,'invalid user'))
    }
    if (result.isApproved === false) {
      const admin = await User.updateOne(
        { _id: req.body.id },
        { isApproved: true },
      );
      return responseHandler(200,'approve by admin',res)
    }
    const admin = await User.updateOne(
      { _id: req.body.id },
      { isApproved: false },
    );
    return responseHandler(200,'reject by admin',res)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};

exports.getAllseller = async (req,res,next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { email = '' } = req.body;
    const allfields = fields(req);
    const result = await User.find(
      { email: { $regex: email, $options: '$i' }, role: seller },
      allfields,
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (!result.length > 0) {
      return next(new ApiError(400,'there is no seller yet'))
    }
    return responseHandler(200,"getAllseller",res,result)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};

exports.getAllUser = async (req, res,next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { email = '' } = req.body;
    const allfields = fields(req);
    const result = await User.find(
      { email: { $regex: email, $options: '$i' }, role: userRole },
      allfields,
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (!result.length > 0) {
      return next(new ApiError(400,'there is no User yet'))
    }
    return responseHandler(200,"getAllseller",res,result)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};

exports.deleteSellerByAdmin = async (req, res,next) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return next(new ApiError(400,'id must be correct format'))
    }
    const result = await User.findOneAndDelete({ _id: id });
    if (!result) {
      return next(new ApiError(400,'invalid user'))
    }
    return responseHandler(200,'seller delete successfully',res,result)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};

exports.productApprovedAndRejectByadmin = async (req, res,next) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return next(new ApiError(400,'id must be correct format'))
    }
    const result = await Product.findOne({ _id: req.body.id });
    if (!result) {
      return next(new ApiError(400,'invalid user'))
    }
    if (result.isApprovedByadmin === false) {
      const admin = await Product.updateOne(
        { _id: req.body.id },
        { isApprovedByadmin: true },
      );
      return responseHandler(200,'approve by admin',res)
    }
    const admin = await Product.updateOne(
      { _id: req.body.id },
      { isApprovedByadmin: false },
    );
    return responseHandler(200,'reject by admin',res)

  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};
