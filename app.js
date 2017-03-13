//NOTE TO SELF: shift + alt + f = format indentation
var db = require('./db');

var product = require('./controllers/products');
var restify = require('restify');
var builder = require('botbuilder');
const { Wit, log } = require('node-wit');
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 80, function () {
    console.log('%s listening to %s', server.name, server.url);
});
var categoryKeys = require('./categoryKeys');
var async = require('async');
var insert = require('./insertion');
var getAttachment = require('./getAttachment');
var emoji = require('node-emoji');

var womenShoes = categoryKeys.womenShoes;
var menShoes = categoryKeys.menShoes;
var womenClothing = categoryKeys.womenClothing;
var menClothing = categoryKeys.menClothing;

//drop collection
/*product.clear();*/

//return all products
/*product.all(function(products) {
    console.log(products);
})*/

/* //CLEARING AND REINSERTING PRODUCTS - CURRENTLY UPDATE IS NOT NEEDED
//drop existing product table
product.clear();

//making ebay calls
insert.doInsertion(womenShoes, 'womenShoes', function (results) {
    console.log(results);
    insert.doInsertion(menShoes, 'menShoes', function (results) {
        console.log(results);
        insert.doInsertion(womenClothing, 'womenClothing', function (results) {
            console.log(results);
            insert.doInsertion(menClothing, 'menClothing', function (results) {
                console.log(results);
            })
        })
    })
});
*/

//**bot setup

//create chat bot
var connector = new builder.ChatConnector({
    appId: '***REMOVED***',
    appPassword: '***REMOVED***'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

const client = new Wit({
    accessToken: '***REMOVED***',
    actions: {
        send(request, response) {
            return new Promise(function (resolve, reject) {
                console.log(JSON.stringify(response));
                return resolve();
            });
        },
        myAction({ sessionId, context, text, entities }) {
            console.log(`Session ${sessionId} received ${text}`);
            console.log(`The current context is ${JSON.stringify(context)}`);
            console.log(`Wit extracted ${JSON.stringify(entities)}`);
            return Promise.resolve(context);
        }
    },
    logger: new log.Logger(log.DEBUG) // optional
});

function getGreeting(session) {
    function getFirstName(str) {
        if (str.indexOf(' ') === -1)
            return str;
        else
            return str.substr(0, str.indexOf(' '));
    };

    var greetingArray = ["Hi " + getFirstName(session.message.user.name) + ", what can I help you with today?",
    "Hello " + getFirstName(session.message.user.name) + ", I'm NLPurchase!  What can I get you?",
    "Hey " + getFirstName(session.message.user.name) + ", what are you looking for?"];
    var randomIndex = Math.floor(Math.random() * greetingArray.length);
    var randomGreeting = greetingArray[randomIndex];
    randomGreeting = emoji.emojify(randomGreeting);
    return getAttachment.getGreetingAttachment(session, randomGreeting);
}

//bot dialog

// Install logging middleware
bot.use({
    botbuilder: function (session, next) {
        if (/^log on/i.test(session.message.text)) {
            session.userData.isLogging = true;
            session.send('Logging is now turned on');
        } else if (/^log off/i.test(session.message.text)) {
            session.userData.isLogging = false;
            session.send('Logging is now turned off');
        } else {
            if (session.userData.isLogging) {
                console.log('Message Received: ', session.message.text);
            }
            next();
        }
    }
});

bot.dialog('/', function (session) {
    session.sendTyping();
    if (session.message.text != "") {
        client.message(session.message.text, {})
            .then((data) => {
                switch (data.entities.intent[0].value) {
                    case "greeting":
                        var reply = getGreeting(session);
                        session.send(reply);
                        break;
                    case "search":
                        //check if search contains colour, object or gender parameters
                        //if it's missing the gender parameter start getGender dialog & return here
                        //(randomly?) select in mongodb based on parameters

                        var reply;

                        product.all(function (products) {
                            var sendReply = function (reply) {
                                session.send(reply);
                            }
                            var getReply = function (cards, callback) {
                                var reply = new builder.Message(session)
                                    .attachmentLayout(builder.AttachmentLayout.carousel)
                                    .attachments(cards);
                                callback(reply);
                            }
                            var getCards = function (callback) {
                                var cards = getCardsAttachments(products);
                                callback(cards, sendReply);
                            };
                            getCards(getReply);
                        })

                        // create reply with Carousel AttachmentLayout
                        break;
                    case "identity":
                        var reply = "I am NLPurchase, your free shopping assistant! " +
                            "I live on the internet in order to personally aid your fashion needs. " +
                            "Give me your colours, patterns, events and I will help you fill your perfect custom wardrobe.";
                        session.send(reply);
                        break;
                    case "joke":
                        var jokes = ["I have a part-time job helping a one armed typist do capital letters. It's shift work",
                            "I only have two complaints in life: not enough closet space and nothing to wear.",
                            "My friend asked me to help him round up his 37 sheep. I said \"40\".",
                            "A husband says to his programmer wife, \"Go to the store and buy a loaf of bread. If they have eggs, buy a dozen.\" " +
                            "Wife returns with 12 loaves of bread.",
                            "Two cows are grazing in a field. One cow says to the other, \"you ever worry about that mad cow disease?\". " +
                            "The other cow says, \"why would I care? I'm a helicopter!\"",
                            "There are 10 kinds of people in the world: those who know binary, and those who don't.",
                            "What did the Buddhist monk say to the hot dog vendor? \"Make me one with everything.\"",
                            "Guy walks into a bar and orders a fruit punch. Bartender says \"Pal, if you want a punch you'll have to stand in line.\ " +
                            "Guy looks around, but there is no punch line.",
                            "Red sky at night: shepherd’s delight. Blue sky at night: day.",
                            "I spilled spot remover on my dog. Now he's gone.",
                            "You'll never be as lazy as whoever named the fireplace"];
                        session.send(jokes);
                        break;
                }
            })
            .catch(console.error);
    } else {
        //the user has sent a sticker; bot can't respond to those
        var reply = "Well, I hope that's a good thing! :smile:";
        reply = emoji.emojify(reply);
        session.send(reply);
    }
});
