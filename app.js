//REQUIRES
//require('dotenv').config({ path: './keys.env' })
var db = require('./utils/db');
var wit = require('./utils/wit');
var product = require('./utils/controllers/products');
var transaction = require('./utils/controllers/transactions');
var favourite = require('./utils/controllers/favourites');
var user = require('./utils/controllers/users');
var categoryKeys = require('./utils/categoryKeys');
var getAttachment = require('./utils/getAttachment');
var setFbMenus = require('./fb_menus/setFbMenus');
var insert = require('./utils/insertion');
var restify = require('restify');
var builder = require('botbuilder');
var async = require('async');
var emoji = require('node-emoji');
var fs = require('fs');
const request = require('request');
var client = wit.client();

//BOOLEANS
var fbMenusReset = false;
var dropCollection = false;
var doInserts = false;

//CREATE BOT SERVER
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//OTHER VARIABLES
var womenShoes = categoryKeys.womenShoes;
var menShoes = categoryKeys.menShoes;
var womenClothing = categoryKeys.womenClothing;
var menClothing = categoryKeys.menClothing;
var trends = categoryKeys.trends;
var occasions = categoryKeys.occasions;

//SET FACEBOOK MENUS
if (fbMenusReset == true) {
    setFbMenus.setAllMenus();
}
//DROP EXISTING PRODUCT TABLE FROM DB
if (dropCollection == true) {
    product.clear();
}
//MAKE EBAY CALLS FOR PRODUCTS AND INSERT PRODUCTS INTO DB
if (doInserts == true) {
    insert.doInsertion(womenClothing, 'womenClothing', function (results) {
        console.log(results);
        insert.doInsertion(menClothing, 'menClothing', function (results) {
            console.log(results);
            //search category 'men's clothing' for populating the trend wheels
            insert.doAltInsertion('1059', trends, function (results) {
                console.log(results);
                //search category 'women's clothing' for populating the trend wheels
                insert.doAltInsertion('15724', trends, function (results) {
                    console.log(results);
                })
            })
        })
    })
}

//**BOT SETUP**

//BOT SETUP: INITIALISE CHATBOT
var connector = new builder.ChatConnector({
    appId: process.env.BOTFRAMEWORK_APPID,
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//callbacks exposed for the business website to call on completion/failure of purchase
server.get('/api/callbackOk', function (req, res, next) {
    var query = req._url.query;
    if (query) {
        var userId = getQueryVariable(query, 'userId');
        var productId = getQueryVariable(query, 'productId');
        var transactionData = { 'userId': userId, 'productId': productId };
        transaction.insert(transactionData, function (transactions) {
            console.log("Inserted 1 transaction");
            var receiptArray = {};
            receiptArray.timeStamp = Math.floor(Date.now() / 1000);
            user.find(userId, function (users) {
                if (users != null) {
                    receiptArray.userName = users[0].userName;
                } else {
                    receiptArray.userName = "Missing Value";
                }
                product.findByProductIdArray([productId], function (products) {
                    receiptArray.orderNum = products[0]._id;
                    receiptArray.title = products[0].title;
                    var price = products[0].price / 100;
                    receiptArray.price = price;
                    receiptArray.URL = products[0].pictureURL;
                    sendTextMessage(userId, receiptArray);
                })
            })
            res.status(200);
        })
    } else {
        res.status(400);
    }
    return next();
});
server.get('/api/callbackErr', function (req, res, next) {
    var urlSplit = req.url.split("?");
    if (urlSplit[1]) {
        var user = urlSplit[1];
        sendTextMessage(user, emoji.emojify("I'm sorry, there was an error during processing :sob: Select your product and try again!"));
        res.status(200);
    } else {
        res.status(400);
    }
    return next();
});

function getQueryVariable(query, variable) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            var decoded = decodeURI(pair[1]);
            return decoded.replace("'", "");
        }
    }
    return null;
}

function getWitAnalysis(session, handleDialog) {
    if (session.message.text != "") {
        client.message(session.message.text, {})
            .then((data) => {
                handleDialog(data);
            }).catch(console.error);
    } else {
        var reply = "I hope that's a good thing! :smile:";
        reply = emoji.emojify(reply);
        session.send(reply);
    }
}

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

//**BOT DIALOGS**

bot.dialog('/', function (session) {
    session.sendTyping();
    getWitAnalysis(session, dialogHandler);
    function dialogHandler(data) {
        if (data.entities.intent != null) {
            switch (data.entities.intent[0].value) {
                case "greeting":
                    session.userData = null;
                    session.clearDialogStack();
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
                    session.beginDialog('/joke');
                    break;
                case "restart":
                    var reply = "No problem, let's start fresh."
                    session.send(reply);
                    reply = getGreeting(session);
                    session.send(reply);
                    break;
                case "inspiration":
                    if (data.entities.keyword != null) {
                        session.beginDialog('/displayTrendCarousel', data.entities.keyword[0].value);
                    } else {
                        session.beginDialog('/inspiration');
                    }
                    break;
                case "help":
                    session.beginDialog('/help');
                    break;
                case "formality":
                    var reply = getAttachment.getGreetingAttachment(session, emoji.emojify("My power levels are :100: and I'm ready to shop :muscle: Let's get started!"))
                    session.send(reply);
                    break;
                case "thanks":
                    session.send("No problem, " + getFirstName(session.message.user.name) + "!", emoji.emojify("Glad I could help! :blush:"), emoji.emojify("You are very welcome! :grinning:"));
                    break;
                case "favourites":
                    if (data.entities.trigger != null && data.entities.add_or_remove != null) {
                        //check if "add" or "remove"
                        session.sendTyping();
                        if (data.entities.add_or_remove[0].value == 'add') {
                            var favouriteData = { 'userId': session.message.address.user.id, 'productId': session.message.text.substring(session.message.text.lastIndexOf(" ") + 1) };
                            favourite.insert(favouriteData, function (favourites) {
                                console.log("Inserted 1 favourite");
                                session.send(emoji.emojify("Item added to your favourites! :ok_hand:"));
                            })
                        } else if (data.entities.add_or_remove[0].value == 'remove') {
                            var favouriteData = { 'userId': session.message.address.user.id, 'productId': session.message.text.substring(session.message.text.lastIndexOf(" ") + 1) };
                            favourite.delete(favouriteData, function (favourites) {
                                console.log("Deleted 1 favourite");
                                session.send(emoji.emojify("Item has been removed from your favourites."));
                            })
                        }
                    } else {
                        session.beginDialog('/favourites');
                    }
                    break;
                case "transactions":
                    var queryData = { 'userId': session.message.address.user.id }
                    transaction.find(queryData, function (transactions) {
                        if (transactions !== null) {
                            session.sendTyping();
                            var productIds = [];
                            function getTransactionId(i) {
                                if (i < transactions.length) {
                                    productIds.push(transactions[i].productId);
                                    getTransactionId(i + 1);
                                } else {
                                    product.findByProductIdArray(productIds, function (products) {
                                        var sendReply = function (reply) {
                                            session.send(emoji.emojify("Here are the items you've bought so far: :heart_eyes:"));
                                            setTimeout(function () {
                                                session.send(reply);
                                            }, 500);
                                        }
                                        var getReply = function (cards, callback) {
                                            var reply = new builder.Message(session)
                                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                                .attachments(cards);
                                            callback(reply);
                                        }
                                        var getCards = function (callback) {
                                            var cards = getAttachment.getTransactionCardsAttachments(session, products);
                                            callback(cards, sendReply);
                                        };
                                        getCards(getReply);
                                    })
                                }
                            }
                            getTransactionId(0);
                        } else {
                            session.send(emoji.emojify("You haven't bought anything... yet! :blush:"));
                        }
                    })
                    break;
                case "insult":
                    var reply = "I'm still learning, please be constructive with your criticism! If you'd like to give feedback about me to my human overlord, please press the button below.";
                    session.send(getAttachment.getFeedbackAttachment(session, reply));
                    break;
                case "displayCategories":
                    var options = ["coats", "dresses", "jeans", "jumpsuits", "pants", "shorts", "skirts", "suits", "hoodies", "tshirts", "tops"];
                    session.send(getAttachment.getQuickReplies(session, "No problem, these are all the items I'm stocking at the moment!", options));
                    break;
                case "feedback":
                    var reply = "Please click the button below to leave feedback."
                    session.send(getAttachment.getFeedbackAttachment(session, reply));
                    break;
                case "somethingElse":
                    var reply = "Sure thing! What else can I do for you?"
                    session.send(getAttachment.getGreetingAttachment(session, reply));
                    break;
                case "cancel":
                    session.beginDialog('/cancel');
                    break;
                default:
                    var reply = ["I'm sorry I didn't understand that, could you say that in a different way?",
                        "I don't quite get what you mean, could you rephrase it?",
                        "Can you say that again in a different way for me, please?"]
                    session.send(reply);
            }
        } else if (data.entities.colour || data.entities.category || data.entities.gender) {
            session.beginDialog('/search', data);
        } else {
            var reply = ["I'm sorry I didn't understand that, could you say that in a different way?",
                "I don't quite get what you mean, could you rephrase it?",
                "Can you say that again in a different way for me, please?"]
            session.send(reply);
        }
    }
});

bot.dialog('/searchDefault', function (session, args) {
    session.sendTyping();
    getWitAnalysis(session, dialogHandler);
    function dialogHandler(data) {
        if (data.entities.intent != null) {
            session.replaceDialog("/");
        } else {
            var reply = "I’m sorry, I don’t sell that item...yet!"
            session.send(reply);
            session.replaceDialog("/ensureSearchEntities", args);
        }
    }
})

//bot.beginDialogAction('search', '/search', { matches: /^search/i });
bot.dialog('/search', [
    function (session, data) {
        session.sendTyping();
        if (typeof data !== 'undefined') {
            if (typeof data.entities !== 'undefined') {
                session.dialogData.search = {};
                if (typeof data.entities['category'] !== 'undefined') {
                    session.dialogData.search.category = data.entities.category[0].value;
                    if (session.dialogData.search.category == 'dresses' || session.dialogData.search.category == 'skirts' || session.dialogData.search.category == 'jumpsuits' || session.dialogData.search.category == 'leggings' || session.dialogData.search.category == 'tops') {
                        session.dialogData.search.gender = 'woman';
                    } else if (session.dialogData.search.category == 'casualShirts' || session.dialogData.search.category == 'sweaters' || session.dialogData.search.category == 'blazers') {
                        session.dialogData.search.gender = 'man';
                    }
                }
                if (typeof data.entities['gender'] !== 'undefined') {
                    session.dialogData.search.gender = data.entities.gender[0].value;
                }
                if (typeof data.entities['colour'] !== 'undefined') {
                    session.dialogData.search.colour = data.entities.colour[0].value;
                }
                if (typeof data.entities['number'] !== 'undefined') {
                    session.dialogData.search.price = data.entities.number[0].value;
                    if (typeof data.entities['quantifier'] !== 'undefined') {
                        session.dialogData.search.quantifier = data.entities.quantifier[0].value;
                    }
                }
            }
        }
        session.beginDialog('/ensureSearchEntities', session.dialogData.search);
    },
    function (session, results) {
        session.dialogData.search = results.response;
        if (session.dialogData.search.gender && session.dialogData.search.category && session.dialogData.search.colour && session.dialogData.search.price) {
            session.sendTyping();
            product.find(session.dialogData.search, function (products) {
                if (products !== null) {
                    var sendReply = function (reply) {
                        session.send(emoji.emojify("How 'bout these? :grin:"), "Try these ones out:", "Here's what I found!");
                        setTimeout(function () {
                            session.send(reply);
                            if (session.userData.firstTime == true) {
                                session.send(emoji.emojify("Tip: the :heart: button adds the item to a list of your favourite items! To view your favourites just ask me or navigate using the menu icon in the bottom left hand corner :point_down:"));
                                session.userData.firstTime = false;
                            }
                        }, 500);
                        session.dialogData.search.complete = true;
                        //session.endDialog();
                    }
                    var getReply = function (cards, callback) {
                        var reply = new builder.Message(session)
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(cards);
                        callback(reply);
                    }
                    var getCards = function (callback) {
                        var cards = getAttachment.getCardsAttachments(session, products);
                        callback(cards, sendReply);
                    };
                    getCards(getReply);
                } else {
                    session.send(emoji.emojify("I'm sorry, I have no items matching those criteria :slightly_frowning_face:"));
                    session.dialogData.search.complete = true;
                    //session.endDialog();
                }
            })
        } else {
            session.endDialog();
        }
    }
]);

bot.dialog('/ensureSearchEntities', [
    function (session, args, next) {
        session.dialogData.search = args || {};
        session.sendTyping();
        if (session.dialogData.search.complete == true) {
            session.replaceDialog('/changeSearchEntities', args);
        } else {
            if (!session.dialogData.search.gender) {
                builder.Prompts.text(session, "Are we shopping for a man or a woman?");
            } else {
                next();
            }
        }
    },
    function (session, results, next) {
        session.sendTyping();
        function checkCategory() {
            if (!session.dialogData.search.category) {
                if (session.dialogData.search.gender == "woman") {
                    //var options = ["dresses", "jeans", "skirts", "hoodies"];
                    //session.send(getAttachment.getQuickReplies(session, "In which category? Feel free to type your own.", options));
                    builder.Prompts.text(session, "In which clothing category? e.g. dresses/jeans/skirts/hoodies. Feel free to type your own.");

                } else {
                    //var options = ["coats", "pants", "sweaters", "casual shirts"];
                    //session.send(getAttachment.getQuickReplies(session, "In which category? Feel free to type your own.", options));
                    builder.Prompts.text(session, "In which clothing category? e.g. coats/pants/sweaters/shirts. Feel free to type your own.");
                }
            } else {
                next();
            }
        }
        if (results.response) {
            getWitAnalysis(session, dialogHandler);
            function dialogHandler(data) {
                if (data.entities.gender != null) {
                    session.dialogData.search.gender = data.entities.gender[0].value;
                    checkCategory();
                } else {
                    session.replaceDialog("/");
                }
            }
        } else {
            checkCategory();
        }
    },
    function (session, results, next) {
        session.sendTyping();
        function checkColour() {
            if (!session.dialogData.search.colour) {
                if (session.dialogData.search.category == 'jeans') {
                    builder.Prompts.text(session, "What wash were you thinking? e.g. light/medium/dark/white/acid washed");
                } else {
                    builder.Prompts.text(session, "What colour were you thinking? e.g. white/black/beige");
                }
            } else {
                next();
            }
        }
        if (results.response) {
            getWitAnalysis(session, dialogHandler);
            function dialogHandler(data) {
                if (data.entities.category != null) {
                    session.dialogData.search.category = data.entities.category[0].value;
                    checkColour();
                } else {
                    session.replaceDialog("/searchDefault", session.dialogData.search);
                }
            }
        } else {
            checkColour();
        }

    },
    function (session, results, next) {
        session.sendTyping();
        function checkPrice() {
            if (!session.dialogData.search.price) {
                builder.Prompts.text(session, "What price are we thinking? e.g. around $20/under $100");
            } else {
                next();
            }
        }
        if (results.response) {
            getWitAnalysis(session, dialogHandler);
            function dialogHandler(data) {
                if (data.entities.colour != null) {
                    session.dialogData.search.colour = data.entities.colour[0].value;
                    checkPrice();
                } else if (data.entities.any != null) {
                    session.dialogData.search.colour = data.entities.any[0].value;
                    checkPrice();
                } else {
                    session.replaceDialog("/");
                }
            }
        } else {
            checkPrice();
        }

    },
    function (session, results) {
        session.sendTyping();
        if (results.response) {
            getWitAnalysis(session, dialogHandler);
            function dialogHandler(data) {
                if (data.entities.number != null) {
                    session.dialogData.search.price = data.entities.number[0].value;
                    if (typeof data.entities['quantifier'] !== 'undefined') {
                        session.dialogData.search.quantifier = data.entities.quantifier[0].value;
                    }
                    session.endDialogWithResult({ response: session.dialogData.search });
                } else if (data.entities.any != null) {
                    session.dialogData.search.price = data.entities.any[0].value;
                    session.endDialogWithResult({ response: session.dialogData.search });
                } else {
                    session.replaceDialog("/");
                }
            }
        } else {
            session.endDialogWithResult({ response: session.dialogData.search });
        }
    }
]);

bot.dialog('/changeSearchEntities',
    function (session, args) {
        session.sendTyping();
        session.dialogData.search = args || {};
        getWitAnalysis(session, dialogHandler);
        function dialogHandler(data) {
            if (data.entities.gender != null || data.entities.category != null || data.entities.colour != null || data.entities.number != null) {
                if (data.entities.gender != null) {
                    session.dialogData.search.gender = data.entities.gender[0].value;
                }
                if (data.entities.category != null) {
                    session.dialogData.search.category = data.entities.category[0].value;
                }
                if (data.entities.colour != null) {
                    session.dialogData.search.colour = data.entities.colour[0].value;
                }
                if (data.entities.number != null) {
                    session.dialogData.search.price = data.entities.number[0].value;
                    if (typeof data.entities['quantifier'] !== 'undefined') {
                        session.dialogData.search.quantifier = data.entities.quantifier[0].value;
                    }
                }
                session.endDialogWithResult({ response: session.dialogData.search });
            } else {
                session.replaceDialog("/");
            }
        }
    }
);

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
            if (session.userData.gender == 'woman') {
                var cards = getAttachment.getKeywordsCardsAttachments(categoryKeys.trendWheel, session);
            } else {
                var cards = getAttachment.getKeywordsCardsAttachments(categoryKeys.trendWheelMen, session);
            }
            callback(cards, sendReply);
        };
        getCards(getReply);
    }
]);

/*
bot.beginDialogAction('style profile', '/styleProfile', { matches: /^style profile/i });
bot.dialog('/styleProfile', [
    function (session) {
        session.sendTyping();
        session.send("Say \"cancel\" at any time to quit the style profile.")
        session.dialogData.search = {};
        builder.Prompts.choice(session, "Are you a man or a woman?", emoji.emojify("man :man:|woman :woman:"));
    },
    function (session, results) {
        session.sendTyping();
        session.dialogData.search.gender = results.response.entity;
        builder.Prompts.choice(session, "What's your preferred colour?", "Black|Silver|Orange|Multi-Color|Beige");
    },
    function (session, results) {
        session.sendTyping();
        session.dialogData.search.colour = results.response.entity;
        builder.Prompts.choice(session, "Do you like animal prints?", "yes|no");
    },
    function (session, results, next) {
        session.sendTyping();
        //session.dialogData.search.animalprints = results.response.entity;
        if (session.dialogData.search.gender == "woman") {
            builder.Prompts.choice(session, emoji.emojify("Are you girly? :dress:"), "yes|no");
        } else {
            next();
        }
    },
    function (session, results) {
        session.sendTyping();
        if (results.response) {
            //session.dialogData.search.girly = results.response.entity;
        }
        builder.Prompts.choice(session, emoji.emojify("Are you athletic? :running:"), "yes|no");
    },
    function (session, results) {
        session.sendTyping();
        //session.dialogData.search.athletic = results.response.entity;
        builder.Prompts.choice(session, "Is work formal or casual?", "formal|casual");
    },
    function (session, results) {
        session.sendTyping();
        //session.dialogData.search.work = results.response.entity;
        builder.Prompts.choice(session, "Do you like to swim?", "yes|no");
    },
    function (session, results) {
        session.sendTyping();
        session.dialogData.search.swim = results.response.entity;
        session.send(emoji.emojify("Apologies, this isn't fully functional yet :flushed: But I enjoyed hearing your tastes!"));
        session.endDialog();
        //session.beginDialog('/displayCarousel', { response: session.dialogData.search });
    }
]);*/

bot.dialog('/displayTrendCarousel', [
    function (session, keyword, next) {
        session.sendTyping();
        session.dialogData.keyword = keyword;
        if (!session.userData.gender) {
            builder.Prompts.choice(session, "Are we shopping for a man or a woman?", emoji.emojify("man|woman"));
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.gender = results.response.entity;
        }
        var queryData = {};
        queryData.gender = session.userData.gender;
        queryData.category = session.dialogData.keyword;
        product.find(queryData, function (products) {
            if (products !== null) {
                var sendReply = function (reply) {
                    session.send(emoji.emojify("How 'bout these? :grin:"));
                    setTimeout(function () {
                        session.send(reply);
                    }, 500);
                    session.userData = null;
                    session.endDialog();
                }
                var getReply = function (cards, callback) {
                    var reply = new builder.Message(session)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(cards);
                    callback(reply);
                }
                var getCards = function (callback) {
                    var cards = getAttachment.getCardsAttachments(session, products);
                    callback(cards, sendReply);
                };
                getCards(getReply);
            } else {
                session.send(emoji.emojify("I'm sorry, we have no items matching those criteria :slightly_frowning_face:"));
                session.userData = null;
                session.endDialog();
            }
        })
    }
]);

bot.beginDialogAction('first_time_user', '/first_time_user', { matches: /^first_time_user/i });
bot.dialog('/first_time_user', function (session) {
    session.userData.firstTime = true;
    user.insert(session.message.address.user.id, session.message.user.name, function () {
        session.clearDialogStack();
        var reply = getGreeting(session);
        session.send(reply);
    })
});

bot.beginDialogAction('reset', '/reset', { matches: /^reset/i });
bot.dialog('/reset', function (session) {
    session.send("Conversation reset");
    session.userData = null;
    session.clearDialogStack();
});

bot.beginDialogAction('cancel', '/cancel', { matches: /^cancel/i });
bot.dialog('/cancel', function (session) {
    session.send(getAttachment.getGreetingAttachment(session, emoji.emojify("Action cancelled. What else can I help you with? :thinking_face:")));
    session.userData = null;
    session.clearDialogStack();
});

bot.dialog('/joke', function (session) {
    var jokes = ["I only have two complaints in life: not enough closet space and nothing to wear.",
        "A husband calls his programmer wife and tells her, \"While you're out, buy some milk.\" "
        + "She never returns.",
        "A SQL query goes into a bar, walks up to two tables and asks, \"Can I join you?\"",
        "If at first you don’t succeed; call it version 1.0."];
    session.send(jokes);
    session.endDialog();
})

bot.beginDialogAction('help', '/help', { matches: /^help/i });
bot.dialog('/help', function (session) {
    var reply = "I'm NLPurchase, you can talk to me to help you find items that are perfect for you or as a gift!" +
        " Try explaining to me what you would like to do in a sentence (e.g. \"I really need a gift for my mother-in-law, all I know is she likes the colour pink\")" +
        " and I'll help you out. Use the menu in the bottom left hand corner to get around, or select one of the buttons below to try out a more guided experience.";
    session.send(getAttachment.getGreetingAttachment(session, reply));
    session.endDialog();
});

bot.beginDialogAction('favourites', '/favourites', { matches: /^favourites/i });
bot.dialog('/favourites', function (session) {
    session.sendTyping();
    var queryData = { 'userId': session.message.address.user.id }
    favourite.find(queryData, function (favourites) {
        if (favourites !== null) {
            var productIds = [];
            function getFavouriteId(i) {
                if (i < favourites.length) {
                    productIds.push(favourites[i].productId);
                    getFavouriteId(i + 1);
                } else {
                    product.findByProductIdArray(productIds, function (products) {
                        var sendReply = function (reply) {
                            session.send(emoji.emojify("Here are your favourites, " + getFirstName(session.message.user.name) + "! :open_hands:"));
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
                            var cards = getAttachment.getFavouriteCardsAttachments(session, products);
                            callback(cards, sendReply);
                        };
                        getCards(getReply);
                    })
                }
            }
            getFavouriteId(0);
        } else {
            session.send(emoji.emojify("You haven't favourited anything... yet! :blush: Press the :heart: underneath items you like to favourite them."));
            session.endDialog();
        }
    })
    session.endDialog();
});

function sendTextMessage(sender, array) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "receipt",
                "recipient_name": array.userName,
                "order_number": array.orderNum,
                "currency": "USD",
                "payment_method": "Simplify MasterCard",
                "timestamp": array.timestamp,
                "elements": [
                    {
                        "title": array.title,
                        "price": array.price,
                        "currency": "USD",
                        "image_url": array.URL
                    }
                ],
                "summary": {
                    "total_cost": array.price
                },
            }
        }
    }

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.FB_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function getFirstName(str) {
    if (str.indexOf(' ') === -1)
        return str;
    else
        return str.substr(0, str.indexOf(' '));
};

function getGreeting(session) {
    var greetingArray = ["Hi " + getFirstName(session.message.user.name) + ", what can I help you with today?",
    "Hello " + getFirstName(session.message.user.name) + ", I'm NLPurchase! What can I get you?",
    "Hey " + getFirstName(session.message.user.name) + ", what are you looking for?"];
    var randomIndex = Math.floor(Math.random() * greetingArray.length);
    var randomGreeting = greetingArray[randomIndex];
    session.send(randomGreeting);
    var attachmentMsg = "Choose from the options below or try a sentence (e.g. \"I'm looking for a blue dress to wear to work for around $30\")";
    return getAttachment.getGreetingAttachment(session, attachmentMsg);
}