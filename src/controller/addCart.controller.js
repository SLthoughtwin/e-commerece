const { User, Category, Brand, addCart, Product } = require('./../models/');
const Redis = require("ioredis");
const redis = new Redis();
const objectID = require('mongodb').ObjectId;
const { addCartValidation } = require('../middleware/');

exports.createCart = async (req, res) => {
  try {
    if (objectID.isValid(req.body.productId) === false) {
      return res.status(400).json({
        message: 'productid id must be correct format',
        succes: false,
      });
    }
    const findProduct = await Product.findOne({ _id: req.body.productId });
    if (!findProduct) {
      return res.status(400).json({
        message: 'this card is not available',
        succes: false,
      });
    }

    const result = await addCart.findOne({
      productId: req.body.productId,
      userId: req.userid,
    });

    if (findProduct.quantity < result.quantity) {
      return res.status(400).json({
        message: 'out of stock',
        succes: false,
      });
    }
    if (result) {
      result.quantity += 1;
      await result.save();
      const setRedis = await  redis.set(result.id, JSON.stringify(result), "EX", 10);
      const getRedis = await  redis.get(result.id);
      console.log(getRedis)
      const newCart = await addCart.findOne({ _id: result.id });
      return res.status(200).json({
        message: 'add card successfully',
        succes: true,
        data: (getRedis),
      });
    }
    req.body.userId = req.userid;
    const createCart = await addCart.create(req.body);
    return res.status(200).json({
      data: createCart,
      message: 'add cart successfully....',
      succes: true,
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.IncreAndDecre = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'cart id must be correct format',
        succes: false,
      });
    }

    const result = await addCart.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        message: 'inavalid cart id',
        succes: false,
      });
    }
    const findProduct = await Product.findOne({ _id: result.productId });
    if (!findProduct) {
      return res.status(400).json({
        message: 'this card is not available',
        succes: false,
      });
    }

    if (req.query.value === 'increment') {
      result.quantity += 1;
      if (findProduct.quantity < result.quantity) {
        return res.status(400).json({
          message: 'out of stock',
          succes: false,
        });
      }

      await result.save();
      const increment = await addCart.findOne({ _id: result.id });
      return res.status(200).json({
        data: increment,
        message: 'find cart successfully',
        succes: true,
      });
    }
    if (0 == result.quantity) {
      return res.status(400).json({
        message: 'quantity cloud not be less than zero',
        succes: false,
      });
    }
    result.quantity -= 1;
    await result.save();
    const increment = await addCart.findOne({ _id: result.id });
    return res.status(200).json({
      data: increment,
      message: 'find cart successfully',
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.showCart = async (req, res) => {
  try {
    const result = await addCart.find({ userId: req.userid }).populate("productId","price");
    let price = 0;
    for (i of result){
      price +=(i.productId.price*i.quantity)
    }
    if (!result) {
      return res.status(400).json({
        message: 'there is no cart',
        succes: false,
      });
    }
console.log(price)
    return res.status(200).json({
      succes: true,
      message: `data found / total price for ${result.length} items : ${price}`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.deleteCart = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'cart id must be correct format',
        succes: false,
      });
    }

    const result = await addCart.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        message: 'there is no cart releted this id',
        succes: false,
      });
    }
    const delRedis = await  redis.del(result.id);
    // await deleteImageFromCloud(result.imageId);
    return res.status(200).json({
      createBrand: result,
      message: 'delete cart successfully',
      succes: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.deleteAllCart = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'cart id must be correct format',
        succes: false,
      });
    }

    const result = await addCart.deleteMany({ userId: req.params.id });
    if (!result) {
      return res.status(400).json({
        message: 'there is no cart releted this id',
        succes: false,
      });
    }
    // const delRedis = await  redis.del(result.id);
    return res.status(200).json({
      createBrand: result,
      message: 'delete allcart successfully',
      succes: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};