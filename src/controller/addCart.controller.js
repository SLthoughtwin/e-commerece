const { User, Category, Brand, addCart, Product } = require('./../models/');
const {responseHandler} = require('../config/')
const ApiError = require('../config/apierror');
const objectID = require('mongodb').ObjectId;
const { addCartValidation } = require('../middleware/');

exports.createCart = async (req, res,next) => {
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
        return next(new ApiError(409,`this product already ... Id:${productId}`))
      }
      const findProduct = await Product.findOne({ _id: productId });
      if (!findProduct) {
        return next(new ApiError(404,`this product is not available... Id:${productId}`))
      }
      if (quantity > findProduct.quantity) {
        return next(new ApiError(404,`out of stoke this :${productId}`))
      }
      const amount = parseInt(findProduct.price * quantity);
      i.price = amount;
      totalPrice += amount;
    }
    req.body.userId = req.userid;
    let createCart;
    if (!findCart) {
      createCart = await addCart.create(req.body);
      return responseHandler(201,'add cart successfully',res,createCart)
    }
    for (i of products) {
      findCart.products.push(i);
    }
    createCart = await findCart.save();
    return responseHandler(201,'add cart successfully',res,createCart)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};
exports.IncrementAndDecrement = async (req, res ,next) => {
  try {
    const {value} = req.query
    const result = await addCart.findOne({ userId: req.userid });
    if (!result) {
      return next(new ApiError(401,'invalid cart id'))
    }
    const findCartObjId = result.products.find((curr)=>{
      const newId = curr.id
     return req.body.id == newId
    })
    if(!findCartObjId)
    {
      return next(new ApiError(401,'invalid cart object id'))
    }
    const productId = findCartObjId.productId
    let quantity = findCartObjId.quantity
      const findProduct = await Product.findOne({ _id: findCartObjId.productId });
      if (!findProduct) {
        return next(new ApiError(404,`this product is not available... Id:${productId}`)) 
      }
      if(value==="increment"){
       quantity += 1
       if (quantity > findProduct.quantity) {
        return next(new ApiError(404,`out of stoke this Id:${productId}`)) 
      }
        const result1 = await addCart.findOneAndUpdate({userId:req.userid,'products._id':req.body.id},
        {'$set':{'products.$.quantity':quantity}},{new:true})
       return responseHandler(200,"update cartItems successfully",res,result1)
      }

      if(value === "decrement"){
        quantity -= 1
        if (quantity === 0) {
         return next(new ApiError(400,`quantity cant not 0`))
       }
       const result1 = await addCart.findOneAndUpdate({userId:req.userid,'products._id':req.body.id},
       {'$set':{'products.$.quantity':quantity}},{new:true})
         return responseHandler(200,"update cartItems successfully",res,result1)
      }
   }catch (error) {
    return next(new ApiError(400,error.message))
  }
};
exports.showCart = async (req, res,next) => {
  try {
    const result = await addCart
      .find({ userId: req.userid })
      .populate('productId', 'price');
    let price = 0;
    for (i of result) {
      price += i.productId.price * i.quantity;
    }
    if (!result) {
      return next(new ApiError(400,'there is no cart'))
    }
    return responseHandler(200,`data found / total price for ${result.length} items : ${price}`,res,result)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};
exports.deleteCartItems = async (req, res,next) => {
  try {
    const findCart = await addCart.findOne({ userId: req.userid });
    const result = await addCart.findOneAndUpdate({
      $pull: { products: { _id: req.params.id } },
    });
    if (!result) {
      return next(new ApiError(404,'there is no items related this id'))
    }
    return responseHandler(200,"delete cart items successfully",res,result)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};
exports.deleteCart = async (req,res,next) => {
  try {
    const result = await addCart.findOneAndDelete({ _id: req.params.id });
    if (!result) {
      return next(new ApiError(404,'there is no cart related this id'))
    }
    return responseHandler(200,"delete cart successfully",res,result)
  } catch (error) {
    return next(new ApiError(400,error.message))
  }
};
