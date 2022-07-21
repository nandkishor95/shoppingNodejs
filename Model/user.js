const mongoose = require('mongoose');

const mydata = new mongoose.Schema({
    Name: {type:String, required:true, trim:true},
    Email: {type:String, required:true, trim:true},
    Password: {type:String, required:true, trim:true},
    Role: {type:String, required:true, trim:true},
    RoleId: {type:Number, required:true, trim:true},
    Mobile: {type:Number, required:true, trim:true},
    Amount: {type:Number, required:true, trim:true}
},{timestamps: true});

module.exports = mongoose.model("usedata", mydata);