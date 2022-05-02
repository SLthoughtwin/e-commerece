const { User, Category, Brand } = require('./../models/');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');
const objectID = require('mongodb').ObjectId;

const {
  uploadfile,
  uploadfileInCloud,
  deleteImageFromCloud,
} = require('../middleware/');

// return next(new ApiError(400,'admin already exist'))
// return responseHandler(200,"login successfully",res,accesstoken)
exports.createBrand = async (req, res, next) => {
  try {
    const result = await Brand.findOne({ brand_name: req.body.brand_name });
    if (result) {
      return next(new ApiError(400, 'this brand already exist'));
    }
    if (req.files.length === 1) {
      const image = await uploadfileInCloud(req);
      req.body.image = image.url;
      req.body.imageId = image.public_id;
    }
    const createBrand = await Brand.create(req.body);
    return responseHandler(200, 'create brand successfully', res, createBrand);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.updateBrand = async (req, res, next) => {
  try {
    const result = await Brand.findOne({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(404, 'invalid  brand id'));
    }
    if (req.files) {
      await deleteImageFromCloud(result.imageId);
      const image = await uploadfileInCloud(req);
      req.body.image = image.url;
      req.body.imageId = image.public_id;
    }
    const updateBrand = await Brand.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );
    return responseHandler(200, 'update brand successfully', res, updateBrand);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.showBrandById = async (req, res, next) => {
  try {
    const result = await Brand.findOne({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(404, 'inavalid brand id'));
    }
    return responseHandler(200, 'find brand successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.showBrand = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const regex = new RegExp(req.query.search, 'i');
    const result = await Brand.find({ $or: [{ brand_name: regex }] })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    if (!result) {
      return responseHandler(200, 'there is no brand', res);
    }
    return responseHandler(200, 'find brand successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.deleteBrand = async (req, res, next) => {
  try {
    const result = await Brand.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(400, 'there is no brand releted this id'));
    }
    await deleteImageFromCloud(result.imageId);
    return responseHandler(200, 'delete brand successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
