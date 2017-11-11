const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

const Product = require('../models/Product');
const Order = require('../models/Order');

/* GET home page. */
router.get('/', function(req, res, next) {
    const successMsg = req.flash('success')[0];
    Product.find(function(err, docs) {
        let productChunks = [];
        let chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', { 
            title: 'Shopping Cart', 
            products: productChunks,
            successMsg: successMsg,
            noMessages: !successMsg
        });
    });
});

router.get('/add-to-cart/:id', function(req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        // console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/reduce/:id', function(req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    const cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice 
    });
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    let errMsg = req.flash('error')[0];
    res.render('shop/checkout', {
        total: cart.totalPrice,
        errMsg: errMsg,
        noError: !errMsg
    });
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    console.log(process.env.SECRET_KEY);
    const stripe = require("stripe")(
        process.env.SECRET_KEY
    );
    
    stripe.charges.create({
        amount: cart.totalPrice * 100, // cents
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test charge."
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        // console.log(req.user);
        const order = new Order({
            user: req.user,
            cart: cart,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            address_line1: req.body.address1,
            paymentId: charge.id,
            address_line2: req.body.address2,
            address_city: req.body.city,
            address_state: req.body.state,
            address_zip: req.body.zip,
            address_country: req.body.country
        });
        order.save(function(err, result) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/');
        });
    });
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
