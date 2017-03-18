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
var setFbMenus = require('./setFbMenus');
var fs = require('fs');

var womenShoes = categoryKeys.womenShoes;
var menShoes = categoryKeys.menShoes;
var womenClothing = categoryKeys.womenClothing;
var menClothing = categoryKeys.menClothing;
var trends = categoryKeys.trends;
var occasions = categoryKeys.occasions;

/*SET FACEBOOK MENU THINGS*/
//setFbMenus.setAllMenus();

//drop collection
/*product.clear();*/

//return all products
/*product.all(function(products) {
    console.log(products);
})*/

//CLEARING AND REINSERTING PRODUCTS - CURRENTLY UPDATE IS NOT NEEDED
//drop existing product table
/*product.clear();

//making ebay calls
//insert.doInsertion(womenShoes, 'womenShoes', function (results) {
//    console.log(results);
//    insert.doInsertion(menShoes, 'menShoes', function (results) {
//      console.log(results);
insert.doInsertion(womenClothing, 'womenClothing', function (results) {
    console.log(results);
    insert.doInsertion(menClothing, 'menClothing', function (results) {
        console.log(results);
        insert.doAltInsertion('1059', trends, function (results) {
            console.log(results);
            insert.doAltInsertion('15724', trends, function (results) {
                console.log(results);
                insert.doAltInsertion('1059', occasions, function (results) {
                    console.log(results);
                    insert.doAltInsertion('15724', occasions, function (results) {
                        console.log(results);
                    })
                })
            })
        })
    })
})
//    })
//});
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
    randomGreeting += " Choose from the options below or try a sentence (e.g. \"I'm looking for a blue dress to wear to work\")";
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
                if (data.entities.intent != null) {
                    switch (data.entities.intent[0].value) {
                        case "greeting":
                            var reply = getGreeting(session);
                            session.send(reply);
                            break;
                        case "search":
                            session.beginDialog('/search', data);
                            break;
                        case "identity":
                            var reply = "I am NLPurchase, your free shopping assistant! :smiley: " +
                                "I live on the internet in order to personally aid your fashion needs. " +
                                "Give me your colours, patterns, events, and I will help you fill your perfect custom wardrobe :ok_hand:";
                            session.send(reply);
                            break;
                        case "joke":
                            var jokes = ["I only have two complaints in life: not enough closet space and nothing to wear.",
                                "A husband calls his programmer wife and tells her, \"While you're out, buy some milk.\" "
                                + "She never returns.",
                                "A SQL query goes into a bar, walks up to two tables and asks, \"Can I join you?\"",
                                "If at first you don’t succeed; call it version 1.0."];
                            session.send(jokes);
                            break;
                        case "restart":
                            var reply = "No problem, let's start fresh."
                            session.send(reply);
                            reply = getGreeting(session);
                            session.send(reply);
                        case "inpiration":
                            if (data.entities.keyword != null) {
                                session.beginDialog('/displayCarousel', data.entities.keyword[0].value);
                            } else {
                                session.beginDialog('/inspiration');
                            }
                        case "help":
                            session.beginDialog('/help');
                        case "formality":
                            var reply = getAttachment.getGreetingAttachment(session, emoji.emojify("I feel energised and ready to shop :muscle: Let's get started!"))
                            session.send(reply);
                    }
                } else {
                    var reply = ["I'm sorry, could you say that again?",
                        "I don't quite get what you mean by that, could you repeat it?",
                        "Can you say that again for me please?"]
                    session.send(reply);
                }
            })
            .catch(console.error);
    } else {
        var reply = "I hope that means you like it! :smile:";
        reply = emoji.emojify(reply);
        session.send(reply);
    }
});

bot.beginDialogAction('search', '/search', { matches: /^search/i });
/*bot.dialog('/search', function (session) {
    session.sendTyping();
    session.send("Search activated");
    session.endDialog();
});*/

/*bot.dialog('/search', [
    function (session, data) {
        session.sendTyping();
        session.send("Great! Let's get started.");

        if (data.entities['category'] != 'undefined') {
            session.dialogData.search.category = entities.category[0].value;
        }
        if (data.entities['gender'] != 'undefined') {
            session.dialogData.search.gender = entities.gender[0].value;
        }
        if (data.entities['colour'] != 'undefined') {
            session.dialogData.search.colour = entities.colour[0].value;
        }

        //if we don't have a gender
        if (session.dialogData.gender == 'undefined') {
            builder.Prompts.choice(session, "Are we shopping for a man or a woman today?", "man|woman");
        } else {
            next()
        }

        if (session.userData.gender == 'undefined') {
        } else if (session.userData.category == 'undefined') {
            builder.Prompts.choice(session, "In which category? Feel free to type your own.", "coats|pants|sweaters|casual shirts");
        } else if (session.userData.colour == 'undefined') {
            builder.Prompts.choice(session, "What colour were you thinking? Or enter your own below.", "black|silver|orange|multicolour|beige");
        } else {
            //call DB with entities and build carousel
        }
    },
    function (session, results) {
        session.sendTyping();
        if (session.dialogData.gender == 'undefined') {
            session.dialogData.gender = response.results.entity;
        }
        if (session.dialogData.category == 'undefined') {
            builder.Prompts.choice(session, "In which category? Feel free to type your own.", "dresses|jeans|skirts|hoodies");
        } else {
            next();
        }
        if (session.userData.gender == 'undefined') {
            session.userData.gender = results.response.entity;
        } else if (session.userData.category == 'undefined') {
            session.userData.category = results.response.entity
        }
        if (session.userData.gender == 'man') {
        } else if (session.userData.gender == 'woman') {
            builder.Prompts.choice(session, "In which category? Feel free to type your own.", "dresses|jeans|skirts|hoodies");
        } else {
            session.send("Quitting search dialog.");
            session.endDialog();
            session.userData = null;
        }
    },
    function (session, results) {
        session.sendTyping();
        if (session.dialogData.category == 'undefined') {
            session.dialogData.category = response.results.entity;
        }
    },
    function (session, results) {
        session.sendTyping();
        client.message(session.message.text, {})
            .then((data) => {
                if (data.entities['colour'] != 'undefined') {
                    session.userData.colour = data.entities.colour[0].value;


                } else {
                    session.send("Quitting search dialog.");
                    session.endDialog();
                }
            })
            .catch(console.error);
    },
]);*/

bot.dialog('/search', [
    function (session, data) {
        session.sendTyping();
        if (typeof data !== 'undefined') {
            if (typeof data.entities !== 'undefined') {
                session.dialogData.search = {};
                if (typeof data.entities['category'] !== 'undefined') {
                    session.dialogData.search.category = data.entities.category[0].value;
                }
                if (typeof data.entities['gender'] !== 'undefined') {
                    session.dialogData.search.gender = data.entities.gender[0].value;
                }
                if (typeof data.entities['colour'] !== 'undefined') {
                    session.dialogData.search.colour = data.entities.colour[0].value;
                }
            }
        }
        session.beginDialog('/ensureSearchEntities', session.dialogData.search);
    },
    function (session, results) {
        session.sendTyping();
        session.dialogData.search = results.response;
        product.find(session.dialogData.search.gender, session.dialogData.search.category, session.dialogData.search.colour, function (products) {
            if (products !== null) {
                var sendReply = function (reply) {
                    session.send(emoji.emojify("How 'bout these? :grin:"));
                    setTimeout(function () {
                        session.send(reply);
                    }, 500);
                    session.endDialog();
                }
                var getReply = function (cards, callback) {
                    var reply = new builder.Message(session)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(cards);
                    callback(reply);
                }
                var getCards = function (callback) {
                    var cards = getAttachment.getCardsAttachments(products);
                    callback(cards, sendReply);
                };
                getCards(getReply);
            } else {
                session.send(emoji.emojify("I'm sorry, we have no items matching those criteria :slightly_frowning_face:"));
                session.endDialog();
            }
        })
    }
]);

bot.dialog('/ensureSearchEntities', [
    function (session, args, next) {
        session.sendTyping();
        session.dialogData.search = args || {};
        if (!session.dialogData.search.gender) {
            builder.Prompts.choice(session, "Are we shopping for a man or a woman?", "man|woman");
        } else {
            next();
        }
    },
    function (session, results, next) {
        session.sendTyping();
        if (results.response) {
            session.dialogData.search.gender = results.response.entity;
        }
        if (!session.dialogData.search.category) {
            if (session.dialogData.search.gender == "woman") {
                builder.Prompts.choice(session, "In which category? Feel free to type your own.", "dresses|jeans|skirts|hoodies");
            } else {
                builder.Prompts.choice(session, "In which category? Feel free to type your own.", "coats|pants|sweaters|casual shirts");
            }
        } else {
            next();
        }
    },
    function (session, results, next) {
        session.sendTyping();
        if (results.response) {
            session.dialogData.search.category = results.response.entity;
        }
        if (!session.dialogData.search.colour) {
            builder.Prompts.choice(session, "What colour were you thinking? Or enter your own below.", "Black|Silver|Orange|Multi-Color|Beige");
        } else {
            next();
        }
    },
    function (session, results) {
        session.sendTyping();
        if (results.response) {
            session.dialogData.search.colour = results.response.entity;
        }
        session.endDialogWithResult({ response: session.dialogData.search });
    }
]);

bot.beginDialogAction('inspiration', '/inspiration', { matches: /^inspiration/i });
bot.dialog('/inspiration', [
    function (session) {
        session.sendTyping();
        builder.Prompts.choice(session, "Do you want to see what's trending for men or women?", "men|women");
    },
    function (session, results) {
        session.sendTyping();
        if (results.response.entity == 'men') {
            session.userData.gender = 'man';
        } else {
            session.userData.gender = 'woman';
        }
        var sendReply = function (reply) {
            session.send(emoji.emojify("No problemo, just check out these hot trends for Spring/Summer 2017!"));
            setTimeout(function () {
                session.send(reply);
                session.endDialog();
            }, 500);
        }
        var getReply = function (cards, callback) {
            var reply = new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(cards);
            callback(reply);
        }
        var getCards = function (callback) {
            var cards = getAttachment.getKeywordsCardsAttachments(categoryKeys.trendWheel, session);
            callback(cards, sendReply);
        };
        getCards(getReply);
    }
]);

bot.beginDialogAction('style profile', '/styleProfile', { matches: /^style profile/i });
bot.dialog('/styleProfile', function (session) {
    session.sendTyping();
    session.send("Style Profile activated");
    session.endDialog();
});

bot.beginDialogAction('reset', '/reset', { matches: /^reset/i });
bot.dialog('/reset', function (session) {
    session.send("Conversation reset");
    session.clearDialogStack();
});

bot.dialog('/displayCarousel', function (session, keyword) {
    session.sendTyping();
    product.findAlt(session.userData.gender, keyword, function (products) {
        if (products !== null) {
            var sendReply = function (reply) {
                session.send(emoji.emojify("How 'bout these? :grin:"));
                setTimeout(function () {
                    session.send(reply);
                }, 500);
                session.endDialog();
            }
            var getReply = function (cards, callback) {
                var reply = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(cards);
                callback(reply);
            }
            var getCards = function (callback) {
                var cards = getAttachment.getCardsAttachments(products);
                callback(cards, sendReply);
            };
            getCards(getReply);
        } else {
            session.send(emoji.emojify("I'm sorry, we have no items matching those criteria :slightly_frowning_face:"));
            session.endDialog();
        }
    })
    session.endDialog();
});