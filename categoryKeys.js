// NOTE: there is a getCategories call in the ebay api
// I am currently hardcoding these values
var womenShoes = {
    athletic: '95672',
    boots: '53557',
    flats: '45333', //flats & oxfords
    heels: '55793',
    occupational: '53548',
    sandals: '62107', //sandals & flip flops
    //slippers: '11632'
};
var menShoes = {
    athletic: '15709',
    boots: '11498',
    casual: '24087',
    formal: '53120', //dress/formal
    occupational: '11501',
    sandals: '11504', //sandals & flip flops
    //slippers: '11505'
};
var womenClothing = {
    athletic: '137085',
    coats: '63862', //coats & jackets
    dresses: '63861',
    //hosiery: '11524', //hosiery & socks
    //sleepwear: '11514', //intimates & sleep
    jeans: '11554',
    jumpsuits: '3009', //jumpsuits & rompers
    leggings: '169001', //dress/formal
    //maternity: '172378',
    pants: '63863', //sandals & flip flops
    shorts: '11555',
    skirts: '63864',
    suits: '63865',
    hoodies: '155226',
    swimwear: '63867',
    tshirts: '63869',
    tops: '53159',
    vests: '15775'
}
var menClothing = {
    casualShirts: '57990',
    dressShirts: '57991',
    tshirts: '15687',
    athletic: '137084',
    blazers: '3002', //blazers & sports coats
    coats: '57988', //coats & jackets
    jeans: '11483',
    pants: '57989',
    shorts: '15689',
    //sleepwear: '11510', //sleepwear & robes
    socks: '11511',
    suits: '3001',
    sweaters: '11484',
    hoodies: '155183',
    swimwear: '15690',
    underwear: '11507',
    vests: '15691'
}

exports.womenShoes = womenShoes;
exports.womenClothing = womenClothing;
exports.menShoes = menShoes;
exports.menClothing = menClothing;