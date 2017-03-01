var restify = require('restify');
var builder = require('botbuilder');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
var ebay = require('ebay-api')
const {Wit, log} = require('node-wit');
var greetingArray = ["Hi! What can I help you with today?",
                    "Hello, I'm NLPurchase! What can I do for you?",
                    "Hey friend, what are you looking for?"];

//connect using the MongoClient to a running mongod instance by specifying the MongoDB uri
//example: the following code connects to a MongoDB instance that runs on the localhost interface on port 27017
//and switches to the test database

var db = MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    testcollection = db.collection('test');
    testcollection.remove();
});

//EBAY
var params = {
  keywords: "black women's ladies shoes",
  // add additional fields
  outputSelector: ['AspectHistogram'],
  paginationInput: {
    entriesPerPage: 10
  },
  itemFilter: [
    {name: 'FreeShippingOnly', value: true},
    {name: 'MaxPrice', value: '150'},
    {name: 'MinPrice', value: '20'},
    {name: 'ListingType', value: 'FixedPrice'},
    {name: 'TopRatedSellerOnly', value: true}
  ],
};

ebay.xmlRequest({
    serviceName: 'Finding',
    opType: 'findItemsByKeywords',
    appId: 'Stephani-NLPurcha-PRD-2cd429718-0d5ba0c3',
    params: params,
    parser: ebay.parseResponseJson    // (default)
  },
  // gets all the items together in a merged array
  function itemsCallback(error, itemsResponse) {
      if (error) throw error;
      var items = itemsResponse.searchResult.item;
      console.log('Found', items.length, 'items');
      for (var i = 0; i < items.length; i++) {
          console.log('- ' + items[i].title);
          var insertDocument = function(db, callback) {
              testcollection.insertOne({
                  "gender" : "f",
                  "category" : "shoes",
                  "colour" : "black",
                  "title" : items[i].title,
                  "subcategory" : items[i].primaryCategory.categoryName,
                  "pictureURL" : items[i].galleryURL,
                  "price" : items[i].sellingStatus.currentPrice.amount
                }, function(err, result) {
                    assert.equal(err, null);
                    console.log("Inserted a document into the test collection");
                    callback();
                });
            };
            insertDocument(db, function() {
            });
        }
    }
);

//**bot setup

//setup restify server
var server = restify.createServer();
server.listen(80, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

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
      return new Promise(function(resolve, reject) {
        console.log(JSON.stringify(response));
        return resolve();
      });
    },
    myAction({sessionId, context, text, entities}) {
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
        switch(data.entities.intent[0].value) {
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

                var findDocument = function(db, callback) {
                    testcollection.find({
                        "gender" : "f",
                        "category" : "shoes",
                        "colour" : "black"
                    }, function(err, cursor) {
                        assert.equal(err, null);
                        console.log("found 1 document");
                        cursor.toArray(callback);
                    });
                };
                var itemArray = findDocument(db, function() {
                });

                console.log(itemArray);

                //var cards = getCardsAttachments(session, title, subtitle, image);

                // create reply with Carousel AttachmentLayout
                /*var reply = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(cards);
                session.send(reply);*/
        }
    })
    .catch(console.error);
    /*session.send("Hello!");
    var reply;
    var callback = function (result) {
        reply = result;

        if (!reply)
            return false;

        console.log(reply.entities.intent);

        session.send(reply.entities.intent);
    };
    utils.getWitIntent(session.message.text, callback);
    */
});

function getCardsAttachments(session) {
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
}