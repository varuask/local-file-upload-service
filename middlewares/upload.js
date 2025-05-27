const multer = require('multer');
//const ErrorResponse = require('../helpers/ErrorResponse');

const storage = multer.memoryStorage();

const limits = {
  fileSize: 10 * 1024 * 1024,
};

const upload = multer({ storage, limits });

module.exports = upload;
