const {
  approvedAndRejectSellerByAdmin,
  adminLogin,
  getAllseller,
  deleteSellerByAdmin,
  getAllUser,
  productApprovedAndRejectByadmin,
} = require('./admin.controller');
const {
  sellerVarified,
  signUPSeller,
  sellerLogin,
  verifiedOtp,
  createAccessRefreshToken,
  logoutSelller,
  createProfile,
  uploadImage,
} = require('./seller.controller');
const {
  signUPUser,
  userLogin,
  userVarified,
  userVerifiedOtp,
  logoutUser,
  createAccessRefreshTokenToUser,
  updateUser,
} = require('./user.controller');
const {
  createAddress,
  updateAddress,
  showAddress,
  deleteAddress,
  axiosTest,
} = require('./address.controller');
// const { createProfile } = require('./profile.controller')
const {
  createProduct,
  updateProduct,
  showProduct,
  deleteProcduct,
  showProductById,
} = require('./product.controller');
const {
  createCategory,
  updateCategory,
  showCategoryById,
  showCategory,
  deleteCategory,
} = require('./coategory.controller');
const {
  createBrand,
  updateBrand,
  showBrandById,
  showBrand,
  deleteBrand,
} = require('./brand.controller');

const {
  showCart,
  createCart,
  deleteCartItems,
  IncrementAndDecrement,
  deleteCart,
} = require('./addCart.controller');
const {
  createOrder,
  cancelOrder,
  getAllOrder,
  getOrderById,
  changeStatus,
  fsatDeviveryDate,
} = require('./order.controller');

const {
  deleteReview,
  createReview,
  getReview,
  editReview
} = require('./review.controller');

module.exports = {
  sellerVarified,
  signUPSeller,
  sellerLogin,
  verifiedOtp,
  approvedAndRejectSellerByAdmin,
  adminLogin,
  createAccessRefreshToken,
  getAllseller,
  logoutSelller,
  signUPUser,
  userLogin,
  userVarified,
  userVerifiedOtp,
  logoutUser,
  createAccessRefreshTokenToUser,
  createAddress,
  updateAddress,
  showAddress,
  deleteAddress,
  axiosTest,
  createProfile,
  updateUser,
  createProduct,
  updateProduct,
  showProduct,
  fsatDeviveryDate,
  deleteProcduct,
  showProductById,
  productApprovedAndRejectByadmin,
  createCategory,
  updateCategory,
  showCategoryById,
  showCategory,
  deleteCategory,
  createBrand,
  updateBrand,
  showBrandById,
  showBrand,
  deleteBrand,
  showCart,
  createCart,
  deleteCartItems,
  IncrementAndDecrement,
  deleteCart,
  deleteSellerByAdmin,
  getAllUser,
  createOrder,
  cancelOrder,
  getAllOrder,
  getOrderById,
  changeStatus,
  deleteReview,
  createReview,
  getReview,
  editReview,
};
