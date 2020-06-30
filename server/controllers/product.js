const _ = require("lodash");
const uuidv1 = require("uuid/v1");
const path = require('path');
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

const multer = require('multer');
const fs = require('fs-extra');

exports.productById = (req, res, next, pid) => {
    Product.findOne({ pid: pid })
        .populate("cat")
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.product = product;
            next();
        });
};

exports.read = (req, res) => {
    return res.json(req.product);
};

exports.create = (req, res) => {
    var fileFilter = function (req, file, cb) {
        var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];

        if (_.includes(allowedMimes, file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
        }
    };

    let upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, callback) => {
                let userId = req.params.userId;
                let pathToSave = `./public/uploads/${userId}/store`;
                fs.mkdirsSync(pathToSave);
                callback(null, pathToSave);
            },
            filename: (req, file, callback) => {
                callback(null, uuidv1() + path.extname(file.originalname));
            }
        }),
        limits: {
            files: 5, fileSize: 5 * 1024 * 1024,
        },
        fileFilter: fileFilter
    }).array('photo');

    upload(req, res, function (err) {
        if (err) {
            req.files.forEach(function (file) {
                fs.unlink("./" + file.path);
            });

            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }

        const {
            name,
            description,
            price,
            cid,
            quantity,
            shipping
        } = req.body;

        if (
            !name ||
            !description ||
            !price ||
            !cid ||
            !quantity ||
            !shipping
        ) {
            req.files.forEach(function (file) {
                fs.unlink("./" + file.path);
            });

            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let product = new Product(req.body);

        if (req.files.length > 0) {
            let filePath = [];
            req.files.forEach(function (file, index) {
                filePath.push("/" + file.path);
            });
            product.photo = filePath;
        } else {
            product.photo = undefined;
        }

        product.save((err, result) => {
            if (err) {
                req.files.forEach(function (file) {
                    fs.unlink("./" + file.path);
                });

                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.remove = (req, res) => {
    let product = req.product; product.photo.forEach(function (filename) {
        fs.unlink("." + filename);
    });

    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    });
};

exports.update = (req, res) => {
    var fileFilter = function (req, file, cb) {
        var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];

        if (_.includes(allowedMimes, file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
        }
    };

    let upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, callback) => {
                let userId = req.params.userId;
                let pathToSave = `./public/uploads/${userId}/store`;
                fs.mkdirsSync(pathToSave);
                callback(null, pathToSave);
            },
            filename: (req, file, callback) => {
                callback(null, uuidv1() + path.extname(file.originalname));
            }
        }),
        limits: {
            files: 5, fileSize: 5 * 1024 * 1024,
        },
        fileFilter: fileFilter
    }).array('photo');

    upload(req, res, function (err) {
        if (err) {
            req.files.forEach(function (file) {
                fs.unlink("./" + file.path);
            });

            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }

        const {
            name,
            description,
            price,
            cid,
            quantity,
            shipping,
            deletePhoto
        } = req.body;

        if (
            !name ||
            !description ||
            !price ||
            !cid ||
            !quantity ||
            !shipping ||
            !deletePhoto
        ) {
            req.files.forEach(function (file) {
                fs.unlink("./" + file.path);
            });

            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let product = req.product;
        product = _.extend(product, req.body);

        if (deletePhoto === "true") {
            req.product.photo.forEach(function (filename) {
                fs.unlink("." + filename);
            });

            product.photo = undefined;

            Product.update(
                { pid: product.pid },
                { $set: product, $unset: { photo: undefined } },
                (err, product) => {
                    if (err) {
                        req.files.forEach(function (file) {
                            fs.unlink("./" + file.path);
                        });

                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json(product);
                }
            );

        } else if (deletePhoto === "false" && req.files.length > 0) {
            req.product.photo.forEach(function (filename) {
                fs.unlink("." + filename);
            }); let filePath = [];
            req.files.forEach(function (file, index) {
                filePath.push("/" + file.path);
            });
            product.photo = filePath;

            Product.update(
                { pid: product.pid },
                { $set: product },
                (err, product) => {
                    if (err) {
                        req.files.forEach(function (file) {
                            fs.unlink("./" + file.path);
                        });

                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json(product);
                }
            );
        } else if (deletePhoto === "false" && req.files.length === 0) {
            Product.update(
                { pid: product.pid },
                { $set: product },
                (err, product) => {
                    if (err) {
                        req.files.forEach(function (file) {
                            fs.unlink("./" + file.path);
                        });

                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json(product);
                }
            );
        }
    });
};

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "pid";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find().populate("cat")
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(products);
        });
};

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find({ pid: { $ne: req.product.pid }, cid: req.product.cid })
        .limit(limit)
        .populate("cat", "cid name")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }

            res.json(products);
        });
};

exports.listCategories = (req, res) => {
    Product.distinct("cid", {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: "Categories not found"
            });
        }
        res.json(categories);
    });
};

exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else if (key === "name") {
                findArgs[key] = new RegExp(req.body.filters[key], 'i');
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs).sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(data);
        });
};

exports.listSuggestion = (req, res) => {
    const query = {};
    if (req.query.search) {
        const escapedValue = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.name = new RegExp('^' + escapedValue, 'i');

        Product.find(query)
            .select("name -_id")
            .limit(10)
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(data);
            })
    } else {
        res.json();
    }
};
exports.listSearch = (req, res) => {
    const query = {}; if (req.query.search) {
        query.name = { $regex: req.query.search, $options: "i" }; if (req.query.cid && req.query.cid != "All") {
            query.cid = req.query.cid;
        } Product.find(query, (err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(products);
        }).select("-photo");
    }
};

exports.decreaseQuantity = (req, res, next) => {
    let bulkOps = req.body.order.products.map(item => {
        return {
            updateOne: {
                filter: { pid: item.info.pid },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        };
    });

    Product.bulkWrite(bulkOps, {}, (error, products) => {
        if (error) {
            return res.status(400).json({
                error: "Could not update product"
            });
        }
        next();
    });
};
