
// {{MYSHOP}}/testproduct?search=tshirt1&price[gte]=500&brand=nike&page=2&price[let]=199

// exports.testproduct = async (req, res) => {

//     const querydata = req.query
//     console.log(querydata);

//     console.log(querydata.brand);

//     const p = JSON.stringify(querydata.brand)

//     const regex = /\b(gte|lte|lt)\b/g;

//     const doo = p.replace(regex, m => `$${m}`)
//     console.log(p.replace(regex, m => `$${m}`));

//     res.status(200).json({
//         message: `Hello test Product`,
//         querydata,
//         doo
//     })
// }

var stakingprice = 40000
var percentage = 15

let outcome = (percentage / 100) * stakingprice


console.log(outcome);

