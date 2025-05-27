const jwt = require('jsonwebtoken');

const createToken = (payload, expiry, secretKey) => {
  const options = { expiresIn: expiry };
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

const decodeToken = (token, secretKey) => {
  const decodedToken = jwt.verify(token, secretKey);
  return decodedToken;
};

module.exports = { createToken, decodeToken };
