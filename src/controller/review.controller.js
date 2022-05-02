const { Product, Order, Review } = require('../models/');
const { deleteImageFromCloud, uploadFileToCloud } = require('../middleware');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');

exports.createReview = async (req, res, next) => {
  try {
    const { comments, rating, productId: _id } = req.body;
    const findOrder = await Order.findOne({
      _userId: req.userid,
      'protucts.productId': _id,
      status: 'delivered',
    });
    if (!findOrder) {
      return next(new ApiError(400, 'first buy a product then comment'));
    }
    const findProduct = await Product.findOne({ _id }).populate(
      'review',
      'comments.rating',
    );
    if (!findProduct) {
      return next(new ApiError(404, 'this product is not available'));
    }
    const findReview = await Review.findOne({ userId: req.userid });
    if (findReview) {
      return next(new ApiError(400, 'you have already given review'));
    }
    const imageArray = await uploadFileToCloud(req, 'review');
    const review = await Review.create({
      productId: _id,
      comments: [
        {
          userId: req.userid,
          content: comments,
          rating,
        },
      ],
    });
    let totalReview = 0;
    findProduct.review.map((reviewRating) => {
      reviewRating.comments.find((rate) => (totalReview += rate.rating));
    });
    const reviewRating =
      (totalReview + review.comments[0].rating) /
      (findProduct.review.length + 1);
    findProduct.review.push(review.id);
    findProduct.averageRating = reviewRating;
    await findProduct.save();
    if (imageArray.length > 0) {
      (review.image = imageArray), await review.save();
    }
    return responseHandler(200, 'create review successfully', res, review);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.deleteReview = async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const findReview = await Review.findOneAndDelete({ _id });
    if (!findReview) {
      return next(new ApiError(400, `you don't have any Review to delete`));
    }
    await findReview.image.map((x) => {
      deleteImageFromCloud(x.cloud_public_id);
    });
    return responseHandler(200, 'delete Review successfully', res, findReview);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.editReview = async (req, res, next) => {
  try {
    const { comments, rating, reviewId: _id } = req.body;
    const findReview = await Review.findOne({ _id });
    if (!findReview) {
      return next(new ApiError(404, `you don't have any Review to edit`));
    }
    findReview.image.map((x) => {
      deleteImageFromCloud(x.cloud_public_id);
      findReview.image = [];
    });
    const imageArray = await uploadFileToCloud(req, 'review');
    if (imageArray.length > 0) {
      findReview.image = imageArray;
    }
    if (comments) {
      findReview.comments.content = comments;
    }
    if (rating) {
      findReview.comments.rating = rating;
    }
    await findReview.save();
    return responseHandler(200, 'edit Review successfully', res, findReview);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.getReview = async (req, res, next) => {
  try {
    const findReview = await Review.findOne({ userId: req.userid })
      .populate('productId', 'title')
      .populate('comments.userId', 'fullName');
    return responseHandler(200, 'find review successfully', res, findReview);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
