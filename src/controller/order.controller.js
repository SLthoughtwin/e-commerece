const { User, Product, Order, UserAddress } = require('../models/');
const objectID = require('mongodb').ObjectId;

exports.getOrder = async (req, res) => {
  try {
    const {quantity=1} = req.body
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
    const findAddress = await UserAddress.findOne({
      userId: req.userid,
      isActive: true,
    });
    if (!findAddress) {
      return res.status(404).json({
        message: 'please select your adderss',
      });
    }
    const getOrder = await Order.create({
      addressId:findAddress.id,
      userId:req.userid,
      quantity
    })
    return res.status(200).json({
      succes: true,
      message: 'PlaceOrder successfully',
      data: getOrder,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const findOrder = await Order.findOne({ _id: req.params.id });
    if (!findOrder) {
      return res.status(200).json({
        succes: false,
        message: 'you do not have any order to cancel',
      });
    }
    findOrder.status = 'cancelled';
    findOrder.save();
    return res.status(200).json({
      succes: true,
      message: 'Order cancel successfully',
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.getAllOrder = async (req, res) => {
  try {
    const findOrder = await Order.findOne({
      userId: req.userid,
      status: 'ordered',
    });
    if (!findOrder) {
      return res.status(200).json({
        succes: false,
        message: "you don't have any order yet",
      });
    }
    return res.status(200).json({
      succes: true,
      message: 'getOrder successfully',
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    if (objectID.isValid(req.params.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const findOrder = await Order.findOne({
      _id: req.params.id,
      status: 'ordered',
    });
    if (!findOrder) {
      return res.status(200).json({
        succes: false,
        message: "you don't have any order yet",
      });
    }
    return res.status(200).json({
      succes: true,
      message: 'getOrder successfully',
      data: findOrder,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};
exports.changeStatus = async (req, res) => {
    try {
      if (objectID.isValid(req.params.id) === false) {
        return res.status(400).json({
          message: 'id must be correct format',
          succes: false,
        });
      }
      const findOrder = await Order.findOne({
        _id: req.params.id,
        status: 'ordered',
      });
      if (!findOrder) {
        return res.status(200).json({
          succes: false,
          message: "you don't have any order yet",
        });
      }
      findOrder.status = req.body.status
      return res.status(200).json({
        succes: true,
        message: `${req.body.status} successfully`,
        data: findOrder,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        succes: false,
      });
    }
};
