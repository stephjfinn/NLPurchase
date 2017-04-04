var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    userId: String
});

var User = module.exports = mongoose.model('User', userSchema);