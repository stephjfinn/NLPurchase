var mongoose = require('mongoose'),
    Product = mongoose.model('Product');

exports.clear = function () {
    Product.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Product collection dropped');
        }
        return;
    })
}

exports.all = function (callback) {
    Product.find(function (err, products) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Products found: ' + products);
            callback(products);
        }
    });
};

exports.find = function (queryData, callback) {
    var query = queryBuilder(queryData);
    Product.find(query, function (err, products) {
        if (err) {
            console.log(err);
            callback(null);
        } else if (products.length <= 0) {
            console.log('No products found');
            callback(null);
        } else {
            console.log('Products found: ' + products);
            callback(products);
        }
    });
};

function queryBuilder(queryData) {
    var query = {};
    query.gender = queryData.gender;
    if (queryData.category) {
        query.category = queryData.category;
    }
    if (queryData.colour) {
        query.colour = queryData.colour;
    }
    if (queryData.price) {
        var price = queryData.price*100
        if (queryData.quantifier) {
            if (queryData.quantifier == 'under') {
                query.price = {'$lt': price}
            } else {
                query.price = {'$gt': price}
            }
        } else {
            var less_than = price + 1000;
            var greater_than = price - 1000;
            query.price = {'$gt': greater_than, '$lt': less_than}
        }
    }
    return query;
}

exports.findByProductIdArray = function (productIdArray, callback) {
    Product.find({'_id': { $in: productIdArray}}, function (err, products) {
        if (err) {
            console.log(err);
            callback(null);
        } else if (products.length <= 0) {
            console.log('No products found');
            callback(null);
        } else {
            console.log('Products found: ' + products);
            callback(products);
        }
    });
};

exports.insert = function (item, callback) {
    Product.create({
        gender: item.gender,
        category: item.category,
        colour: item.colour,
        title: item.title,
        subcategory: item.subcategory,
        pictureURL: item.url,
        price: item.price
    },
        function (err, product) {
            if (err) {
                console.log(err);
            } else {
                //console.log("Product created: " + product);
                callback();
            }
        })
}