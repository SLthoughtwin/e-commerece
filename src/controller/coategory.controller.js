const { Category } = require('./../models/');
const { deleteImageFromCloud, uploadfileInCloud } = require('../middleware/');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');

exports.createCategory = async (req, res, next) => {
  try {
    const result = await Category.findOne({
      category_name: req.body.category_name,
    });
    if (result) {
      return responseHandler(200, 'this Category already exist', res);
    }
    if (req.files.length === 1) {
      const image = await uploadfileInCloud(req);
      req.body.image = image.url;
      req.body.imageId = image.public_id;
    }
    const createCategory = await Category.create(req.body);
    return responseHandler(
      200,
      'create Category successfully',
      res,
      createCategory,
    );
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.updateCategory = async (req, res, next) => {
  try {
    const result = await Category.findOne({ _id: req.params.id });
    if (!result) {
      return responseHandler(200, 'inavalid Category id', res);
    }

    if (req.files) {
      await deleteImageFromCloud(result.imageId);
      const image = await uploadfileInCloud(req);
      req.body.image = image.url;
      req.body.imageId = image.public_id;
    }

    const updateCategory = await Category.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );
    return responseHandler(
      200,
      'update brand successfully',
      res,
      updateCategory,
    );
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.showCategoryById = async (req, res, next) => {
  try {
    const result = await Category.findOne({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(404, 'inavalid Category id'));
    }
    return responseHandler(200, 'find brand successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.showCategory = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const regex = new RegExp(req.query.search, 'i');
    const result = await Category.find({ $or: [{ category_name: regex }] })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    if (!result) {
      return next(new ApiError(404, 'athere is no Category'));
    }
    return responseHandler(200, 'find Category successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.deleteCategory = async (req, res, next) => {
  try {
    const result = await Category.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(404, 'there is no Category releted this id'));
    }
    await deleteImageFromCloud(result.imageId);
    return responseHandler(200, 'delete Category successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
