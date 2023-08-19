const mongoose = require("mongoose");
const productSchema = require("./Schema/productSchema");
const userSchema = require("./Schema/userSchema");

const connect = (uri) => {
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Datebase Connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

const productModel = mongoose.model("Product", productSchema);
const userModel = mongoose.model("Users", userSchema);

module.exports = {
  connect: connect,
  productModel: productModel,
  userModel: userModel,
};
