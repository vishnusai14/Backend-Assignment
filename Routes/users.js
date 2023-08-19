const Router = require("express").Router();
const userModel = require("../Database/db").userModel;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET = process.env.SECRET;
const getUser = require("./functions");
const productModel = require("../Database/db").productModel;

// This API is To used Register New User

Router.post("/signup", (req, res) => {
  console.log(req);
  const { email, userName, password, phone } = req.body;

  if (
    email === undefined ||
    userName === undefined ||
    password === undefined ||
    phone === undefined
  ) {
    res.status(400).send({ error: "Bad Data" });
    res.end();
  } else {
    userModel
      .findOne({ email: email })
      .then((result) => {
        if (result !== null) {
          res.status(400).send({ data: "User Exists" });
          res.end();
        } else {
          bcrypt.hash(password, 5, (err, hashedPassword) => {
            if (err) {
              console.log(err);
              res.status(500).send({ data: "Internal Server Error" });
              res.end();
            } else {
              const id = crypto.randomUUID().toString();
              const newUserModel = new userModel({
                id: id,
                email: email,
                userName: userName,
                phone: phone,
                password: hashedPassword,
                orders: [],
                cart: [],
              });
              newUserModel.save();
              const token = jwt.sign(
                { email: email, id: id, userName: userName },
                SECRET,
                { expiresIn: "1h" }
              );
              res.status(200).send({
                data: {
                  token: token,
                  validity: "1 hour",
                  msg: "User Created Successfully",
                },
              });
              res.end();
            }
          });
        }
      })
      .catch((err) => {
        res.status(500).send({ data: "Internal Server Error" });
        res.end();
      });
  }
});

//This API Allows to Login The User

Router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (password === undefined || email === undefined) {
    res.status(400).send({ error: "Bad Data" });
    res.end();
  } else {
    userModel
      .findOne({ email: email })
      .then((result) => {
        if (result === null) {
          res.status(400).send({ data: "User Not Exist" });
          res.end();
        } else {
          let orders = result.orderItems;
          let orderMapping = {};
          orders.forEach((o) => {
            if (orderMapping[o] === undefined || orderMapping[o] === null) {
              orderMapping[o] = 1;
            } else {
              orderMapping[o] += 1;
            }
          });

          let cart = result.cart;
          let cartMapping = {};
          cart.forEach((o) => {
            if (cartMapping[o] === undefined || cartMapping[o] === null) {
              cartMapping[o] = 1;
            } else {
              cartMapping[o] += 1;
            }
          });

          console.log(result);
          bcrypt.compare(password, result.password, (err, isEqual) => {
            if (isEqual) {
              const token = jwt.sign(
                { email: email, id: result.id, userName: result.userName },
                SECRET,
                { expiresIn: "1h" }
              );
              productModel
                .find()
                .where("id")
                .in(result.cart)
                .then((cartItems) => {
                  productModel
                    .find()
                    .where("id")
                    .in(result.orderItems)
                    .then((orderItems) => {
                      let cartRes = [];
                      cartItems.forEach((item) => {
                        console.log(item);
                        cartRes.push({ item, count: cartMapping[item.id] });
                      });
                      let ordersRes = [];
                      orderItems.forEach((item) => {
                        console.log(item);
                        ordersRes.push({ item, count: orderMapping[item.id] });
                      });
                      let userData = {
                        email: result.email,
                        userName: result.userName,
                        phone: result.phone,
                        cart: cartRes,
                        orders: ordersRes,
                      };
                      res.status(200).send({
                        data: {
                          userData: userData,
                          token: token,
                        },
                      });
                      res.end();
                    });
                });
            } else {
              res.status(400).send({ data: "Unuthorized" });
              res.end();
            }
          });
        }
      })
      .catch((err) => {
        res.status(400).send({ data: "Token Malformed" });
        res.end();
      });
  }
});

//This API uses token to get the user detail

Router.get("/get-user", (req, res) => {
  const { token } = req.query;
  getUser(token)
    .then((result) => {
      userModel
        .findOne({ id: result.id })
        .then((response) => {
          let orders = response.orderItems;
          let orderMapping = {};
          orders.forEach((o) => {
            console.log(o);
            if (orderMapping[o] === undefined || orderMapping[o] === null) {
              orderMapping[o] = 1;
            } else {
              orderMapping[o] += 1;
            }
          });
          console.log("This is the Order Mapping");
          console.log(orderMapping);
          let cart = response.cart;
          let cartMapping = {};
          cart.forEach((o) => {
            console.log(o);
            if (cartMapping[o] === undefined || cartMapping[o] === null) {
              cartMapping[o] = 1;
            } else {
              cartMapping[o] += 1;
            }
          });
          console.log(cart);
          productModel
            .find()
            .where("id")
            .in(cart)
            .then((cartItems) => {
              productModel
                .find()
                .where("id")
                .in(orders)
                .then((orderItems) => {
                  console.log("This is OrderITEMS");

                  let cartRes = [];
                  cartItems.forEach((item) => {
                    console.log(item);
                    cartRes.push({ item, count: cartMapping[item.id] });
                  });

                  let ordersRes = [];
                  orderItems.forEach((item) => {
                    console.log(item);
                    ordersRes.push({ item, count: orderMapping[item.id] });
                  });
                  console.log(ordersRes);
                  let userData = {
                    email: result.email,
                    userName: result.userName,
                    phone: response.phone,
                    cart: cartRes,
                    orders: ordersRes,
                  };
                  res.status(200).send({
                    data: {
                      userData: userData,
                    },
                  });
                  res.end();
                });
            });
        })
        .catch((err) => {
          res.status(400).send({ data: "Unuthorized" });
          res.end();
        });
    })
    .catch((err) => {
      //   console.log(err);
      res.status(400).send({ data: "Token Malformed" });
      res.end();
    });
});

module.exports = Router;
