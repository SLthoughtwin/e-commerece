const { User, Category, Brand, addCart, Product } = require('./../models/');
// const Redis = require("ioredis");
// const redis = new Redis();
const objectID = require('mongodb').ObjectId;
const { addCartValidation } = require('../middleware/');

exports.createCart = async (req, res) => {
  try {
    let findCart = await addCart.findOne({ userId: req.userid }).exec();
    const { products } = req.body;
    let totalPrice = 0;
    for (i of products) {
      let productId = i.productId;
      let quantity = i.quantity;
      const findCartItem = findCart?.products.find((element)=>{
        newId  = element.productId.toString().replace(/new ObjectId/, "");
       return productId === newId})
      if(findCartItem){
        return res.status(404).json({
          statusCode: 400,
          message: `this product already available... Id:${productId}`,
        });
      }
      const findProduct = await Product.findOne({ _id: productId });
      if (!findProduct) {
        return res.status(404).json({
          statusCode: 400,
          message: `this product is not available... Id:${productId}`,
        });
      }
      if (quantity > findProduct.quantity) {
        return res.status(404).json({
          statusCode: 400,
          message: `out of stoke this :${productId}`,
        });
      }
      const amount = parseInt(findProduct.price * quantity);
      i.price = amount;
      totalPrice += amount;
    }
    req.body.userId = req.userid;
    let createCart;
    if (!findCart) {
      createCart = await addCart.create(req.body);
      return res.status(200).json({
        statusCode: 200,
        message: 'add cart successfully....',
        data: createCart,
      });
    }
    for (i of products) {
      findCart.products.push(i);
    }
    createCart = await findCart.save();
    return res.status(200).json({
      statusCode: 200,
      message: 'add cart successfully....',
      data: createCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.IncreAndDecre = async (req, res) => {
  try {
    // console.log(req.query)
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const {value} = req.query
    const result = await addCart.findOne({ userId: req.userid });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavalid cart id',
      });
    }
    const findCartObjId = result.products.find((curr)=>{
      const newId = curr.id
     return req.params.id == newId
    })
    if(!findCartObjId)
    {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavalid cart object id',
      });
    }
    const productId = findCartObjId.productId
    let quantity = findCartObjId.quantity
      const findProduct = await Product.findOne({ _id: findCartObjId.productId });
      if (!findProduct) {
        return res.status(404).json({
          statusCode: 400,
          message: `this product is not available... Id:${productId}`,
        });
      }
      if(value=="increment"){
       quantity += 1
       if (quantity > findProduct.quantity) {
        return res.status(404).json({
          statusCode: 400,
          message: `out of stoke this Id:${productId}`,
        });
      }
        const result1 = await addCart.findOneAndUpdate({userId:req.userid,'products._id':req.params.id},
        {'$set':{'products.$.quantity':quantity}},{new:true})
        return res.status(200).json({
         statusCode: 200,
         message: 'update cartItems successfully',
         data:result1
       
       });
      }

      if(value === "decrement"){
        quantity -= 1
        if (quantity === 0) {
         return res.status(404).json({
           statusCode: 400,
           message: `quantity cant not 0`,
         });
       }
       const result1 = await addCart.findOneAndUpdate({userId:req.userid,'products._id':req.params.id},
       {'$set':{'products.$.quantity':quantity}},{new:true})
         return res.status(200).json({
          statusCode: 200,
          message: 'update cartItems successfully',
          data:result1
        
        });
      }
   }catch (error) {
    console.log(error);
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.showCart = async (req, res) => {
  try {
    const result = await addCart
      .find({ userId: req.userid })
      .populate('productId', 'price');
    let price = 0;
    for (i of result) {
      price += i.productId.price * i.quantity;
    }
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no cart',
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: `data found / total price for ${result.length} items : ${price}`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.deleteCartItems = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'cart id must be correct format',
      });
    }
    const findCart = await addCart.findOne({ userId: req.userid });
    const result = await addCart.findOneAndUpdate({
      $pull: { products: { _id: req.params.id } },
    });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no items releted this id',
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'delete cart items successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.deleteCart = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'cart id must be correct format',
      });
    }

    const result = await addCart.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'there is no cart releted this id',
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'delete allcart successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
