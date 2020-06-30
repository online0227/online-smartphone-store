const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderById = (req, res, next, oid) => {
    Order.findOne({ oid: oid })        .exec((err, order) => {
            if (err || !order) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            req.order = order;
            next();
        });
};

exports.create = (req, res) => {
    let purchased = [];

    req.body.order.products.forEach(item => {
        purchased.push({
            pid: item.info.pid,
            name: item.info.name,
            price: item.info.price,
            quantity: item.count
        });
    });

    const order = new Order({
        transaction_id: req.body.order.transaction_id,
        amount: req.body.order.amount,
        address: req.body.order.address,
        uid: req.profile.uid,
        name: req.profile.name,
        products: purchased
    });

    order.save((error, data) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        res.json(data);
    });
};

exports.listOrders = (req, res) => {
    Order.find()        .sort({status: 1})
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(orders);
        });
};

exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
    Order.update(
        { oid: req.body.orderId },
        { $set: { status: req.body.status } },
        (err, order) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(order);
        }
    );
};
