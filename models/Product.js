const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

const productSchema = new Schema({
    imagePath: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Product', productSchema);