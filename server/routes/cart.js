const express = require("express");
const router = express.Router();

const {
    listCart,
    addCart,
    removeCart,
    updateCart,
    emptyCart,
    listGuestCart,
    countCart
} = require("../controllers/search-cart");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");router.post('/guest-cart', listGuestCart)
router.get('/list-cart/:userId', requireSignin, isAuth, listCart);
router.get('/count-cart/:userId', requireSignin, isAuth, countCart)
router.post('/add-cart/:userId', requireSignin, isAuth, addCart);
router.put('/remove-cart/:userId', requireSignin, isAuth, removeCart);
router.delete('/empty-cart/:userId', requireSignin, isAuth, emptyCart);
router.put('/update-cart/:userId', requireSignin, isAuth, updateCart);
router.param("userId", userById);
module.exports = router;
