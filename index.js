require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./Database/db");
const pass = process.env.DB_PASS;
const name = process.env.DB_NAME;
const PORT = process.env.PORT || 1331;
const monogoDbUri = `mongodb+srv://Vishnu_Sai:${pass}@cluster0.hkghe.mongodb.net/${name}?retryWrites=true&w=majority`;
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const rateLimiter = require("./rateLimiter");
db.connect(monogoDbUri);
app.use(rateLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json({ limit: "50mb" }));
app.use("/api/v1/products", require("./Routes/products"));
app.use("/api/v1/users", require("./Routes/users"));
app.use("/api/v1/cart", require("./Routes/cart"));
app.use("/api/v1/orders", require("./Routes/orders"));

app.use(
  cors({
    origin: "*",
  })
);

app.listen(PORT, () => {
  console.log(`The Server is started in Port ${PORT}`);
});
