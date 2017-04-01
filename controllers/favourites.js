var mongoose = require('mongoose'),
    Favourite = mongoose.model('Favourite');

exports.clear = function () {
    Favourite.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Favourite collection dropped');
        }
        return;
    })
}

exports.all = function (callback) {
    Favourite.find(function (err, favourites) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Favourites found: ' + favourites);
            callback(favourites);
        }
    });
};

exports.find = function (queryData, callback) {
    var query = queryBuilder(queryData);
    Favourite.find(query, function (err, favourites) {
        if (err) {
            console.log(err);
            callback(null);
        } else if (favourites.length <= 0) {
            console.log('No favourites found');
            callback(null);
        } else {
            console.log('Favourites found: ' + favourites);
            callback(favourites);
        }
    });
};

function queryBuilder(queryData) {
    var query = {};
    query.userId = queryData.userId;
    if (queryData.productId) {
        query.productId = queryData.productId;
    }
    return query;
}

exports.insert = function (favouriteData, callback) {
    Favourite.create({
        userId: favouriteData.userId,
        productId: favouriteData.productId
    },
        function (err, favourite) {
            if (err) {
                console.log(err);
            } else {
                //console.log("Favourite created: " + favourite);
                callback();
            }
        })
}

exports.delete = function (favouriteData, callback) {
    Favourite.remove({
        userId: favouriteData.userId,
        productId: favouriteData.productId
    },
        function (err, favourite) {
            if (err) {
                console.log(err);
            } else {
                //console.log("Favourite deleted: " + favourite);
                callback();
            }
        })
}