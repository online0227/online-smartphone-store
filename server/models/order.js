const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;
import { counter } from './sequence';

const options = {
  id: false,
  timestamps: true,
  toObject: { virtuals: true, timestamps: true },
  toJSON: { virtuals: true, timestamps: true }
}
const OrderSchema = new mongoose.Schema(
  {    oid:Number,
    products: {
      type: Array,
      default: []
    },
    transaction_id: {},
    amount: { type: Number },
    address: String,
    status: {
      type: String,
      default: "Not processed",
      enum: ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"]    },
    updated: Date,
    uid: { type: Number },
    name: String
  },
  options
);

OrderSchema.virtual('order_prod', {
  ref: 'Product',
  localField: 'products.pid',
  foreignField: 'pid',
  justOne: true
});

OrderSchema.virtual('order_user', {
  ref: 'User',
  localField: 'uid',
  foreignField: 'uid',
  justOne: true
});

OrderSchema.pre('save', function (next) {
  const doc = this;

  const name = 'order_counter';  counter.findByIdAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, new: true }, function (err, result) {
      if (err) {
          return next(err);
      }

      doc.oid = result.seq;      next();
  });
});

const Order = mongoose.model("Order", OrderSchema);module.exports = { Order };
