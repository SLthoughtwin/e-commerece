const { User, Product, CloudId, Brand, Category } = require('./../models/');
const objectID = require('mongodb').ObjectId;
const { deleteImageFromCloud, checkFilter } = require('../middleware');
const { userRole, seller } = require('../config/');
const { productFields } = require('../services/');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');

exports.createProduct = async (req, res, next) => {
  try {
    if (objectID.isValid(req.body.categoryId) === false) {
      return next(new ApiError(400, 'id must be correct format'));
    }
    if (objectID.isValid(req.body.brandId) === false) {
      return next(new ApiError(400, 'brand id must be correct format'));
    }
    const category = await Category.findOne({ _id: req.body.categoryId });
    if (!category) {
      return next(new ApiError(404, 'this category is not available'));
    }
    const brand = await Brand.findOne({ _id: req.body.brandId });
    if (!brand) {
      return next(new ApiError(404, 'this brand is not available'));
    }
    req.body.createBy = req.userid;
    const cloud_public_id = req.cloudId;
    const image_url = req.imageurl;
    const createproduct = await Product.create(req.body);
    const product_id = createproduct.id;
    const data = { product_id, image: req.imgarray };
    const result_cloud = await CloudId.create(data);
    createproduct.image = result_cloud.id;
    await createproduct.save();
    const newCreateProduct = await Product.findOne({ _id: createproduct.id })
      .populate('createBy', 'fullName')
      .populate('categoryId', 'category_name')
      .populate('brandId', 'brand_name')
      .populate('image', 'image.image_url');
    return responseHandler(
      201,
      'create product successfully',
      res,
      newCreateProduct,
    );
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    if (!req.body.length && !req.files) {
      return next(new ApiError(400, 'please add some fileds'));
    }
    req.body.image = req.imageurl;
    const result = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      },
    );
    if (!result) {
      return next(new ApiError(404, 'invalid id'));
    }
    const findProductId = await CloudId.findOne({ product_id: result.id });
    if (req.files) {
      await findProductId.image.map((x) => {
        deleteImageFromCloud(x.cloud_public_id);
      });
      const product_id = result.id;
      const data = { product_id, image: req.imgarray };
      const cloudUpdate = await CloudId.updateOne(
        { product_id: product_id },
        data,
      );
    }
    const newResult = await Product.findOne({ _id: result.id })
      .populate('createBy', 'fullName')
      .populate('categoryId', 'category_name')
      .populate('brandId', 'brand_name')
      .populate('image', 'image.image_url');
    return responseHandler(200, 'product update successfully', res, newResult);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.showProduct = async (req, res, next) => {
  try {
    if (req.user.role === seller) {
      const { page = 1, limit = 5 } = req.query;
      const filter = checkFilter(req, res);
      if (filter === false) {
        return next(new ApiError(400, 'enter valid fields'));
      } else {
        const allfields = productFields(req);
        const regex = new RegExp(req.query.search, 'i');
        const searchObj = {
          $or: [{ title: regex }, { description: regex }, { price: regex }],
        };
        const result = await Product.find({ userId: req.userid })
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({ createdAt: -1 })
          .populate('categoryId', 'category_name')
          .populate('brandId', 'brand_name')
          .populate('createBy', 'fullName')
          .populate('image', 'image.image_url');
        return responseHandler(200, 'product found successfully', res, result);
      }
    }
    if (req.user.role === userRole || req.user.role === 'public') {
      const { page = 1, limit = 5 } = req.query;
      const filter = checkFilter(req, res);
      if (filter === false) {
        return next(new ApiError(400, 'enter valid fields'));
      } else {
        const allfields = productFields(req);
        const regex = new RegExp(req.query.search, 'i');
        const searchObj = {
          $or: [{ title: regex }, { description: regex }, { price: regex }],
        };
        const result = await Product.find({ isApprovedByadmin: true })
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({ createdAt: -1 })
          .populate('categoryId', 'category_name')
          .populate('brandId', 'brand_name')
          .populate('createBy', 'fullName')
          .populate('image', 'image.image_url');
        return responseHandler(200, 'product found successfully', res, result);
      }
    }
    const { page = 1, limit = 5 } = req.query;
    const filter = checkFilter(req, res);
    delete filter.createBy;
    if (filter === false) {
      return next(new ApiError(400, 'enter valid fields'));
    } else {
      const allfields = productFields(req);
      const regex = new RegExp(req.query.search, 'i');
      const searchObj = {
        $or: [{ title: regex }, { description: regex }, { price: regex }],
      };
      const result = await Product.find(
        Object.assign(filter, searchObj),
        allfields,
      )
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .populate('categoryId', 'category_name')
        .populate('brandId', 'brand_name')
        .populate('createBy', 'fullName')
        .populate('image', 'image.image_url');
      return responseHandler(200, 'product found successfully', res, result);
    }
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.showProductById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userid });
    if (!user) {
      return next(new ApiError(404, 'inavlid id'));
    }
    const { page = 1, limit = 5 } = req.query;
    const allfields = productFields(req);
    const result = await Product.findOne(
      { _id: req.params.id, isApprovedByadmin: true },
      allfields,
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('categoryId', 'category_name')
      .populate('brandId', 'brand_name')
      .populate('createBy', 'fullName')
      .populate('image', 'image.image_url');
    if (!result) {
      return next(new ApiError(404, 'invalid product id'));
    }
    return responseHandler(200, 'product found successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.deleteProcduct = async (req, res, next) => {
  try {
    const result = await Product.findByIdAndDelete({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(404, 'inavlid id'));
    }
    const findProductId = await CloudId.findOne({ product_id: req.params.id });
    await findProductId.image.map((x) => {
      deleteImageFromCloud(x.cloud_public_id);
    });
    const cloudid = await CloudId.findOneAndDelete({
      product_id: req.params.id,
    });
    return responseHandler(200, 'product delete successfully', res, result);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
