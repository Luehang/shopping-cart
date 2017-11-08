const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

const Order = require('../models/Order');
const Cart = require('../models/Cart');

const csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
    Order.find({user: req.user}, null, { $sort: -1 }, function(err, orders) {
        if (err) {
            return res.write('Error.');
        }
        orders = orders.reverse();
        let cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
    });
});

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.get('/signup', function(req, res, next) {
    const messages = req.flash('error');
    res.render('user/signup', {
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/signin', function(req, res, next) {
    const messages = req.flash('error');
    res.render('user/signin', {
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}