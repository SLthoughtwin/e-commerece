const express = require('express');
const cors = require('cors');
const winston = require('winston');
const { port, connection, option } = require('./config/index');
// const { hbs } = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const {
  adminRoute,
  sellerRoute,
  userRoute,
  addressRoute,
  productRoute,
  brandRoute,
  categoryRoute,
  cartRoute,
  orderRoute,
  reviewRoute,
} = require('./routes/');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { logger } = require('./shared/');
const {  checkvar } = require('./config/errorhandler');
const{ errorHandler,responseHandler } = require('./config/')
const rateLimit = require('express-rate-limit');
const { dir } = require('console');
const { dirname } = require('path');
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const spacs = swaggerJsDoc(option);
const app = express();
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spacs));
app.use(limiter);
app.use(function (req, res, next) {
  res.setTimeout(12000, function () {
    console.log('Request has timed out.');
    res.status(408).json({
      message: 'Request has timed out.',
    });
  });

  next();
});
app.use(setTimeout);
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../views')));
app.use('/v1/admin', adminRoute);
app.use('/v1/seller', sellerRoute);
app.use('/v1/user', userRoute);
app.use('/v1/address/', addressRoute);
app.use('/v1/product/', productRoute);
app.use('/v1/brand', brandRoute);
app.use('/v1/category', categoryRoute);
app.use('/v1/cart/', cartRoute);
app.use('/v1/order/', orderRoute);
app.use('/v1/review/', reviewRoute);
app.use(errorHandler);
const envVariable = checkvar('PORT');
if (envVariable === undefined) {
  return logger.info(`env variable are not found`);
}
connection()
  .then((data) => {
    app.listen(port, () => {
      logger.info('connect db');
      logger.info(`connection successfull ${port}`);
    });
  })
  .catch((er) => {
    logger.info('error db is not connect');
  });
