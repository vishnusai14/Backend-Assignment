const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const userModel = require("../Database/db").userModel;
const getUser = (token) => {
  const promise = new Promise((resolve, reject) => {
    try {
      const user = jwt.verify(token, SECRET);
      console.log(user);
      if (user) {
        userModel
          .findOne({ email: user.email })
          .then((result) => {
            if (result) {
              resolve(result);
            } else {
              reject("No User Found");
            }
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject("No User Found");
      }
    } catch (err) {
      console.log(err);
      reject("Token Expired Error");
    }
  });
  return promise;
};

module.exports = getUser;
