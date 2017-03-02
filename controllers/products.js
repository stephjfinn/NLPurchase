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
                console.log("Product created: " + product);
                callback();
            }
        })
}

/*exports.all = function () {
    Product.create({
        Country: "England",
        GroupName: "D",
        CreatedOn: Date.now()
    }, function (err, team) {
        var strOutput;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        if (err) {
            console.log(err);
            strOutput = 'Oh dear, we\'ve got an error';
        } else {
            console.log('Team created: ' + team);
            strOutput = team.Country + ' created in Group ' + team.GroupName + '\nat ' + team.CreatedOn;
        }
        res.write(strOutput);
        res.end();
    });
};*/