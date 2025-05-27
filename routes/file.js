const express = require('express');

const router = express.Router();

const { uploadFile, getFileById, getFiles } = require('../controllers/file');
const upload = require('../middlewares/upload');
const { checkAuth } = require('../middlewares/auth');
const {
  uploadInputValidator,
  getFileByIdValidator,
  getFilesValidator,
} = require('../validators/file');

router.get('/', checkAuth, getFilesValidator, getFiles);
router.get('/:id', checkAuth, getFileByIdValidator, getFileById);
router.post(
  '/upload',
  checkAuth,
  upload.single('file'),
  uploadInputValidator,
  uploadFile
);

module.exports = router;
