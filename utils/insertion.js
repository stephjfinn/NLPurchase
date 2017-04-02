var ebay = require('./ebay');
var product = require('./controllers/products');

exports.doInsertion = function (categorySet, categorySetName, callback) {
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

exports.doAltInsertion = function (categoryId, keywords, callback) {
    function keywordSelector(i) {
        if (i < keywords.length) {
            var keyword = keywords[i];
            ebay.makeAltRequest(categoryId, keyword, function (items) {
                if (items != null) {
                    console.log("Got item set Category: " + categoryId + " + Keyword: " + keyword);
                    insertAltEbayItems(categoryId, keyword, items, function () {
                        keywordSelector(i + 1)
                    });
                } else {
                    console.log("No items found for category: " + categoryId + ", keyword: " + keyword);
                    keywordSelector(i + 1);
                }
            })
        } else {
            callback('Keywords inserted!');
        }
    };
    keywordSelector(0);
}

function insertAltEbayItems(categoryId, keyword, items, callback) {
    var unusedItems = 0;
    function insertOneItem(i) {
        if (i < items.length) {
            console.log('- ' + items[i].title);

            var insert = true;

            var db_item = {};

            if (categoryId == '1059') {
                db_item["gender"] = "man";
            } else {
                db_item["gender"] = "woman";
            }
            db_item["category"] = keyword;
            db_item["title"] = items[i].title;
            if (items[i].pictureURLSuperSize) {
                db_item["url"] = items[i].pictureURLSuperSize;
            } else if (items[i].pictureURLLarge) {
                db_item["url"] = items[i].pictureURLLarge;
            } else if (items[i].galleryPlusPictureURL) {
                db_item["url"] = items[i].galleryPlusPictureURL;
            } else {
                insert = false;
            }
            db_item["price"] = items[i].sellingStatus.currentPrice.amount;

            if (insert == true) {
                product.insert(db_item, function (product) {
                    console.log("Inserted 1 product");
                    insertOneItem(i + 1);
                })
            } else {
                unusedItems++;
                insertOneItem(i + 1);
            }
        } else {
            console.log("Uninserted items: " + unusedItems);
            callback();
        }
    }
    insertOneItem(0);
}

function insertEbayItems(categorySetName, items, colour, category, callback) {
    var unusedItems = 0;
    function insertOneItem(i) {
        if (i < items.length) {
            console.log('- ' + items[i].title);

            var insert = true;

            var db_item = {};

            if (categorySetName.includes("women")) {
                db_item["gender"] = "woman";
            } else {
                db_item["gender"] = "man";
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
                insert = false;
            }
            db_item["price"] = items[i].sellingStatus.currentPrice.amount;

            if (insert == true) {
                product.insert(db_item, function (product) {
                    console.log("Inserted 1 product");
                    insertOneItem(i + 1);
                })
            } else {
                unusedItems++;
                insertOneItem(i + 1);
            }
        } else {
            console.log("Uninserted items: " + unusedItems);
            callback();
        }
    }
    insertOneItem(0);
}