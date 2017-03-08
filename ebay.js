var ebay = require('ebay-api')

exports.makeRequest = function (categoryId, colour, callback) {
    var params = {
        categoryId: categoryId,
        // add additional fields
        outputSelector: ['PictureURLLarge', 'PictureURLSuperSize', 'AspectHistogram'],
        paginationInput: {
            entriesPerPage: 100 //default is 100
        },
        itemFilter: [
            { name: 'FreeShippingOnly', value: true },
            { name: 'MaxPrice', value: '200' },
            { name: 'MinPrice', value: '20' },
            { name: 'ListingType', value: 'FixedPrice' },
            { name: 'TopRatedSellerOnly', value: true }
        ],
        aspectFilter: [
           { aspectName: 'Color', aspectValueName: colour }
        ],
    };

    ebay.xmlRequest({
        serviceName: 'Finding',
        opType: 'findItemsAdvanced',
        appId: 'Stephani-NLPurcha-PRD-2cd429718-0d5ba0c3',
        params: params,
        globalId: 'EBAY-US',
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

exports.getColours = function (categoryId, callback) {
    var params = {
        categoryId: categoryId,
        // add additional fields
        outputSelector: ['AspectHistogram'],
        paginationInput: {
            entriesPerPage: 10 //default is 100
        }
    };

    ebay.xmlRequest({
        serviceName: 'Finding',
        opType: 'findItemsAdvanced',
        appId: 'Stephani-NLPurcha-PRD-2cd429718-0d5ba0c3',
        params: params,
        globalId: 'EBAY-US',
        parser: ebay.parseResponseJson    // (default)
    },
        // gets all the items together in a merged array
        function itemsCallback(error, itemsResponse) {
            if (error) throw error;
            var colours = [];
            var histogram = itemsResponse.aspectHistogramContainer.aspect;
            //var colourArray = histogram.object
            //console.log('Found histogram: ', histogram);
            function findColours(aspects) {
                return aspects.$.name === 'Color';
            }
            var coloursObject = histogram.find(findColours).valueHistogram;
            function makeColourArray(colourObject) {
                return colourObject.$.valueName
            }
            var preliminaryArray = coloursObject.map(makeColourArray);
            function checkColour(colour) {
                return colour != 'Not Specified'
            }
            coloursArray = preliminaryArray.filter(checkColour)
            callback(coloursArray);
        }
    );
}