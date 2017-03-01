var db = require('../db')

exports.all = function () {
    var collection = db.get().collection('products')

    collection.find().toArray(function (err, docs) {
        if (docs) return docs
        else return err
    })
}

/*router.get('/recent', function (req, res) {
    var collection = db.get().collection('comments')

    collection.find().sort({ 'date': -1 }).limit(100).toArray(function (err, docs) {
        res.render('comments', { comments: docs })
    })
})*/