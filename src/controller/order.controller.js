const { User, Product, Order, UserAddress } = require('../models/');
const objectID = require('mongodb').ObjectId;
// const { uploadfile} = require('../middleware')
const ApiError = require('../config/apierror');
const { sendPdf } = require('../config');

exports.createOrder = async (req, res, next) => {
  try {
    const { products } = req.body;
    let totalPrice = 0;
    for (i of products) {
      let productId = i.productId;
      let quantity = i.quantity;
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
          message: `out of stoke this Id:${productId}`,
        });
      }
      const result = await Order.findOneAndUpdate({
        $pull: { products: { productId } },
      });
      findProduct.quantity -= quantity;
      await findProduct.save();
      const amount = parseInt(findProduct.price * quantity);
      i.price = amount;
      totalPrice += amount;
    }
    const findAddress = await UserAddress.findOne({
      userId: req.userid,
      isActive: true,
    });
    if (!findAddress) {
      return res.status(404).json({
        statusCode: 400,
        message: 'first fillup address details',
      });
    }
    if (totalPrice < 500) {
      totalPrice += 40;
    }
    const random = Math.floor(Math.random() * (5 - 3)) + 3;
    const date =
      req.body.deliveryMode === 'fast'
        ? new Date(+new Date() + 1 * 24 * 60 * 60 * 1000)
        : new Date(+new Date() + random * 24 * 60 * 60 * 1000);
    const getOrder = await Order.create({
      products: req.body.products,
      addressId: findAddress.id,
      userId: req.userid,
      deliveryDate: date,
      totalAmount: totalPrice,
    });
    findUserDetails = await Order.findOne({ _id: getOrder.id })
      .populate('userId', 'fullName')
      .populate('addressId')
      .populate('products.productId');
    // await sendPdf(getOrder);
    return res.status(200).json({
      statusCode: 200,
      message: 'PlaceOrder successfully',
      data: findUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const findOrder = await Order.findOne({ _id: req.params.id });
    if (!findOrder) {
      return res.status(200).json({
        statusCode: 200,
        message: 'you do not have any order to cancel',
      });
    }
    if (findOrder.status !== 'ordered' || findOrder.status !== 'packed') {
      return res.status(200).json({
        statusCode: 200,
        message: `you can't  cancel your order`,
      });
    }
    for (i of findOrder.products) {
      let quantity = i.quantity;
      let productId = i.productId;
      const findProduct = await Product.findOne({ id: productId });
      findProduct.quantity += quantity;
      await findProduct.save();
    }
    findOrder.status = 'cancelled';
    await findOrder.save();
    return res.status(200).json({
      statusCode: 200,
      message: 'Order cancel successfully',
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.getAllOrder = async (req, res) => {
  try {
    const findOrder = await Order.findOne({
      userId: req.userid,
    });
    if (!findOrder) {
      return res.status(200).json({
        statusCode: 200,
        message: "you don't have any order yet",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'getOrder successfully',
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const findOrder = await Order.findOne({
      _id: req.params.id,
      status: 'ordered',
    });
    if (!findOrder) {
      return res.status(200).json({
        statusCode: 200,
        message: "you don't have any order yet",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'getOrder successfully',
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 401,
      message: error.message,
    });
  }
};
exports.changeStatus = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const findOrder = await Order.findOne({
      _id: req.params.id,
      status: 'ordered',
    });
    if (!findOrder) {
      return res.status(200).json({
        statusCode: 200,
        message: "you don't have any order yet",
      });
    }
    findOrder.status = req.body.status;
    return res.status(200).json({
      statusCode: 200,
      message: `${req.body.status} successfully`,
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
exports.fsatDeviveryDate = async (req, res) => {
  try {
    const { deliveryMode } = req.query;
    let date;
    if (!deliveryMode) {
      return res.status(400).json({
        statusCode: 400,
        message: 'deliveryMode not find in query',
      });
    }
    if (deliveryMode === 'fast') {
      date = new Date(+new Date() + 1 * 24 * 60 * 60 * 1000);
      return res.status(404).json({
        statusCode: 200,
        message: 'fastDelivery',
        date: date,
      });
    }

    if (deliveryMode === 'standard') {
      const random = Math.floor(Math.random() * (5 - 3)) + 3;
      date = new Date(+new Date() + random * 24 * 60 * 60 * 1000);
      return res.status(404).json({
        statusCode: 200,
        message: 'standardDelivery',
        date: date,
      });
    }
    return res.status(404).json({
      statusCode: 200,
      message: 'query can have standard or fast deliveryMode',
      date: date,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};
