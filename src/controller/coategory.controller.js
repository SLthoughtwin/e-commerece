const { User, Category, Brand } = require('./../models/');
const {deleteImageFromCloud,uploadfileInCloud} = require('../middleware/')

const objectID = require('mongodb').ObjectID;

exports.createCategory = async (req, res) => {
  try {
    const result = await Category.findOne({ category_name: req.body.category_name });
    if (result) {
      return res.status(400).json({
        message: 'this Category already exist',
        succes: false,
      });
    }
    if(req.files.length === 1){

        const image = await uploadfileInCloud(req)
        req.body.image = image.url
        req.body.imageId = image.public_id
    }
    const createCategory = await Category.create(req.body);
    return res.status(200).json({
      createCategory: createCategory,
      message: 'create Category successfully',
      succes: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'Category id must be correct format',
        succes: false,
      });
    }

    const result = await Category.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        message: 'inavalid Category id',
        succes: false,
      });
    }

    if(req.files){
        await deleteImageFromCloud(result.imageId)
        const image = await uploadfileInCloud(req)
        req.body.image = image.url
        req.body.imageId = image.public_id
    }

    const updateCategory = await Category.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );
    return res.status(200).json({
      data: updateCategory,
      message: 'update brand successfully',
      succes: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.showCategoryById = async (req, res) => {
    try {
      if (objectID.isValid(req.params.id) === false) {
        return res.status(400).json({
          message: 'brand id must be correct format',
          succes: false,
        });
      }
  
      const result = await Category.findOne({ _id: req.params.id });
      if (!result) {
        return res.status(400).json({
          message: 'inavalid Category id',
          succes: false,
        });
      }
    
      return res.status(200).json({
        createBrand: result,
        message: 'find brand successfully',
        succes: true,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        succes: false,
      });
    }
  };
exports.showCategory= async (req, res) => { 
    try {
      const { page = 1, limit = 5 } = req.query;
      const regex = new RegExp(req.query.search,'i')
      const result = await Category.find({$or:[{"category_name":regex}]})
       .limit(limit * 1)
       .skip((page - 1) * limit)
       .sort({ createdAt: -1 });
      if (!result) {
        return res.status(400).json({
          message: 'there is no Category',
          succes: false,
        });
      }
    
      return res.status(200).json({
        createBrand: result,
        message: 'find Category successfully',
        succes: true,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        succes: false,
      });
    }
  };
exports.deleteCategory= async (req, res) => {
    try {
       
        if (objectID.isValid(req.params.id) === false) {
            return res.status(400).json({
              message: 'Category id must be correct format',
              succes: false,
            });
          }

       const result = await Category.findOneAndDelete({_id:req.params.id});
      if (!result) {
        return res.status(400).json({
          message: 'there is no Category releted this id',
          succes: false,
        });
      }
     await deleteImageFromCloud(result.imageId)
      return res.status(200).json({
        createBrand: result,
        message: 'delete Category successfully',
        succes: true,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        succes: false,
      });
    }
  };