const { Product, Order, Review } = require('../models/');
const { deleteImageFromCloud, uploadFileToCloud } = require('../middleware');

exports.createReview = async (req, res) => {
  try {
    const { comments, rating, productId: _id } = req.body;
    const findOrder = await Order.findOne({
      _userId: req.userid,
      'protucts.productId': _id,
      status: 'delivered',
    });
    if (!findOrder) {
      return res.status(404).json({
        statusCode: 400,
        message: 'first buy a product then comment',
      });
    }

    const findProduct = await Product.findOne({ _id }).populate('review',"comments.rating")
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
        message: 'you have already given review',
      });
    }
    const imageArray = await  uploadFileToCloud(req,"review")
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
    let totalReview = 0
    findProduct.review.map((reviewRating)=>{
     reviewRating.comments.find((rate)=> totalReview+=rate.rating)
    })
    const reviewRating = (totalReview+review.comments[0].rating)/(findProduct.review.length+1)
    findProduct.review.push(review.id)
    findProduct.averageRating = reviewRating
    await findProduct.save()
    if (imageArray.length > 0) {
      (review.image = imageArray), await review.save();
    }
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
    const {id:_id} = req.params
    const findReview = await Review.findOneAndDelete({ _id});
    if (!findReview) {
      return res.status(200).json({
        statusCode: 200,
        message: "you don't have any Review to delete",
      });
    }
    await findReview.image.map((x) => {
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
exports.editReview = async (req, res) => {
  try {
    const {comments,rating,reviewId:_id} =  req.body
    const findReview = await Review.findOne({ _id });
    if (!findReview) {
      return res.status(200).json({
        statusCode: 200,
        message: "you don't have any Review to edit",
      });
    }
     findReview.image.map((x) => {
        deleteImageFromCloud(x.cloud_public_id);
        findReview.image = []

    });
    const imageArray = await  uploadFileToCloud(req,"review")

    if(imageArray.length > 0){
      findReview.image = imageArray
    }
    if(comments){
      findReview.comments.content = comments
    }
   if(rating){
    findReview.comments.rating = rating
    }
    await findReview.save()
    return res.status(200).json({
      statusCode: 200,
      message: 'edit Review successfully',
      data: findReview,
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.getReview = async (req, res) => {
  try {
    const findReview = await Review.findOne({ userId: req.userid })
      .populate('productId', 'title')
      .populate('comments.userId', 'fullName');

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
