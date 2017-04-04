var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.clear = function () {
    User.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('User collection dropped');
        }
        return;
    })
}

exports.insert = function (userId, callback) {
    User.create({
        userId: userId
    },
        function (err, user) {
            if (err) {
                console.log(err);
            } else {
                //console.log("User created: " + user);
                callback();
            }
        })
}
