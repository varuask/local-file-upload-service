const Joi = require('joi');
const ErrorResponse = require('../utils/ErrorResponse');

const uploadSchema = Joi.object({
  title: Joi.string().max(255).messages({
    'string.max': 'title-must-be-less-than-255-characters',
  }),
  description: Joi.string().messages({
    'string.base': 'description-must-be-a-string',
  }),
});

const getFileByIdValidatorSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'any.required': 'file-id-is-required',
    'number.base': 'file-id-must-be-a-number',
    'number.integer': 'file-id-must-be-an-integer',
    'number.positive': 'file-id-must-be-positive',
  }),
});

const getFilesValidatorSchema = Joi.object({
  page: Joi.number().integer().positive().messages({
    'number.base': 'page-must-be-a-number',
    'number.integer': 'page-must-be-an-integer',
    'number.positive': 'page-must-be-positive',
  }),
});

exports.uploadInputValidator = (req, res, next) => {
  const { error } = uploadSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return next(new ErrorResponse(400, error.message));
  }
  return next();
};

exports.getFileByIdValidator = (req, res, next) => {
  const { error } = getFileByIdValidatorSchema.validate(req.params);
  if (error) {
    return next(new ErrorResponse(400, error.message));
  }
  return next();
};

exports.getFilesValidator = (req, res, next) => {
  const { error } = getFilesValidatorSchema.validate(req.query);
  if (error) {
    return next(new ErrorResponse(400, error.message));
  }
  return next();
};
