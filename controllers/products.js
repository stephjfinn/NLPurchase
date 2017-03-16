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

exports.find = function (gender, category, colour, callback) {
    Product.find({ "gender":gender, "colour":colour, "category":category }, function (err, products) {
        if (err) {
            console.log(err);
            return;
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