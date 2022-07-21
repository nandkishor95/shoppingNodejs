const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

module.exports.Buy = model(
  "buy",
  Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usedatas"
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productdatas"
      },
    },
    { timestamps: true }
  )
);
