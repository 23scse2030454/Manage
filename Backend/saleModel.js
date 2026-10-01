const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  price: { type: Number, required: true },
  quantitySold: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  date: { type: String, required: true } // format: YYYY-MM-DD taaki search karne me aasan ho
}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema);
