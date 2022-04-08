const Joi = require('joi');
exports.adminValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      email: Joi.string().email().trim(),
      password: Joi.string().required().trim(),
    }).or('email');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      message: response.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    next();
  }
};
exports.brandValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      brand_name: Joi.string().required().trim(),
      description: Joi.string().trim(),
      logo: Joi.string()
    }).or('brand_name');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      message: response.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    next();
  }
};
exports.categoryValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      category_name: Joi.string().trim().required(),
      description: Joi.string().trim(),
      logo: Joi.string()
    }).or('category_name');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      message: response.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    next();
  }
};
