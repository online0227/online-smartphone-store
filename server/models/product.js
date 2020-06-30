const mongoose = require("mongoose");
import {counter} from './sequence';

const options = {
    id: false,
    timestamps: true,
    toObject: { virtuals: true, timestamps: true },
    toJSON: { virtuals: true, timestamps: true }
  }

const productSchema = new mongoose.Schema(
    {
        pid: Number,
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        description: {
            type: String,
            required: true,
            maxlength: 25000
        },
        price: {
            type: Number,
            trim: true,
            required: true,
            maxlength: 32
        },
        cid: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number
        },
        sold: {
            type: Number,
            default: 0
        },
        photo: [{
            type: String
        }],        shipping: {
            required: false,
            type: Boolean
        }
    },
    options
);

productSchema.virtual('cat', {
    ref: 'Category',    localField: 'cid',    foreignField: 'cid',    justOne: true
  });

productSchema.pre('save', function (next) {
    const doc = this;

    const name = 'product_counter';
    counter.findByIdAndUpdate({_id: name}, {$inc: { seq: 1 } }, {upsert: true , new: true}, function(err, result) {
        if(err) {
            return next(err);
        }

        doc.pid = result.seq;
        next();
    });
});

module.exports = mongoose.model("Product", productSchema);
