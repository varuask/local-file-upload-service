const { decodeToken } = require('../helpers/jwtHelpers');
const ErrorResponse = require('../utils/ErrorResponse');

exports.checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('jwt must be provided');
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = decodeToken(token, process.env.SESS_PASSWORD_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    if (err.message === 'jwt expired') {
      return next(new ErrorResponse(401, 'login-again-required'));
    }
    if (
      err.message === 'jwt malformed' ||
      err.message === 'invalid signature' ||
      err.message === 'invalid token'
    ) {
      return next(new ErrorResponse(401, 'you-gotta-login-again'));
    }
    if (err.message === 'jwt must be provided') {
      return next(new ErrorResponse(401, 'user-not-logged-in'));
    }
    return next(new ErrorResponse(500, 'internal-server-error'));
  }
};
