const express = require('express');
const cors = require('cors');
const winston = require('winston');
const fileupload = require('express-fileupload')
const { port, connection ,option} = require('./config/index');
const {hbs} = require("hbs");
const path = require('path')
const bodyParser = require('body-parser')
const Redis = require("ioredis");
const redis = new Redis();
const {
  adminRoute,
  sellerRoute,
  userRoute,
  addressRoute,
  productRoute,
  brandRoute,
  categoryRoute,
  cartRoute,
  orderRoute
} = require('./routes/');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { logger } = require('./shared/');
const { errorHandler, checkvar } = require('./config/errorhandler');
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	max: 10, 
	standardHeaders: true, 
	legacyHeaders: false, 
})

const spacs = swaggerJsDoc(option);
const app = express();
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spacs));
app.use(limiter)
app.use(function(req, res, next){
  res.setTimeout(12000, function(){
      console.log('Request has timed out.');
          res.status(408).json({
            message : "Request has timed out.",
            success: false
          });
      });

  next();
});
app.use(setTimeout)
app.use(express.urlencoded({ extended: false }));
app.use(cors({origin:"http://localhost:3000"}));
app.use(express.json())
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../views')));
app.use('/auth/admin', adminRoute);
app.use('/auth/seller', sellerRoute);
app.use('/auth/user', userRoute);
app.use('/user/address/', addressRoute);
app.use('/v1/product/',productRoute);
app.use('/v1/brand',brandRoute)
app.use('/v1/category',categoryRoute)
app.use('/v1/cart/',cartRoute)
app.use('/v1/order/',orderRoute)



app.use((req, res, next) => {
  const error = new Error('not found');
  error.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

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
