const Joi = require('joi');
exports.adminValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      email: Joi.string().email().trim(),
      password: Joi.string().min(6).max(30).required().trim(),
    }).or('email');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
      
    });
  } else {
    next();
  }
};
exports.brandValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      brand_name: Joi.string().min(3).required().trim(),
      description: Joi.string().min(6).max(150).trim(),
      avatar: Joi.string()
    }).or('brand_name');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
      
    });
  } else {
    next();
  }
};
exports.categoryValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      category_name: Joi.string().min(3).trim().required(),
      description: Joi.string().min(6).max(150).trim(),
      avatar: Joi.string()
    }).or('category_name');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
      
    });
  } else {
    next();
  }
};
exports.orderValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      status: Joi.string().trim().required().valid('shiping','delivered'),
    }).or('status');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
      
    });
  } else {
    next();
  }
};
exports.createOrderValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      products: Joi.array().items(Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().strict().required()
      })).required(),
      deliveryDate: Joi.number().strict(),
      paymentType: Joi.string().valid("COD","EMI","NB","UPI"),
      deliveryMode:Joi.string().valid('fast',"standard"),
    });
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    return res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
      
    });
  } else {
    next();
  }
};

