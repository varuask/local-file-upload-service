const Joi = require('joi');
const ErrorResponse = require('../utils/ErrorResponse');

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'email-is-required',
      'string.email': 'email-is-not-valid',
    }),
  password: Joi.string().min(5).required().messages({
    'string.empty': 'password-is-required',
    'string.min': 'password-atleast-be-5-characters',
  }),
});

exports.loginInputValidator = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse(400, 'request-body-is-empty'));
  }
  const { error } = loginSchema.validate(req.body, { abortEarly: true });
  if (error) {
    console.error(error);
    return next(new ErrorResponse(400, error.message));
  }
  return next();
};
