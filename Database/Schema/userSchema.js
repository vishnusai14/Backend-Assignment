const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  email: {
    type: String,
  },
  userName: {
    type: String,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  orders: {
    type: Array,
  },
  cart: {
    type: Array,
  },
  orderItems: {
    type: Array,
  },
});

module.exports = userSchema;
