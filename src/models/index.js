const User = require('./sellerModel');
const UserAddress = require('./address.modal');
const SellerProfile = require('./seller.profile')
const {Product,CloudId} = require('./product.model')
const Category = require('./category_id')
const Brand = require('./brand.id')
const addCart = require('./addToCart.model')
const Order = require('./order.model')
const Review = require('./review.model')

module.exports = {
  User,
  UserAddress,
  SellerProfile,
  Product,
  Category,
  Brand,
  CloudId,
  addCart,
  Order,
  Review
};
