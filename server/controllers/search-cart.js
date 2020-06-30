import Cart from '../models/cart';
import Product from "../models/product"
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.countCart = (req, res, next) => {
    const user = req.profile;

    if (!user) {
        return res.status(400).send({ error: 'invalid user.' });
    }

    Cart
        .findOne({ uid: user.uid })
        .select("products")
        .exec(function (err, cart) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            if (cart.products.length >= 0) {
                return res.json(cart.products.length);
            }

            return res.json({ "cart": "counted" });
        });
}

exports.listGuestCart = (req, res, next) => {
    let items = req.body;
    let pids = [];
    items.forEach(element => pids.push(element.pid));

    Product.find({ 'pid': { $in: pids } })        .populate("cat")
        .sort([["pid", "asc"]])        .exec((err, searched) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }

            if(searched.length > 0) {
                let products = [];
                let deleted = [];
                for (let i = 0; i < searched.length; i++) {
                    let element = {
                        count: items[i].count,
                        info: searched[i]
                    };
                    products.push(element);
                }
                return res.json(products);
            }

            return res.json({ "cart": "listed" });
        });

}

exports.listCart = (req, res, next) => {
    const user = req.profile;

    if (!user) {
        return res.status(400).send({ error: 'invalid user.' });
    }

    Cart
        .findOne({ uid: user.uid })
        .populate({
            path: 'cart_prod',            populate: {
                path: 'cat'
            }
        })
        .exec(function (err, cart) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            if (cart.products.length > 0) {
                let products = [];
                let deleted = [];
                for (let i = 0; i < cart.cart_prod.length; i++) {
                    let element = {
                        count: cart.products[i].count,
                        info: cart.cart_prod[i]
                    };
                    products.push(element);
                }

                if (cart.cart_prod.length !== cart.products.length) {
                    for (let i = 0; i < cart.products.length; i++) {
                        let exists = false;
                        for (let j = 0; j < cart.cart_prod.length; j++) {
                            if (cart.products[i].pid === cart.cart_prod[j].pid) {
                                exists = true;
                            }
                        }
                        if (exists === false) {
                            deleted.push(cart.products[i].pid);
                        }
                    }

                    Cart.update({ 'uid': user.uid }, {
                        $pull: {
                            products: {
                                pid: deleted
                            }
                        }
                    }, function (err) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                    });

                }

                return res.json(products);
            }

            return res.json({ "cart": "listed" });
        });
};

exports.emptyCart = (req, res, next) => {
    const user = req.profile;

    if (!user) {
        return res.status(400).send({ error: 'invalid user.' });
    }

    Cart.update({ 'uid': user.uid }, {
        $set: {
            products: []
        }
    }, function (err) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
    });

    return res.json({ "cart": "Empty-ed" });
};

exports.addCart = (req, res, next) => {
    const user = req.profile;

    if (!user) {
        return res.status(400).send({ error: 'invalid user.' });
    }

    const productId = req.body.productId;

    if (!productId) {
        return res.status(400).send({ error: 'invalid product.' });
    }

    Product
        .findOne({ pid: productId })        .exec(function (err, product) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            if (product) {
                Cart
                    .findOne({ uid: user.uid })
                    .populate({ path: 'cart_prod' })
                    .exec(function (err, cart) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }

                        if (cart) {
                            const filtered = cart.products.filter(function (elem) {
                                if (elem.pid === product.pid) {
                                    return elem;
                                }
                            });

                            if (filtered.length <= 0) {
                                Cart.findOneAndUpdate({ '_id': cart._id }, {
                                    $addToSet: {
                                        products: {
                                            pid: product.pid,
                                            count: 1
                                        }
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
                            return res.json({ "cart": "added" });
                        }
                    });
            }
        });
};

exports.updateCart = (req, res, next) => {
    const user = req.profile;

    if (!user) {
        return res.status(400).send({ error: 'invalid user.' });
    }

    const productId = req.body.productId;
    const new_quantity = req.body.new_count;

    if (!productId) {
        return res.status(400).send({ error: 'invalid product.' });
    }

    if (!new_quantity) {
        return res.status(400).send({ error: 'invalid new quantity.' });
    }

    Cart
        .findOneAndUpdate({ "uid": user.uid, "products.pid": productId },
            { "$set": { "products.$.count": new_quantity } }, { new: true })
        .populate({
            path: 'cart_prod',
            select: "-photo",
            populate: {
                path: 'cat'
            }
        })
        .exec(function (err, cart) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            if (cart.products.length > 0) {
                let products = [];
                for (let i = 0; i < cart.products.length; i++) {
                    let element = {
                        count: cart.products[i].count,
                        info: cart.cart_prod[i]
                    };
                    products.push(element);
                }

                return res.json(products);
            }
            return res.json({ "cart": "updated" });
        });
};

exports.removeCart = (req, res, next) => {
    const user = req.profile;

    if (!user) {
        return res.status(400).send({ error: 'invalid user.' });
    }

    const productId = req.body.productId;

    if (!productId) {
        return res.status(400).send({ error: 'invalid product.' });
    }

    Product
        .findOne({ pid: productId })
        .select("-photo")
        .exec(function (err, product) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            if (product) {
                Cart
                    .findOne({ uid: user.uid })
                    .populate({ path: 'cart_prod' })
                    .exec(function (err, cart) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }

                        if (cart) {
                            const filtered = cart.products.filter(function (elem) {
                                if (elem.pid === product.pid) {
                                    return elem;
                                }
                            });

                            if (filtered.length == 1) {
                                Cart.update({ 'uid': user.uid }, {
                                    $pull: {
                                        products: {
                                            pid: product.pid
                                        }
                                    }
                                }, function (err) {
                                    if (err) {
                                        return res.status(400).json({
                                            error: errorHandler(err)
                                        });
                                    }
                                });
                            }
                            return res.json({ "cart": "removed" });
                        }
                    });
            }
        });
};