const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  title: {
    type: String,
  },
  price: {
    type: String,
  },
  description: {
    type: String,
  },
  categoryName: {
    type: String,
  },
  categoryId: {
    type: String,
  },
  available: {
    type: Boolean,
  },
  image: {
    type: String,
  },
  sold: {
    type: Boolean,
  },
  dateOfSale: {
    type: Date,
  },
});

module.exports = productSchema;
