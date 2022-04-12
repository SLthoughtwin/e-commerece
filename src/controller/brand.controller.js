const { User, Category, Brand } = require('./../models/');

const objectID = require('mongodb').ObjectID;

const { uploadfile ,uploadfileInCloud,deleteImageFromCloud} = require('../middleware/')

exports.createBrand = async (req, res) => {
  try {
      const result = await Brand.findOne({ brand_name: req.body.brand_name });
      if (result) {
          return res.status(400).json({
              message: 'this brand already exist',
              succes: false,
            });
        }
        if(req.files.length === 1){

            const image = await uploadfileInCloud(req)
             req.body.image = image.url
             req.body.imageId = image.public_id
        }
    const createBrand = await Brand.create(req.body);
    return res.status(200).json({
      createBrand: createBrand,
      message: 'create brand successfully',
      succes: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.updateBrand = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'brand id must be correct format',
        succes: false,
      });
    }

    const result = await Brand.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        message: 'inavalid  brand id',
        succes: false,
      });
    }
    if(req.files){
       await deleteImageFromCloud(result.imageId)

       const image = await uploadfileInCloud(req)
         req.body.image = image.url
         req.body.imageId = image.public_id
   }

    const updateBrand = await Brand.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );
    return res.status(200).json({
      data: updateBrand,
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
exports.showBrandById = async (req, res) => {
    try {
      if (objectID.isValid(req.params.id) === false) {
        return res.status(400).json({
          message: 'brand id must be correct format',
          succes: false,
        });
      }
  
      const result = await Brand.findOne({ _id: req.params.id });
      if (!result) {
        return res.status(400).json({
          message: 'inavalid brand id',
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
exports.showBrand= async (req, res) => {
    try {
      const regex = new RegExp(req.query.search)
      const result = await Brand.find();
      // {$or:[{"brand_name":regex},{"description":regex}]}
      if (!result) {
        return res.status(400).json({
          message: 'there is no brand',
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
exports.deleteBrand= async (req, res) => {
    try {
       
        if (objectID.isValid(req.params.id) === false) {
            return res.status(400).json({
              message: 'brand id must be correct format',
              succes: false,
            });
          }

       const result = await Brand.findOneAndDelete({_id:req.params.id});
      if (!result) {
        return res.status(400).json({
          message: 'there is no brand releted this id',
          succes: false,
        });
      }
      await deleteImageFromCloud(result.imageId)
      return res.status(200).json({
        createBrand: result,
        message: 'delete brand successfully',
        succes: true,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        succes: false,
      });
    }
};
