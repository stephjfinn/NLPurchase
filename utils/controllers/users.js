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

exports.insert = function (userId, userName, callback) {
    User.create({
        userId: userId,
        userName: userName
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

exports.find = function (userID, callback) {
    User.find({"user_id":userID }, function (err, users) {
        if (err) {
            console.log(err);
            callback(null);
        } else if (users.length <= 0) {
            console.log('No users found');
            callback(null);
        } else {
            console.log('Users found: ' + users);
            callback(users);
        }
    });
};