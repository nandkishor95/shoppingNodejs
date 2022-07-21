const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    avatar: { type: String },
    cloudinary_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("cloudData", userSchema);