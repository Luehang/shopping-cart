const Product = require('../models/Product');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shopping', { useMongoClient: true });

const products = [
    new Product({
        imagePath: "https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png",
        title: 'Gothic Video Game',
        description: 'Awesome Game!!!!',
        price: 10.96
    }),
    new Product({
        imagePath: "https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png",
        title: 'Gothic Video Game',
        description: 'Awesome Game!!!!',
        price: 10.68
    }),
    new Product({
        imagePath: "https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png",
        title: 'Gothic Video Game',
        description: 'Awesome Game!!!!',
        price: 10.57
    }),
    new Product({
        imagePath: "https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png",
        title: 'Gothic Video Game',
        description: 'Awesome Game!!!!',
        price: 10.99
    }),
    new Product({
        imagePath: "https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png",
        title: 'Gothic Video Game',
        description: 'Awesome Game!!!!',
        price: 10.75
    })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
