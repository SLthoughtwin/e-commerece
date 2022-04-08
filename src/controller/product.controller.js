const { User, Product, CloudId, Brand, Category } = require('./../models/');
const objectID = require("mongodb").ObjectID
const {
  uploadImage,
  uploadfile,
  deleteImageFromCloud,
  checkFilter,
} = require('../middleware');
const { productFields } = require('../services/');
const { createProduct } = require('.');

exports.createProduct = async (req, res) => {
  try {
    
    if(objectID.isValid(req.body.categoryId) === false){
      return res.status(400).json({
        message: 'Category id must be correct format',
        succes: false,
      });
    }

    if(objectID.isValid(req.body.brandId) === false){
      return res.status(400).json({
        message: 'Brand id must be correct format',
        succes: false,
      });
    }

    const category = await Category.findOne({ _id: req.body.categoryId });
    if (!category) {
      return res.status(400).json({
        message: 'this category is not available',
        succes: false,
      });
    }
    const brand = await Brand.findOne({ _id: req.body.brandId });
    if (!brand) {
      return res.status(400).json({
        message: 'this brand is not available',
        succes: false,
      });
    }
    const result = await User.findOne({ _id: req.userid });
    if (!result) {
      return res.status(400).json({
        message: 'please insert valid sellerId',
        succes: false,
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
   const newCreateProduct = await Product.findOne({_id:createproduct.id})
   .populate("createBy","fullName")
   .populate("categoryId","category_name")
   .populate("brandId","brand_name")
   .populate("image","image.image_url")
    return res.status(200).json({
      createproduct: newCreateProduct,
      message: 'create product successfully',
      succes: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {

    if(objectID.isValid(req.params.id) === false){
      return res.status(400).json({
        message: 'Product id must be correct format',
        succes: false,
      });
    }

    if (!req.body.lenght && !req.files) {
      return res.status(400).json({
        message: 'please add some fileds',
        succes: false,
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
        message: 'inavlid id',
        succes: false,
      });
    }
    const findProductId = await CloudId.findOne({ product_id: result.id});
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
    const newResult = await Product.findOne({_id: result.id})
    .populate("createBy","fullName")
    .populate("categoryId","category_name")
    .populate("brandId","brand_name")
    .populate("image","image.image_url")
    return res.status(200).json({
      message: 'product update successfully',
      succes: true,
      updateadd: newResult,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.showProduct = async (req, res) => {
  try {
    // console.log('==================>');
    const user = await User.findOne({ _id: req.userid });
    if (!user) {
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
      });
    }

    const { page = 1, limit = 5 } = req.query;
    const filter = checkFilter(req, res);
    // console.log('===========>',filter)
    if (filter === false) {
      return res.status(404).json({
        message: 'enter valid fields',
      });
      }else{
        const allfields = productFields(req);
        const result = await Product.find(filter, allfields)
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
      message: error.message,
      succes: false,
    });
  }
};

exports.showProductById = async (req, res) => {
  try {

    if(objectID.isValid(req.params.id) === false){
      return res.status(400).json({
        message: 'Product id must be correct format',
        succes: false,
      });
    }
    const user = await User.findOne({ _id: req.userid });
    if (!user) {
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
      });
    }
    const { page = 1, limit = 5 } = req.query;
    const allfields = productFields(req);
    const result = await Product.findOne({_id: req.params.id}, allfields)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('categoryId', 'category_name')
      .populate('brandId', 'brand_name')
      .populate('createBy', 'fullName')
      .populate('image', 'image.image_url');
    if(!result){
      return res.status(400).json({
        message: 'invalid product id',
        succes: false,
      });
    }
    return res.status(200).json({
      message: 'product found successfully',
      succes: true,
      address: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.deleteProcduct = async (req, res) => {
  try {
    
    if(objectID.isValid(req.params.id) === false){
      return res.status(400).json({
        message: 'Product id must be correct format',
        succes: false,
      });
    }

    const result = await Product.findByIdAndDelete({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
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
      message: 'product delete successfully',
      succes: true,
      address: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Id lenght must be 24 character/invalid id format',
      succes: false,
    });
  }
};
