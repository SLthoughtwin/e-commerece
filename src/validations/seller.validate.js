const Joi = require('joi');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');

(exports.signUpSellerValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      fullName: Joi.string().min(3).max(30).required().trim(),
      email: Joi.string().email().required().trim(),
      phone: Joi.number().min(10).required(),
      password: Joi.string().min(6).max(30).required().trim(),
    }).or('fullName', 'email', 'phone');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
}),
  (exports.loginsellerValidation = (req, res, next) => {
    const loginUser = (user) => {
      const JoiSchema = Joi.object({
        phone: Joi.string().trim(),
        email: Joi.string().email().min(5).max(50).trim(),
        password: Joi.string().trim(),
      }).or('phone', 'email');
      return JoiSchema.validate(user);
    };
    const response = loginUser(req.body);
    if (response.error) {
      const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
      return next(new ApiError(400, msg));
    } else {
      next();
    }
  });


  (exports.adderssValidation = (req, res, next) => {
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        phone: Joi.number().min(10).required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        pincode: Joi.number().min(6).required(),
        landmark: Joi.string().required(),
        houseNo: Joi.string().required(),
        addressType: Joi.string().required(),
      }).or('phone');
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
      return next(new ApiError(400, msg)); 
    } else {
      next();
    }
  }),
  (exports.profileValidation = (req, res, next) => {
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        sellerId: Joi.string().required().trim(),
        GST: Joi.string()
          .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
          .trim(),
        docProve: Joi.string().required().trim(),
      }).or('sellerId');
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
      return next(new ApiError(400, msg));
    } else {
      next();
    }
  });


(exports.productValidation = (req, res, next) => {
  const payment = req.body.paymentType?.split(',');
  req.body.paymentType = payment;
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      title: Joi.string().min(3).max(30).required().trim(),
      price: Joi.number().required(),
      categoryId: Joi.string().required().trim(),
      brandId: Joi.string().required().trim(),
      paymentType: Joi.array().items(
        Joi.string().valid('COD').valid('NB').valid('UPI'),
      ),
      description: Joi.string().max(200).trim(),
      avatar: Joi.string(),
      rateing: Joi.string(),
    }).or('categoryId', 'brandId');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
}),
  (exports.productUpdateValidation = (req, res, next) => {
    const payment = req.body.paymentType.split(',');
    req.body.paymentType = payment;
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        title: Joi.string().min(3).max(30),
        price: Joi.number(),
        categoryId: Joi.string(),
        brandId: Joi.string(),
        description: Joi.string().max(200),
        paymentType: Joi.array().items(
          Joi.string().valid('COD').valid('NB').valid('UPI'),
        ),
        rateing: Joi.string(),
      });
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
      return next(new ApiError(400, msg)); 
    } else {
      next();
    }
  });

exports.addCartValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      products: Joi.array().items(
        Joi.object({
          productId: Joi.string().hex().length(24),
          quantity: Joi.number().strict(),
        }),
      ),
    }).or('products');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
};

exports.incrementCartValidation = (req, res, next) => {
  req.body.id = req.params.id;
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      id: Joi.string().hex().length(24),
      value: Joi.string().required().valid('increment', 'decrement'),
    });
    return JoiSchema.validate(user);
  };
  const response = validateUser(req.query);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
};


exports.reviewValidation = (req, res, next) => {
  req.body.productId = req.params.id;
  const JoiSchema = Joi.object({
    productId: Joi.string()
      .hex()
      .length(24)
      .messages({ 'string.hex': 'id must be correct format' })
      .required(),
    comments: Joi.string().min(6).max(150).required(),
    rating: Joi.number().min(1).max(5).required(),
    avatar: Joi.string(),
  });
  const response = JoiSchema.validate(req.body);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
};

exports.reviewDeleteValidation = (req, res, next) => {
  req.body.reviewId = req.params.id;
  const JoiSchema = Joi.object({
    reviewId: Joi.string()
      .hex()
      .length(24)
      .messages({ 'string.hex': 'id must be correct format' })
      .required(),
  });
  const response = JoiSchema.validate(req.body);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
};

exports.editReviewValidation = (req, res, next) => {
  req.body.reviewId = req.params.id;
  const JoiSchema = Joi.object({
    reviewId: Joi.string()
      .hex()
      .length(24)
      .messages({ 'string.hex': 'id must be correct format' })
      .required(),
    comments: Joi.string().min(6).max(300),
    rating: Joi.number().min(1).max(5),
    avatar: Joi.string(),
  });
  const response = JoiSchema.validate(req.body);
  if (response.error) {
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
};

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
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
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
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
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
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
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
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
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
    const msg = response.error.details[0].message.replace(/[^a-zA-Z0-9]/g, ' ');
    return next(new ApiError(400, msg));
  } else {
    next();
  }
};

