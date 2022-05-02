const { UserAddress, User } = require('../models/');
const lodash = require('lodash');
const axios = require('axios').default;
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');
const objectID = require('mongodb').ObjectId;

exports.createAddress = async (req, res, next) => {
  try {
    const result = await User.findOne({ phone: req.body.phone });
    if (!result) {
      return next(new ApiError(400, 'please enter register number'));
    }
    const findUser = await UserAddress.findOne({ phone: req.body.phone });
    if (!findUser) {
      req.body.userId = result.id;
      req.body.isDefault = true;
      const create = await UserAddress.create(req.body);
      return responseHandler(200, 'address create successfully', res, create);
    }
    req.body.userid = result.id;
    const create = await UserAddress.create(req.body);
    return responseHandler(200, 'address create successfully', res, create);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return next(new ApiError(400, 'id must be correct format'));
    }
    const id = req.body.id;
    const result = await UserAddress.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!result) {
      return next(new ApiError(400, 'invalid id'));
    }
    return responseHandler(200, 'address update successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.showAddress = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userid });
    if (!user) {
      return next(new ApiError(400, 'invalid id'));
    }
    const result = await UserAddress.find({ userId: req.userid });
    return responseHandler(200, 'address found successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return next(new ApiError(400, 'id must be correct format'));
    }
    let result = await UserAddress.findByIdAndDelete({ _id: req.body.id });
    if (!result) {
      return next(new ApiError(404, 'invalid id'));
    }
    if (result.isDefault === true) {
      const findUser = await UserAddress.findOneAndUpdate(
        { phone: result.phone },
        { isDefault: true },
      );
    }
    return responseHandler(200, 'address delete successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.axiosTest = async (req, res) => {
  await axios
    .get('https://countriesnow.space/api/v0.1/countries/states')
    .then((response) => {
      (200).json({ message: response.data });
    })
    .catch((error) => {
      res.send('error');
    });
};

// return next(new ApiError(400,'admin already exist'))
// return responseHandler(200,"login successfully",res,accesstoken)
