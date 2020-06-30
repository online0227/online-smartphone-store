const mongoose = require("mongoose");

const options = {
    id: false,
    timestamps: true,
    toObject: { virtuals: true, timestamps: true },
    toJSON: { virtuals: true, timestamps: true }
}

const cartSubSchema = new mongoose.Schema(
    {
    pid: { type: Number },
    count: { type: Number, default: 1 }
    }, { _id : false }
);

const cartSchema = new mongoose.Schema(
    {
        uid: { type: Number },
        products: [cartSubSchema]
    },
    options
);

cartSchema.virtual('cart_prod', {
    ref: 'Product',
    localField: 'products.pid',
    foreignField: 'pid',
});

module.exports = mongoose.model("Cart", cartSchema);