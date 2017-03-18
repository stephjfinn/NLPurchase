var builder = require('botbuilder');
var emoji = require('node-emoji');

exports.getGreetingAttachment = function(session, greeting) {
     var card = new builder.HeroCard(session)
            .text(greeting)
            .buttons([
                builder.CardAction.postBack(session, 'search', emoji.emojify('Let\'s search :mag:')),
                builder.CardAction.postBack(session, 'inspiration', emoji.emojify('Inspire me! :bulb:')),
                builder.CardAction.postBack(session, 'style profile', emoji.emojify('Style profile :memo:'))
            ]);
    var msg = new builder.Message(session).attachments([card]);
    return msg;
};

exports.getCardsAttachments = function (products, session) {
    var cards = [];
    var count = 9;

    if (products.length < 9) {
        count = products.length;
    }

    for (var i = 0; i < count; i++) {
        var newcard = new builder.HeroCard(session)
            .title(products[i].title)
            .images([
                builder.CardImage.create(session, products[i].pictureURL)
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://google.ie', 'Buy'),
                builder.CardAction.openUrl(session, 'https://google.ie', 'More like this'),
                builder.CardAction.openUrl(session, 'https://google.ie', emoji.emojify(':heart:'))
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