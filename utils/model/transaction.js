var mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
    userId: String,
    productId: String
});

var Transaction = module.exports = mongoose.model('Transaction', transactionSchema);