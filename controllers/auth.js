const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken } = require('../helpers/jwtHelpers');
const ErrorResponse = require('../utils/ErrorResponse');

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'password'],
    });
    if (!user) {
      return next(new ErrorResponse(400, 'invalid-credentials'));
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new ErrorResponse(400, 'invalid-credentials'));
    }
    const { id } = user;
    const tokenPayload = { id };
    const sessionToken = createToken(
      tokenPayload,
      process.env.SESS_PASSWORD_EXPIRY,
      process.env.SESS_PASSWORD_SECRET
    );
    res.status(200).json({
      data: {
        token: sessionToken,
      },
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorResponse(500, 'internal-server-error'));
  }
};
