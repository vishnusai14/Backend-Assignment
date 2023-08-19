const Router = require("express").Router();
const userModel = require("../Database/db").userModel;
const productModel = require("../Database/db").productModel;
const getUser = require("./functions");

//This function is used to retireve the user based on the json web token

//This API Is used to put a item in the cart
Router.put("/put-item", (req, res) => {
  const { id } = req.body;
  const { token } = req.query;
  if (id === undefined || id === null || id === "") {
    res.status(502).send({ error: "Bad Request" });
    res.end();
  } else {
    getUser(token)
      .then((response) => {
        console.log(response);
        let userId = response.id;
        productModel
          .findOne({ id: id })
          .then((foundProduct) => {
            if (foundProduct === null) {
              res.status(404).send({ err: "No Product Found" });
              res.end();
            } else {
              userModel
                .updateOne({ id: userId }, { $push: { cart: id } })
                .then((result) => {
                  res.status(200).send({ data: "Product Added To The Cart" });
                  res.end();
                })
                .catch((err) => {
                  res.status(500).send({ err: "Internal Server Error" });
                  res.end();
                });
            }
          })
          .catch((err) => {
            res.status(500).send({ error: "No Prodcut Found" });
            res.end();
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ error: err });
        res.end();
      });
  }
});

//API To remove the item from the cart
Router.delete("/delete-item", (req, res) => {
  const { id } = req.body;
  const { token } = req.query;
  if (id === undefined || id === null || id === "") {
    res.status(502).send({ error: "Bad Request" });
    res.end();
  } else {
    getUser(token)
      .then((response) => {
        console.log(response);
        let userId = response.id;
        productModel
          .findOne({ id: id })
          .then((foundProduct) => {
            if (foundProduct === null) {
              res.status(404).send({ err: "No Product Found" });
              res.end();
            } else {
              userModel
                .updateOne({ id: userId }, { $pull: { cart: id } })
                .then((result) => {
                  res.status(200).send({ data: "Product Deleted To The Cart" });
                  res.end();
                })
                .catch((err) => {
                  res.status(500).send({ err: "Product Not in the Cart" });
                  res.end();
                });
            }
          })
          .catch((err) => {
            res.status(500).send({ error: "No Prodcut Found" });
            res.end();
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ error: err });
        res.end();
      });
  }
});

module.exports = Router;
