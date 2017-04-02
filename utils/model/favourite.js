var mongoose = require('mongoose');

var favouriteSchema = new mongoose.Schema({
    userId: String,
    productId: String
});

var Favourite = module.exports = mongoose.model('Favourite', favouriteSchema);