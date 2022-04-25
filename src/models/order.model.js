const { string } = require('joi');
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAddress' },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['ordered', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'ordered',
    },

    paymentType: {
      type: String,
      enum: ['COD', 'EMI', 'NB', 'UPI'],
      default: 'COD',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
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
