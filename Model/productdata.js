const mongoose = require('mongoose');

const ProductsData = mongoose.Schema({
    ProductID:{
        type:Number,
    },
    ProductName:{
        type:String,
    },
    ProductPrize:{
        type:Number,
    },
    QuantityOfProduct:{
     type:Number
    }
},{timestamps: true});

module.exports = mongoose.model("productdata", ProductsData);









