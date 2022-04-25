const { User, Category, Brand } = require('./../models/');

const objectID = require('mongodb').ObjectId;

const {
  uploadfile,
  uploadfileInCloud,
  deleteImageFromCloud,
} = require('../middleware/');

exports.createBrand = async (req, res) => {
  try {
    const result = await Brand.findOne({ brand_name: req.body.brand_name });
    if (result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'this brand already exist',
      });
    }
    if (req.files.length === 1) {
      const image = await uploadfileInCloud(req);
      req.body.image = image.url;
      req.body.imageId = image.public_id;
    }
    const createBrand = await Brand.create(req.body);
    return res.status(200).json({
      statusCode: 200,
      message: 'create brand successfully',
      data: createBrand,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.updateBrand = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'brand id must be correct format',
      });
    }

    const result = await Brand.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavalid  brand id',
      });
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
    return res.status(200).json({
      statusCode: 400,
      message: 'update brand successfully',
      data: updateBrand,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.showBrandById = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'brand id must be correct format',
      });
    }

    const result = await Brand.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavalid brand id',
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
exports.showBrand = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const regex = new RegExp(req.query.search, 'i');
    const result = await Brand.find({ $or: [{ brand_name: regex }] })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    // {$or:[{"brand_name":regex},{"description":regex}]}
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no brand',
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
exports.deleteBrand = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'brand id must be correct format',
      });
    }

    const result = await Brand.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no brand releted this id',
      });
    }
    await deleteImageFromCloud(result.imageId);
    return res.status(200).json({
      statusCode: 200,
      message: 'delete brand successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
