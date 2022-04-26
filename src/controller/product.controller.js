const { User, Product, CloudId, Brand, Category } = require('./../models/');
const objectID = require('mongodb').ObjectId;
const {
 
  deleteImageFromCloud,
  checkFilter,
  
} = require('../middleware');
const { userRole, seller, admin } = require('../config/');
const { productFields } = require('../services/');
// const { createProduct } = require('.');

exports.createProduct = async (req, res) => {
  try {
    if (objectID.isValid(req.body.categoryId) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Category id must be correct format',
      });
    }

    if (objectID.isValid(req.body.brandId) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Brand id must be correct format',
      });
    }

    const category = await Category.findOne({ _id: req.body.categoryId });
    if (!category) {
      return res.status(400).json({
        statusCode: 400,
        message: 'this category is not available',
      });
    }
    const brand = await Brand.findOne({ _id: req.body.brandId });
    if (!brand) {
      return res.status(400).json({
        statusCode: 400,
        message: 'this brand is not available',
      });
    }
    const result = await User.findOne({ _id: req.userid });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'please insert valid sellerId',
      });
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
    console.log(createproduct.id);
    const newCreateProduct = await Product.findOne({ _id: createproduct.id })
      .populate('createBy', 'fullName')
      .populate('categoryId', 'category_name')
      .populate('brandId', 'brand_name')
      .populate('image', 'image.image_url');
    return res.status(200).json({
      createproduct: newCreateProduct,
      message: 'create product successfully',
      succes: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Product id must be correct format',
      });
    }

    if (!req.body.lenght && !req.files) {
      return res.status(400).json({
        statusCode: 400,
        message: 'please add some fileds',
      });
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
      return res.status(400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
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
    return res.status(200).json({
      statusCode: 200,
      message: 'product update successfully',
      data: newResult,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.showProduct = async (req, res) => {
  try {
    if (req.user.role === seller) {
      const { page = 1, limit = 5 } = req.query;
      const filter = checkFilter(req, res);
      if (filter === false) {
        return res.status(404).json({
          statusCode: 400,
          message: 'enter valid fields',
        });
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
        return res.status(200).json({
          statusCode: 200,
          message: 'product found successfully',
          data: result,
        });
      }
    }
    if (req.user.role === userRole || req.user.role === "public" ) {
      const { page = 1, limit = 5 } = req.query;
      const filter = checkFilter(req, res);
      if (filter === false) {
        return res.status(404).json({
          statusCode: 400,
          message: 'enter valid fields',
        });
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
        // console.log(result)
        
        return res.status(200).json({
          statusCode: 200,
          message: 'product found successfully',
          data: result,
        });
      }
    }

    const { page = 1, limit = 5 } = req.query;
    const filter = checkFilter(req, res);
    delete filter.createBy;
    if (filter === false) {
      return res.status(404).json({
        statusCode: 400,
        message: 'enter valid fields',
      });
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
      return res.status(200).json({
        message: 'product found successfully',
        totalProduct: result.length,
        succes: true,
        address: result,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.showProductById = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Product id must be correct format',
      });
    }
    const user = await User.findOne({ _id: req.userid });
    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
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
      return res.status(400).json({
        statusCode: 400,
        message: 'invalid product id',
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'product found successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.deleteProcduct = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Product id must be correct format',
      });
    }

    const result = await Product.findByIdAndDelete({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
    }
    const findProductId = await CloudId.findOne({ product_id: req.params.id });
    await findProductId.image.map((x) => {
      deleteImageFromCloud(x.cloud_public_id);
    });
    const cloudid = await CloudId.findOneAndDelete({
      product_id: req.params.id,
    });
    return res.status(200).json({
      statusCode: 200,
      message: 'product delete successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
