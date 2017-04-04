var builder = require('botbuilder');
var emoji = require('node-emoji');

exports.getGreetingAttachment = function (session, greeting) {
    var card = new builder.HeroCard(session)
        .text(greeting)
        .buttons([
            builder.CardAction.postBack(session, 'search', emoji.emojify('Help me shop :mag:')),
            builder.CardAction.postBack(session, 'inspiration', emoji.emojify('Inspire me! :bulb:'))
            //builder.CardAction.postBack(session, 'style profile', emoji.emojify('Style profile :memo:'))
        ]);
    var msg = new builder.Message(session).attachments([card]);
    return msg;
};

exports.getFeedbackAttachment = function (session, text) {
    var card = new builder.HeroCard(session)
        .text(text)
        .buttons([
            builder.CardAction.openUrl(session, 'https://goo.gl/forms/NyboP9fu8pBXbesf2', emoji.emojify('Give Feedback :memo:'))
        ]);
    var msg = new builder.Message(session).attachments([card]);
    return msg;
};

exports.getColourAttachment = function (session, text) {
    var card = new builder.HeroCard(session)
        .text(text)
        .buttons([
            builder.CardAction.openUrl(session, 'https://goo.gl/forms/NyboP9fu8pBXbesf2', emoji.emojify('Give Feedback :memo:'))
        ]);
    var msg = new builder.Message(session).attachments([card]);
    return msg;
};

exports.getCardsAttachments = function (session, products) {
    var cards = [];
    var count = 9;

    if (products.length < 9) {
        count = products.length;
    }

    function encodeQueryData(data) {
        let ret = [];
        for (let d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        return ret.join('&');
    }

    for (var i = 0; i < count; i++) {
        var productInfo = {
            //'name': products[i].colour + products[i].subcategory,
            'name': products[i].title,
            'reference': session.message.address.user.id,
            'product_id': products[i]._id,
            'amount': products[i].price
        };
        var price = products[i].price / 100;
        var queryString = encodeQueryData(productInfo);
        var newcard = new builder.HeroCard(session)
            .title(products[i].title)
            .subtitle("$" + price)
            .images([
                builder.CardImage.create(session, products[i].pictureURL)
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://nlpurchase.paperplane.io/index.html?' + queryString, 'Buy now'),
                //builder.CardAction.postBack(session, 'build', 'Build an outfit'),
                builder.CardAction.postBack(session, 'add favourites product_id ' + products[i]._id, emoji.emojify(':heart:'))
            ])
        cards.push(newcard)
    }
    return cards;
}

exports.getTransactionCardsAttachments = function (session, products) {
    var cards = [];
    var count = 9;

    if (products.length < 9) {
        count = products.length;
    }

    for (var i = 0; i < count; i++) {
        var price = products[i].price / 100;
        var newcard = new builder.HeroCard(session)
            .title(products[i].title)
            .subtitle("$" + price)
            .images([
                builder.CardImage.create(session, products[i].pictureURL)
            ])
            .buttons([
                builder.CardAction.postBack(session, 'add favourites product_id ' + products[i]._id, emoji.emojify(':heart:'))
            ])
        cards.push(newcard)
    }
    return cards;
}

exports.getFavouriteCardsAttachments = function (session, products) {
    var cards = [];
    var count = 9;

    if (products.length < 9) {
        count = products.length;
    }

    function encodeQueryData(data) {
        let ret = [];
        for (let d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        return ret.join('&');
    }

    for (var i = 0; i < count; i++) {
        var productInfo = {
            //'name': products[i].colour + products[i].subcategory,
            'name': products[i].title,
            'reference': session.message.address.user.id,
            'product_id': products[i]._id,
            'amount': products[i].price
        };
        var price = products[i].price / 100;
        var queryString = encodeQueryData(productInfo);
        var newcard = new builder.HeroCard(session)
            .title(products[i].title)
            .subtitle("$" + price)
            .images([
                builder.CardImage.create(session, products[i].pictureURL)
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://nlpurchase.paperplane.io/index.html?' + queryString, 'Buy now'),
                //builder.CardAction.postBack(session, 'build', 'Build an outfit'),
                builder.CardAction.postBack(session, 'remove favourites product_id ' + products[i]._id, emoji.emojify('Remove :broken_heart:'))
            ])
        cards.push(newcard)
    }
    return cards;
}

exports.getKeywordsCardsAttachments = function (trendWheel, session) {
    var cards = [];

    for (var i = 0; i < trendWheel.length; i++) {
        var newcard = new builder.HeroCard(session)
            .title(trendWheel[i].title)
            .subtitle(trendWheel[i].subtitle)
            .images([
                builder.CardImage.create(session, trendWheel[i].url)
            ])
            .buttons([
                builder.CardAction.postBack(session, trendWheel[i].postBack, emoji.emojify('Search the trend :fire:'))
            ])
        cards.push(newcard)
    }

    return cards;
}

exports.getQuickReplies = function (session, message, replies) {
    var count = replies.length;
    var quickreplies = [];

    for (var i = 0; i < count; i++) {
        var newreply = {
            "content_type": "text",
            "title": replies[i],
            "payload": replies[i]
        };
        quickreplies.push(newreply);
    }

    let response = new builder.Message(session)
        .text(message)
        .sourceEvent({
            facebook: {
                "quick_replies": quickreplies
            }
        })
    return response;
}