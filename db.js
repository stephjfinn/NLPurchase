var mongoose = require('mongoose');
var config = require('./config');
var uri = config.creds.mongoose_local;

mongoose.connect(uri)

/*CONNECTION EVENTS*/

//connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + uri);
});

//error connecting
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

//disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

//if application ends -> close the connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// BRING IN YOUR SCHEMAS & MODELS // For example 
require('./model/product');