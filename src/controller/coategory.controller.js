const { User, Category, Brand } = require('./../models/');
const { deleteImageFromCloud, uploadfileInCloud } = require('../middleware/');

const objectID = require('mongodb').ObjectId;

exports.createCategory = async (req, res) => {
  try {
    const result = await Category.findOne({
      category_name: req.body.category_name,
    });
    if (result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'this Category already exist',
      });
    }
    if (req.files.length === 1) {
      const image = await uploadfileInCloud(req);
      req.body.image = image.url;
      req.body.imageId = image.public_id;
    }
    const createCategory = await Category.create(req.body);
    return res.status(200).json({
      statusCode: 200,
      message: 'create Category successfully',
      data: createCategory,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Category id must be correct format',
      });
    }

    const result = await Category.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavalid Category id',
      });
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
    return res.status(200).json({
      statusCode: 200,
      message: 'update brand successfully',
      data: updateCategory,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.showCategoryById = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'brand id must be correct format',
      });
    }

    const result = await Category.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavalid Category id',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'find brand successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.showCategory = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const regex = new RegExp(req.query.search, 'i');
    const result = await Category.find({ $or: [{ category_name: regex }] })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no Category',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'find Category successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Category id must be correct format',
      });
    }

    const result = await Category.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no Category releted this id',
      });
    }
    await deleteImageFromCloud(result.imageId);
    return res.status(200).json({
      statusCode: 200,
      message: 'delete Category successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
