const adminRoute = require('./admin.route');
const sellerRoute = require('./seller.route');
const userRoute = require('./user.route');
const addressRoute = require('./address.route');
const productRoute = require('./product.route')
const brandRoute = require('./brand.route');
const categoryRoute = require('./category.route')
const cartRoute = require('./addCart.route')
const orderRoute = require('./order.route')
const reviewRoute = require('./review.route')
module.exports = {
  sellerRoute,
  adminRoute,
  userRoute,
  addressRoute,
  productRoute,
  brandRoute,
  categoryRoute,
  cartRoute,
  orderRoute,
  reviewRoute
};
