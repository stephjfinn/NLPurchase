var request = require('request');
var FB_PAGE_ACCESS_TOKEN = '***REMOVED***';

//=========================================================
// Facebook setup // Run only when need updating.
//=========================================================

exports.setAllMenus = function () {
    // Set FB bot greeting text
    facebookThreadAPI('./greeting-text.json', 'Greeting Text');
    // Set FB bot get started button
    facebookThreadAPI('./get-started-button.json', 'Get Started Button');
    // Set FB bot persistent menu
    facebookThreadAPI('./persistent-menu.json', 'Persistent Menu');
};

// Calls the Facebook graph api to change various bot settings
function facebookThreadAPI(jsonFile, cmd) {
    // Start the request
    request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + FB_PAGE_ACCESS_TOKEN,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        form: require(jsonFile)
    },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(cmd + ": Updated.");
                console.log(body);
            } else {
                // TODO: Handle errors
                console.log(cmd + ": Failed. Need to handle errors.");
                console.log(body);
            }
        });
}