var mongoose = require('mongoose'),
    Transaction = mongoose.model('Transaction');

exports.clear = function () {
    Transaction.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Transaction collection dropped');
        }
        return;
    })
}

exports.all = function (callback) {
    Transaction.find(function (err, transactions) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Transactions found: ' + transactions);
            callback(transactions);
        }
    });
};

exports.find = function (queryData, callback) {
    var query = queryBuilder(queryData);
    Transaction.find(query, function (err, transactions) {
        if (err) {
            console.log(err);
            callback(null);
        } else if (transactions.length <= 0) {
            console.log('No transactions found');
            callback(null);
        } else {
            console.log('Transactions found: ' + transactions);
            callback(transactions);
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

exports.insert = function (transactionData, callback) {
    Transaction.create({
        userId: transactionData.userId,
        productId: transactionData.productId
    },
        function (err, transaction) {
            if (err) {
                console.log(err);
            } else {
                //console.log("Transaction created: " + transaction);
                callback();
            }
        })
}