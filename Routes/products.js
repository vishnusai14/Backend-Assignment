const Router = require("express").Router();
const productModel = require("../Database/db").productModel;
const axios = require("axios");
const crypto = require("crypto");

const CATEGORYTOID = {
  smartphones: "ca784276-3d81-11ee-be56-0242ac120002",
  laptops: "ca784154-3d81-11ee-be56-0242ac120002",
  fragrances: "ca784046-3d81-11ee-be56-0242ac120002",
  skincare: "ca783f24-3d81-11ee-be56-0242ac120002",
  groceries: "ca783dda-3d81-11ee-be56-0242ac120002",
  "home-decoration": "ca783a42-3d81-11ee-be56-0242ac120002",
  furniture: "ca783916-3d81-11ee-be56-0242ac120002",
  tops: "ca7837e0-3d81-11ee-be56-0242ac120002",
  "womens-dresses": "ca7836be-3d81-11ee-be56-0242ac120002",
  "womens-shoes": "ca783588-3d81-11ee-be56-0242ac120002",
  "mens-shirts": "ca78345c-3d81-11ee-be56-0242ac120002",
  "mens-shoes": "ca783326-3d81-11ee-be56-0242ac120002",
  "mens-watches": "ca782f3e-3d81-11ee-be56-0242ac120002",
  "womens-watches": "ca782e08-3d81-11ee-be56-0242ac120002",
  "womens-bags": "ca782ce6-3d81-11ee-be56-0242ac120002",
  "womens-jewellery": "ca782b92-3d81-11ee-be56-0242ac120002",
  sunglasses: "ca78273c-3d81-11ee-be56-0242ac120002",
  automotive: "ca78285e-3d81-11ee-be56-0242ac120002",
  motorcycle: "ca782610-3d81-11ee-be56-0242ac120002",
  lighting: "ca7822b4-3d81-11ee-be56-0242ac120002",
};

// This Route is used to seed the dummy data to our mongodb from fakestore

Router.post("/seed-data", (req, res) => {
  axios
    .get("https://dummyjson.com/products?limit=100")
    .then((response) => {
      console.log(response.data);
      let data = response.data.products;
      let dataModel = data.map((i) => {
        return new productModel({
          id: crypto.randomUUID().toString(),
          title: i["title"],
          price: i["price"],
          description: i["description"],
          categoryName: i["category"],
          categoryId: CATEGORYTOID[i["category"]],
          available: true,
          image: i["thumbnail"],
        });
      });
      dataModel.forEach(async (item) => {
        try {
          await item.save();
        } catch (err) {
          console.log(err);
          res.status(400).send({ error: err });
          res.end();
        }
      });
      res.status(200).send({ data: "Data Added" });
      res.end();
    })
    .catch((err) => {
      console.log(err);
    });
});

//This API lists all the categories from the data
Router.get("/get-categories", (req, res) => {
  let categories = [];
  productModel
    .find({})
    .then((result) => {
      result.forEach((i) => {
        if (
          !(
            categories.filter((e) => e.categoryName === i.categoryName).length >
            0
          )
        ) {
          categories.push({
            categoryName: i.categoryName,
            categoryId: i.categoryId,
          });
        }
      });
      res.status(200).send({ data: categories });
      res.end();
    })
    .catch((err) => {
      res.status(500).send({ error: "Internal Server Error" });
      res.end();
    });
});

//This API retrieve all the products based on the Category Name

Router.get("/get-products", (req, res) => {
  let { categoryName, categoryId } = req.query;
  console.log(categoryName);
  console.log(categoryId);
  let response = [];
  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    productModel
      .find({
        categoryId: categoryId,
      })
      .then((data) => {
        data.forEach((i) => {
          response.push({
            id: i.id,
            title: i.title,
            price: i.price,
            image: i.image,
            categoryId: i.categoryId,
            categoryName: i.categoryName,
            available: i.available,
          });
        });
        res.status(200).send({ data: response });
        res.end();
      })
      .catch((err) => {
        res.status(500).send({ error: "Internal Server Error" });
        res.end();
      });
  } else {
    productModel
      .find({
        $or: [{ categoryName: { $regex: new RegExp(categoryName, "i") } }],
      })
      .then((data) => {
        console.log(data);
        data.forEach((i) => {
          response.push({
            id: i.id,
            title: i.title,
            price: i.price,
            image: i.image,
            categoryId: i.categoryId,
            categoryName: i.categoryName,
            available: i.available,
          });
        });
        res.status(200).send({ data: response });
        res.end();
      })
      .catch((err) => {
        res.status(500).send({ error: "Internal Server Error" });
        res.end();
      });
  }
});

//This Api fetch the product based on product id
Router.get("/get-product", (req, res) => {
  let { id } = req.query;
  if (id === undefined || id === null || id === "") {
    res.status(502).send({ error: "Bad Request" });
    res.end();
  } else {
    productModel
      .findOne({ id: id })
      .then((data) => {
        res.status(200).send({ data: data });
        res.end();
      })
      .catch((err) => {
        res.status(400).send({ error: "Product Not Found" });
        res.end();
      });
  }
});

module.exports = Router;
