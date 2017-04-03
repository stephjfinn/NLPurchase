var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    gender: String,
    category: String,
    colour: String,
    title: String,
    subcategory: String,
    pictureURL: String,
    price: Number
});

var Product = module.exports = mongoose.model('Product', productSchema);