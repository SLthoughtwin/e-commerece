const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.String, ref: 'User' },
    productId: { type: mongoose.Schema.Types.String, ref: 'Product' },
    addressId: { type: mongoose.Schema.Types.String, ref: 'UserAddress' },
    quantity: {
        type:Number,
        default:1
    },
    status:{
        type:String,
        enum:['ordered','shiping',"cancelled","delivered"],
        default:"ordered"
    }
  },
  { timestamps: true },
);

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
