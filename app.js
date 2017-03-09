//NOTE TO SELF: shift + alt + f = format indentation

var restify = require('restify');
var builder = require('botbuilder');
const { Wit, log } = require('node-wit');
var greetingArray = ["Hi! What can I help you with today?",
    "Hello, I'm NLPurchase! What can I do for you?",
    "Hey friend, what are you looking for?"];
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 80, function () {
    console.log('%s listening to %s', server.name, server.url);
});
var db = require('./db');
var product = require('./controllers/products')
var ebay = require('./ebay')
var categoryKeys = require('./categoryKeys');
var async = require('async');

//drop collection
/*product.clear();*/

//return all products
/*product.all(function(products) {
    console.log(products);
})*/

//drop existing product table
product.clear();

//making ebay calls
var womenShoes = categoryKeys.womenShoes;
var menShoes = categoryKeys.menShoes;
var womenClothing = categoryKeys.womenClothing;
var menClothing = categoryKeys.menClothing;

function doInsertion(categorySet, categorySetName, callback) {
    function categorySelector(i) {
        if (i < Object.keys(categorySet).length) {
            var category = Object.keys(categorySet)[i];
            var categoryID = categorySet[category];
            console.log("Getting colours for :" + category);
            ebay.getColours(categoryID, function (colours) {
                colourSelector(colours, category, categoryID, 0, i);
            })
        } else {
            callback(categorySetName + ' inserted!');
        }
    };

    function colourSelector(colours, category, categoryID, i, j) {
        if (i < colours.length) {
            var colour = colours[i];
            console.log("Now requesting Category: " + categoryID + " + Colour: " + colour);
            if (category != 'jeans') {
                ebay.makeRequest(categoryID, colour, 'Color', function (items) {
                    if (items != null) {
                        console.log("Got item set Type: " + category + " + Colour: " + colour);
                        insertEbayItems(categorySetName, items, colour, category, function () {
                            colourSelector(colours, category, categoryID, i + 1, j);
                        });
                    } else {
                        console.log("No items found for category: " + category + ", colour: " + colour);
                        colourSelector(colours, category, categoryID, i + 1, j);
                    }
                })
            } else {
                ebay.makeRequest(categoryID, colour, 'Wash', function (items) {
                    if (items != null) {
                        console.log("Got item set Type: " + category + " + Colour: " + colour);
                        insertEbayItems(categorySetName, items, colour, category, function () {
                            colourSelector(colours, category, categoryID, i + 1, j);
                        });
                    } else {
                        console.log("No items found for category: " + category + ", colour: " + colour);
                        colourSelector(colours, category, categoryID, i + 1, j);
                    }
                })
            }
        } else {
            categorySelector(j + 1);
        }
    }

    categorySelector(0);
}

doInsertion(womenShoes, 'womenShoes', function (results) {
    console.log(results);
    doInsertion(menShoes, 'menShoes', function (results) {
        console.log(results);
        doInsertion(womenClothing, 'womenClothing', function (results) {
            console.log(results);
            doInsertion(menClothing, 'menClothing', function (results) {
                console.log(results);
            })
        })
    })
});

function insertEbayItems(categorySetName, items, colour, category, callback) {
    function insertOneItem(i) {
        if (i < items.length) {
            console.log('- ' + items[i].title);

            var db_item = {};

            if (categorySetName.includes("women")) {
                db_item["gender"] = "female";
            } else {
                db_item["gender"] = "male";
            }
            db_item["category"] = category;
            db_item["colour"] = colour;
            db_item["title"] = items[i].title;
            db_item["subcategory"] = items[i].primaryCategory.categoryName;
            if (items[i].pictureURLSuperSize) {
                db_item["url"] = items[i].pictureURLSuperSize;
            } else if (items[i].pictureURLLarge) {
                db_item["url"] = items[i].pictureURLLarge;
            } else if (items[i].galleryPlusPictureURL) {
                db_item["url"] = items[i].galleryPlusPictureURL;
            } else {
                db_item["url"] = items[i].galleryURL;
            }
            db_item["price"] = items[i].sellingStatus.currentPrice.amount;

            product.insert(db_item, function (product) {
                console.log("Inserted 1 product");
                insertOneItem(i + 1);
            })
        } else {
            callback();
        }
    }
    insertOneItem(0);
}

//**bot setup



//create chat bot
/*var connector = new builder.ChatConnector({
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

//bot dialog

bot.dialog('/', function (session) {
    session.sendTyping();
    client.message(session.message.text, {})
        .then((data) => {
            switch (data.entities.intent[0].value) {
                case "greeting":
                    var randomIndex = Math.floor(Math.random() * greetingArray.length);
                    var randomGreeting = greetingArray[randomIndex];
                    session.send(randomGreeting);
                    break;
                case "search":
                    //check if search contains colour, object or gender parameters
                    //if it's missing the gender parameter start getGender dialog & return here
                    //(randomly?) select in mongodb based on parameters

                    //var cards = getCardsAttachments(session);
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

            }
        })
        .catch(console.error);
});

function getCardsAttachments(products, session) {
    var cards = [];

    for (var i = 0; i < 9; i++) {
        var newcard = new builder.HeroCard(session)
            .title(products[i].title)
            .images([
                builder.CardImage.create(session, products[i].pictureURL)
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://google.ie', 'Add to cart'),
                builder.CardAction.openUrl(session, 'https://google.ie', 'More like this')
            ])
        cards.push(newcard)
    }

    return cards;

    
    return [
        new builder.HeroCard(session)
            .title('Azure')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/storage/media/storage-introduction/storage-concepts.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Azure Functions')
            .subtitle('Process events with a serverless code architecture')
            .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-5daae9212bb433ad0510fbfbff44121ac7c759adc284d7a43d60dbbf2358a07a/images/page/services/functions/01-develop.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('Cognitive Services')
            .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
            .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-68b530dac63f0ccae8466a2610289af04bdc67ee0bfbc2d5e526b8efd10af05a/images/page/services/cognitive-services/cognitive-services.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
            ])
    ];
    
}*/