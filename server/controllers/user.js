const crypto = require("crypto");
const uuidv1 = require("uuid/v1");
const User = require("../models/user");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, uid) => {
    User.findOne({ uid: uid }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found"
            });
        }
        req.profile = user;
        next();
    });
};

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;    return res.json(req.profile);
};

exports.update = (req, res) => {
    let new_info = {};
    if (req.body.password.length > 0) {
        const new_salt = uuidv1();
        const new_hashed_password = crypto
            .createHmac("sha1", new_salt)
            .update(req.body.password)
            .digest("hex");

        new_info = { name: req.body.name, email: req.body.email, hashed_password: new_hashed_password, salt: new_salt };
    } else {
        new_info = { name: req.body.name, email: req.body.email };
    }


    User.findOneAndUpdate(
        { uid: req.profile.uid },
        { $set: new_info },
        { new: true },
        (err, user) => {
            if (err) {
                return res.status(400).json({
                    error: "You are not authorized to perform this action"
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);
        }
    );
};

exports.addOrderToUserHistory = (req, res, next) => {
    let history = [];

    req.body.order.products.forEach(item => {
        history.push({
            pid: item.info.pid,
            name: item.info.name,
            description: item.info.description,
            category: item.info.cat.name,
            quantity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        });
    });

    User.findOneAndUpdate(
        { uid: req.profile.uid },
        { $push: { history: history } },
        { new: true },
        (error, data) => {
            if (error) {
                return res.status(400).json({
                    error: "Could not update user purchase history"
                });
            }
            next();
        }
    );
};

exports.purchaseHistory = (req, res) => {
    Order.find({ uid: req.profile.uid })        .sort("-createdAt")
        .exec((err, orders) => {            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};
