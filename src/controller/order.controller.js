const { User, Product, Order, UserAddress } = require('../models/');
const { createInvoice } = require('../config/createInvoice');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');

exports.createOrder = async (req, res, next) => {
  try {
    const { products } = req.body;
    let totalPrice = 0;
    for (i of products) {
      let productId = i.productId;
      let quantity = i.quantity;
      const findProduct = await Product.findOne({ _id: productId });
      if (!findProduct) {
        return next(
          new ApiError(404, `this product is not available... Id:${productId}`),
        );
      }
      if (quantity > findProduct.quantity) {
        return next(new ApiError(404, `out of stoke this Id:${productId}`));
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
      return next(new ApiError(400, 'first fillup address details'));
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
    await createInvoice(findUserDetails);
    return responseHandler(
      200,
      'PlaceOrder successfully',
      res,
      findUserDetails,
    );
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.cancelOrder = async (req, res, next) => {
  try {
    const findOrder = await Order.findOne({ _id: req.params.id });
    if (!findOrder) {
      return next(new ApiError(404, 'you do not have any order to cancel'));
    }
    if (findOrder.status !== 'ordered' || findOrder.status !== 'packed') {
      return next(new ApiError(400, `you can't  cancel your order`));
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
    return responseHandler(200, 'Order cancel successfully', res, findOrder);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.getAllOrder = async (req, res, next) => {
  try {
    const findOrder = await Order.findOne({
      userId: req.userid,
    });
    if (!findOrder) {
      return next(new ApiError(404, "you don't have any order yet"));
    }
    return responseHandler(200, 'getOrder successfully', res, findOrder);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.getOrderById = async (req, res, next) => {
  try {
    const findOrder = await Order.findOne({
      _id: req.params.id,
      status: 'ordered',
    });
    if (!findOrder) {
      return next(new ApiError(404, `you don't have any order yet`));
    }
    return responseHandler(200, 'getOrder successfully', res, findOrder);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.changeStatus = async (req, res, next) => {
  try {
    const findOrder = await Order.findOne({
      _id: req.params.id,
      status: 'ordered',
    });
    if (!findOrder) {
      return next(new ApiError(404, `you don't have any order yet`));
    }
    findOrder.status = req.body.status;
    return responseHandler(
      200,
      `${req.body.status} successfully`,
      res,
      findOrder,
    );
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
exports.fsatDeviveryDate = async (req, res) => {
  try {
    const { deliveryMode } = req.query;
    let date;
    if (!deliveryMode) {
      return next(new ApiError(404, 'deliveryMode not find in query'));
    }
    if (deliveryMode === 'fast') {
      date = new Date(+new Date() + 1 * 24 * 60 * 60 * 1000);
      return responseHandler(200, 'fastDelivery', res, date);
    }
    if (deliveryMode === 'standard') {
      const random = Math.floor(Math.random() * (5 - 3)) + 3;
      date = new Date(+new Date() + random * 24 * 60 * 60 * 1000);
      return responseHandler(200, 'standardDelivery', res, date);
    }
    return next(
      new ApiError(400, 'query can have standard or fast deliveryMode'),
    );
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
