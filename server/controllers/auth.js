const User = require("../models/user");
import Cart from '../models/cart';
const jwt = require("jsonwebtoken");const expressJwt = require("express-jwt");const { OAuth2Client } = require('google-auth-library');
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require('lodash');
require('dotenv').config()

exports.signup = (req, res) => {
    const user = new User(req.body);

    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        };
        const cart = new Cart({
            uid: user.uid
        });

        cart.save(function (err) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }            if (req.body.cart.length > 0) {
                let items = req.body.cart;
                Cart
                    .findOne({ uid: user.uid })
                    .populate({ path: 'cart_prod' })                    .exec(function (err, cart) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }                        if (cart) {
                            Cart.findOneAndUpdate({ uid: user.uid }, {
                                $addToSet: {
                                    products: items
                                },
                            },
                                { new: true },
                                function (err) {
                                    if (err) {
                                        return res.status(400).json({
                                            error: errorHandler(err)
                                        });
                                    }
                                });
                        }
                    });
            }
        });

        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    });
};

exports.signin = (req, res) => {    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email does not exist. Please signup"
            });
        }        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password dont match"
            });
        }        if (req.body.cart.length > 0) {
            let items = req.body.cart;            for (let i = 0; i < items.length; i++) {
                Cart.findOneAndUpdate(
                    { uid: user.uid, 'products.pid': { $ne: items[i].pid } }, {
                    $addToSet: {
                        products: items[i]
                    },
                },
                    { new: true },
                    function (err) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                    });
            }
        }        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);        res.cookie("t", token, { expire: new Date() + 9999 });        const { uid, name, email, role } = user;
        return res.json({ token, user: { uid, email, name, role } });
    });
};

const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

exports.socialLogin = async (req, res) => {
    const idToken = req.body.user.tokenId;
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.REACT_APP_GOOGLE_CLIENT_ID });    const { email_verified, email, name, picture, sub: googleid } = ticket.getPayload();
    if (email_verified) {        const newUser = { email, name, password: googleid };        let user = User.findOne({ email }, (err, user) => {
            if (err || !user) {                user = new User(newUser);
                req.profile = user;

                user.save((err, user) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    };

                    const cart = new Cart({
                        uid: user.uid
                    });

                    cart.save(function (err) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }                        if (req.body.cart.length > 0) {
                            let items = req.body.cart;
                            Cart
                                .findOne({ uid: user.uid })
                                .populate({ path: 'cart_prod' })                                .exec(function (err, cart) {
                                    if (err) {
                                        return res.status(400).json({
                                            error: errorHandler(err)
                                        });
                                    }                                    if (cart) {
                                        Cart.findOneAndUpdate({ uid: user.uid }, {
                                            $addToSet: {
                                                products: items
                                            },
                                        },
                                            { new: true },
                                            function (err) {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: errorHandler(err)
                                                    });
                                                }
                                            });
                                    }
                                });
                        }                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
                        res.cookie("t", token, { expire: new Date() + 9999 });                        const { uid, email, name, role } = user;
                        return res.json({ token, user: { uid, email, name, role } });
                    });
                });
            } else {                if (req.body.cart.length > 0) {
                    let items = req.body.cart;                    for (let i = 0; i < items.length; i++) {
                        Cart.findOneAndUpdate(
                            { uid: user.uid, 'products.pid': { $ne: items[i].pid } }, {
                            $addToSet: {
                                products: items[i]
                            },
                        },
                            { new: true },
                            function (err) {
                                if (err) {
                                    return res.status(400).json({
                                        error: errorHandler(err)
                                    });
                                }
                            });
                    }
                }                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
                res.cookie("t", token, { expire: new Date() + 9999 });                const { uid, email, name, role } = user;
                return res.json({ token, user: { uid, email, name, role } });
            }
        });
    }
};

exports.signout = (req, res) => {
    res.clearCookie("t");
    res.json({ message: "Signout success" });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: "Access denied"
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resourse! Access denied"
        });
    }
    next();
};
