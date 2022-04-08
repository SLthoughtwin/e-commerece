const { User, Category, Brand } = require('./../models/');

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

    const updateCategory = await Category.updateOne(
      { _id: req.params.id },
      req.body,
      { new: true },
    );
    return res.status(200).json({
      updateCategory: updateCategory,
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
       const result = await Category.find();
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

       const result = await Category.findOne({_id:req.params.id});
      if (!result) {
        return res.status(400).json({
          message: 'there is no Category releted this id',
          succes: false,
        });
      }
    
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