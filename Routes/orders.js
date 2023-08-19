const Router = require("express").Router();
const userModel = require("../Database/db").userModel;
const productModel = require("../Database/db").productModel;
const getUser = require("./functions");

Router.post("/place-orders", (req, res) => {
  const { orders } = req.body;
  const { token } = req.query;
  if (
    orders === undefined ||
    orders === null ||
    orders === "" ||
    orders.length === 0
  ) {
    res.status(502).send({ error: "Bad Request" });
    res.end();
  } else {
    getUser(token)
      .then((response) => {
        console.log(response);
        let userId = response.id;
        productModel
          .find()
          .where("id")
          .in(orders)
          .then((result) => {
            console.log(result);
            let orderObject = {};
            let price = 0;
            result.forEach((i) => {
              price += parseFloat(i.price);
            });
            orderObject = {
              productId: orders,
              time: new Date().toString(),
              price: price,
            };
            if (result.length === orders.length) {
              userModel
                .updateOne(
                  { id: userId },
                  {
                    $push: {
                      orders: orderObject,
                      orderItems: { $each: orders },
                    },
                  }
                )
                .then((result) => {
                  res
                    .status(200)
                    .send({
                      data: `Your Order Placed Succesfully. Total Amount : ${price}`,
                    });
                  res.end();
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send({ err: "Internal Server Error" });
                  res.end();
                });
            } else {
              res.status(404).send({ error: "Product Id Mismatched" });
              res.end();
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(404).send({ error: "No Product Found" });
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
