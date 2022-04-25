const { User, Product, Order, UserAddress, Review } = require('../models/');
const objectID = require('mongodb').ObjectId;
const { deleteImageFromCloud } = require('../middleware');

exports.createReview = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const findProduct = await Product.findOne({ _id: req.params.id });
    if (!findProduct) {
      return res.status(404).json({
        statusCode: 400,
        message: 'this product is not available',
      });
    }
    const findReview = await Review.findOne({ userId: req.userid });
    if (findReview) {
      return res.status(200).json({
        statusCode: 200,
        message: 'you have given review already',
      });
    }
    const review = await Review.create({
      productId: _id,
      comments: [
        {
          userId: req.userid,
          content: req.body.content,
          votes: req.body.votes,
        },
      ],
      image: req.imgarray,
    });
    return res.status(200).json({
      statusCode: 200,
      message: 'create review successfully',
      data: review,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const findReview = await Review.findOneAndDelete({ _id: req.params.id });
    if (!findReview) {
      return res.status(200).json({
        statusCode: 200,
        message: "you don't have any Review to delete",
      });
    }
    await findReview.image.map((x) => {
      console.log(x);
      deleteImageFromCloud(x.cloud_public_id);
    });

    return res.status(200).json({
      statusCode: 200,
      message: 'delete Review successfully',
      data: findReview,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.getReview = async (req, res) => {
  try {
    const findReview = await Review.findOne({ userId: req.userid });

    return res.status(200).json({
      statusCode: 200,
      message: 'find review successfully',
      data: findReview,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
