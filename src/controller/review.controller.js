const { User, Product, Order, UserAddress, Review } = require('../models/');
const objectID = require('mongodb').ObjectId;

exports.createReview = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const findProduct = await Product.findOne({ _id: req.params.id });
    if (!findProduct) {
      return res.status(404).json({
        message: 'this product is not available',
      });
    }
    const findReview = await Review.findOne({userId:req.userid});
    if (findReview) {
      return res.status(200).json({
        message: 'you have given review already',
      });
    }
    const review = await Review.create({
        productId: _id,
        comments: [{
            userId: req.userid,
            content: req.body.content,
            votes: req.body.votes
        }]
    });
    return res.status(200).json({
      succes: true,
      message: 'create review successfully',
      data: review,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const findReview = await Review.findOneAndDelete({ _id: req.params.id });
    if (!findReview) {
      return res.status(200).json({
        succes: false,
        message: "you don't have any order to cancel",
      });
    }
    return res.status(200).json({
      succes: true,
      message: 'Order cancel successfully',
      data: findReview,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
