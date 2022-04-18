const {
  verifiedByAdmin,
  adminLogin,
  getAllseller,
  deleteSellerByAdmin,
  getAllUser,
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
  deleteCart,
  IncreAndDecre,
  deleteAllCart,
} = require('./addCart.controller');
const { 
  getOrder,
   cancelOrder,
    getAllOrder,
    getOrderById,
    changeStatus } = require('./order.controller');

const{deleteReview,createReview} = require('./review.controller');

module.exports = {
  sellerVarified,
  signUPSeller,
  sellerLogin,
  verifiedOtp,
  verifiedByAdmin,
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
  deleteProcduct,
  showProductById,
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
  deleteCart,
  IncreAndDecre,
  deleteAllCart,
  deleteSellerByAdmin,
  getAllUser,
  getOrder,
  cancelOrder,
  getAllOrder,
  getOrderById,
  changeStatus,
  deleteReview,
  createReview
};
