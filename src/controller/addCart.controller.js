const { User, Category, Brand, addCart, Product } = require('./../models/');
// const Redis = require("ioredis");
// const redis = new Redis();
const objectID = require('mongodb').ObjectId;
const { addCartValidation } = require('../middleware/');

exports.createCart = async (req, res) => {
  try {
    const { products } = req.body
    let totalPrice = 0;
    for (i of products) {
      let productId = i.productId;
      let quantity = i.quantity;
      const findProduct = await Product.findOne({ _id: productId });
      if (!findProduct) {
        return res.status(404).json({
          statusCode:400,
          message: `this product is not available... Id:${productId}`,
        });
      }
      if (quantity > findProduct.quantity) {
        return res.status(404).json({
          statusCode:400,
          message: `out of stoke this :${productId}`,
        });
      }
      const amount = parseInt(findProduct.price * quantity);
      i.price = amount;
      totalPrice += amount;
    }
    req.body.userId = req.userid;
    let findCart = await addCart.findOne({userId:req.userid})
    let createCart
    if(!findCart){
       createCart = await addCart.create(req.body);
       return res.status(200).json({
        statusCode:200,
        message: 'add cart successfully....',
        data: createCart,
      });
    }
    for(i of products){
      findCart.products.push(i)
    }
    createCart = await findCart.save()
    return res.status(200).json({
      statusCode:200,
      message: 'add cart successfully....',
      data: createCart
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      statusCode:400,
      message: error.message,
    });
  }
};

exports.IncreAndDecre = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode:400,
        message: 'cart id must be correct format',
      });
    }

    const result = await addCart.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode:400,
        message: 'inavalid cart id'
      });
    }
    const findProduct = await Product.findOne({ _id: result.productId });
    if (!findProduct) {
      return res.status(400).json({
        statusCode:400,
        message: 'this card is not available'
      });
    }

    if (req.query.value === 'increment') {
      result.quantity += 1;
      if (findProduct.quantity < result.quantity) {
        return res.status(400).json({
          statusCode:400,
          message: 'out of stock'
        });
      }

      await result.save();
      const increment = await addCart.findOne({ _id: result.id });
      return res.status(200).json({
        statusCode:200,
        message: 'find cart successfully',
        data: increment
      });
    }
    if (0 == result.quantity) {
      return res.status(400).json({
        statusCode:400,
        message: 'quantity cloud not be less than zero',
      });
    }
    result.quantity -= 1;
    await result.save();
    const increment = await addCart.findOne({ _id: result.id });
    return res.status(200).json({
      statusCode:200,
      message: 'find cart successfully',
      data: increment,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode:400,
      message: error.message,
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
        statusCode:400,
        message: 'there is no cart',
      });
    }
    return res.status(200).json({
      statusCode:200,
      message: `data found / total price for ${result.length} items : ${price}`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode:400,
      message: error.message,
    });
  }
};
exports.deleteCart = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode:400,
        message: 'cart id must be correct format',
        
      });
    }

    const findCart = await addCart.findOne({userId:req.userid})
    const result = await addCart.findOneAndUpdate({$pull: {products: {_id: req.params.id}}});
    if (!result) {
      return res.status(400).json({
        statusCode:400,
        message: 'there is no cart releted this id',
      });
    }
    const delRedis = await  redis.del(result.id);
    // await deleteImageFromCloud(result.imageId);
    return res.status(200).json({
      statusCode:200,
      message: 'delete cart successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode:400,
      message: error.message,
    });
  }
};
exports.deleteAllCart = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode:400,
        message: 'cart id must be correct format',
      });
    }

    const result = await addCart.deleteMany({ userId: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode:400,
        message: 'there is no cart releted this id',
      });
    }
    // const delRedis = await  redis.del(result.id);
    return res.status(200).json({
      statusCode:200,
      message: 'delete allcart successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode:400,
      message: error.message,
    });
  }
};