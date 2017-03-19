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
    //athletic: '137085',
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
    //athletic: '137084',
    blazers: '3002', //blazers & sports coats
    coats: '57988', //coats & jackets
    jeans: '11483',
    pants: '57989',
    shorts: '15689',
    //sleepwear: '11510', //sleepwear & robes
    //socks: '11511',
    suits: '3001',
    sweaters: '11484',
    hoodies: '155183',
    swimwear: '15690',
    //underwear: '11507',
    vests: '15691'
}

var trends = ["trench coats", "stripes", "khaki", "neon", "floral"];
var occasions = ["beach wear", "formal", "wedding", "work", "party"];

var trendWheel = [
    {
        title: 'Timeless Trenches ',
        subtitle: 'So satisfying to ditch your tired winter coat for a fresh, spring one!',
        url: 'https://s-media-cache-ak0.pinimg.com/originals/7d/31/fb/7d31fbc54f4dca7edbaf1ae445458e8f.jpg',
        btnText: 'Search trench coats',
        postBack: 'Show me trendy trench coats'
    },
    {
        title: 'Seamless Stripes',
        subtitle: 'Hit refresh on a time-honoured classic trend with an ode to colour',
        url: 'http://www.slimfit-clothing.com/wp-content/uploads/2015/04/Stripes-Fashion-5.jpg',
        postBack: 'Show me trendy stripes'
    },
    {
        title: 'Khaki Gets Cool',
        subtitle: 'Military chic or safari suave; khaki has something for everyone',
        url: 'http://thefashiontag.com/wp-content/uploads/2017/02/khaki-trend-2017-19.jpg',
        postBack: 'Show me trendy khaki'
    },
    {
        title: 'Unnaturally Neon',
        subtitle: 'Electric, fluorescent, vivid, eye-catching. Get your staple piece',
        url: 'http://24.media.tumblr.com/tumblr_m7yyfzVEa71rbawo3o5_1280.jpg',
        postBack: 'Show me trendy neon'
    },
    {
        title: 'Forever Floral',
        subtitle: 'Eye-popping florals to energise your summer dresses to your office wear',
        url: 'https://www.selectspecs.com/fashion-lifestyle/wp-content/uploads/2016/01/Floral-eyewear-1050x700.jpg',
        postBack: 'Show me trendy floral'
    }
]

exports.womenShoes = womenShoes;
exports.womenClothing = womenClothing;
exports.menShoes = menShoes;
exports.menClothing = menClothing;
exports.trends = trends;
exports.occasions = occasions;
exports.trendWheel = trendWheel;