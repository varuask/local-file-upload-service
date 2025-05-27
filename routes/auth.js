const express = require('express');

const router = express.Router();

const { loginUser } = require('../controllers/auth');
const { loginInputValidator } = require('../validators/auth');

router.post('/login', loginInputValidator, loginUser);

module.exports = router;
