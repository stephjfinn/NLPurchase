var ebay = require('ebay-api')

exports.makeRequest = function (keywords, callback) {
    var params = {
        keywords: keywords,
        // add additional fields
        outputSelector: ['AspectHistogram'],
        paginationInput: {
            entriesPerPage: 10
        },
        itemFilter: [
            { name: 'FreeShippingOnly', value: true },
            { name: 'MaxPrice', value: '150' },
            { name: 'MinPrice', value: '20' },
            { name: 'ListingType', value: 'FixedPrice' },
            { name: 'TopRatedSellerOnly', value: true }
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
            callback(items);
        }
    );
}